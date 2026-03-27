import { getBotConsoleLines } from "@/lib/discord-bots/runtime/service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const botId = url.searchParams.get('botId') || '';
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      if (!botId) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'botId is required' })}\n\n`));
        controller.close();
        return;
      }

      const interval = setInterval(async () => {
        const lines = await getBotConsoleLines(botId);
        controller.enqueue(encoder.encode(`event: logs\ndata: ${JSON.stringify({ lines, ts: new Date().toISOString() })}\n\n`));
      }, 3000);

      controller.enqueue(encoder.encode(`event: open\ndata: ${JSON.stringify({ ok: true })}\n\n`));

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
