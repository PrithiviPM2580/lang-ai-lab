type SSEEvent =
	| {
			type: "text";
			content: string;
	  }
	| {
			type: "reasoning";
			content: string;
	  };

type StreamOptions<T> = {
	transform?: (chunk: T) => SSEEvent | null;
};

export function createSSEStreamResponse<T>(
	stream: AsyncIterable<T>,
	options?: StreamOptions<T>,
) {
	const encoder = new TextEncoder();

	return new Response(
		new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of stream) {
						const value = options?.transform ? options.transform(chunk) : chunk;

						if (!value) continue;

						controller.enqueue(
							encoder.encode(`data: ${JSON.stringify(value)}\n\n`),
						);
					}

					controller.close();
				} catch (error) {
					controller.error(error);
				}
			},
		}),
		{
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		},
	);
}
