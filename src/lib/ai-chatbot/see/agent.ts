import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { openRouterModel } from "../model";

export const agent = createAgent({
	model: openRouterModel,
	tools: [],
	checkpointer: new MemorySaver(),
});
