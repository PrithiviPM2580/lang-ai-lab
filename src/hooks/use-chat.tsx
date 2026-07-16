import { useState } from "react";

type Message = {
	role: "user" | "assistant";
	content: string;
	reasoning?: string;
};

type StreamEvent =
	| {
			type: "text";
			content: string;
	  }
	| {
			type: "reasoning";
			content: string;
	  };

export function useChatStream(url: string, method: "POST" | "GET" = "POST") {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	async function sendMessage(message: string) {
		setMessages((prev) => [
			...prev,
			{
				role: "user",
				content: message,
			},
			{
				role: "assistant",
				content: "",
			},
		]);

		setIsLoading(true);

		const response = await fetch(url, {
			method,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				message,
			}),
		});

		const reader = response.body?.getReader();

		if (!reader) {
			setIsLoading(false);
			return;
		}

		const decoder = new TextDecoder();

		let buffer = "";

		while (true) {
			const { done, value } = await reader.read();

			if (done) break;

			buffer += decoder.decode(value, {
				stream: true,
			});

			const events = buffer.split("\n\n");

			buffer = events.pop() ?? "";

			for (const eventString of events) {
				if (!eventString.startsWith("data:")) continue;

				const json = eventString.replace("data:", "").trim();

				const event: StreamEvent = JSON.parse(json);

				setMessages((prev) =>
					prev.map((msg, index) => {
						if (index !== prev.length - 1) {
							return msg;
						}

						if (event.type === "reasoning") {
							return {
								...msg,
								reasoning: (msg.reasoning ?? "") + event.content,
							};
						}

						if (event.type === "text") {
							return {
								...msg,
								content: msg.content + event.content,
							};
						}

						return msg;
					}),
				);
			}
		}

		setIsLoading(false);
	}

	return {
		messages,
		sendMessage,
		isLoading,
	};
}
