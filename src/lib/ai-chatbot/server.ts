import { agent } from "./agent";

export async function chatWithAgent(message: string) {
	const stream = await agent.stream(
		{
			messages: [{ role: "user", content: message }],
		},
		{
			encoding: "text/event-stream",
			streamMode: ["values", "messages", "updates"],
			recursionLimit: 3,
		},
	);

	return new Response(stream, {
		headers: { "Content-Type": "text/event-stream" },
	});
}
