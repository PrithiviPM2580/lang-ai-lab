import { createFileRoute } from "@tanstack/react-router";
import { chatWithAgent } from "#/lib/ai-chatbot/server";

export const Route = createFileRoute("/api/ai-chatbot")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = await request.json();
				const response = await chatWithAgent(body.query);

				return Response.json({
					response,
				});
			},
		},
	},
	component: ChatbotPage, // ← this makes it visitable in browser
});

function ChatbotPage() {
	return <div>Chatbot Page</div>;
}
