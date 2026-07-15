import { ChatOpenRouter } from "@langchain/openrouter";

export const openRouterModel = new ChatOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
	model: "nvidia/nemotron-3-ultra-550b-a55b:free",
});
