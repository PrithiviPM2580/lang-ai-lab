import { agent } from "./agent";

export async function chatWithAgent(query: string) {
	const response = await agent.invoke({
		messages: [{ role: "human", content: query }],
	});
	return response.messages.at(-1)?.content;
}
