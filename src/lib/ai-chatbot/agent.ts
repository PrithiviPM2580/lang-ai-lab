import { createAgent } from "langchain";
import { openRouterModel } from "./model";

export const agent = createAgent({
	model: openRouterModel,
	tools: [],
});
