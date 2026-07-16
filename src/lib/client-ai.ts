import { Client } from "@langchain/langgraph-sdk";

export const client = new Client({
	apiKey: process.env.LANGSMITH_API_KEY,
	apiUrl: process.env.BASE_URL,
});
