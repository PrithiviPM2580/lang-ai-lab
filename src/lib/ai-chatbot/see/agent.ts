import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { prompt } from "#/lib/ai-chatbot/promt";
import { openRouterModel } from "../model";

export const agent = createAgent({
	model: openRouterModel,
	tools: [],
	checkpointer: new MemorySaver(),
	systemPrompt: prompt,
});
