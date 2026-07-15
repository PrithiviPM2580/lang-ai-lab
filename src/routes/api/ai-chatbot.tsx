import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { chatWithAgent } from "#/lib/ai-chatbot/server";

const requestSchema = z.object({
	message: z.string().min(1, "Message is required"),
});

export const Route = createFileRoute("/api/ai-chatbot")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = await request.json();
				const { message } = requestSchema.parse(body);

				return chatWithAgent(message);
			},
		},
	},
	component: ChatbotPage, // ← this makes it visitable in browser
});

function ChatbotPage() {
	const [message, setMessage] = useState("");
	const [answer, setAnswer] = useState("");

	async function sendMessage() {
		const res = await fetch("/api/ai-chatbot", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				message,
			}),
		});

		const data = await res.json();

		setAnswer(data.response);
	}

	return (
		<div>
			<input value={message} onChange={(e) => setMessage(e.target.value)} />

			<Button onClick={sendMessage}>Ask</Button>

			<p>{answer}</p>
		</div>
	);
}
