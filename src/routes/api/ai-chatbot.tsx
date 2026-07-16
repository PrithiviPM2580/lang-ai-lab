import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useChatStream } from "#/hooks/use-chat";
import { agent } from "#/lib/ai-chatbot/see/agent";
import { createSSEStreamResponse } from "#/lib/sse-response";

import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";

import {
	Message,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ai-elements/reasoning";

const requestBodySchema = z.object({
	message: z.string().min(1),
});

export const Route = createFileRoute("/api/ai-chatbot")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = await request.json();

				const { message } = requestBodySchema.parse(body);

				const stream = await agent.stream(
					{
						messages: [
							{
								role: "human",
								content: message,
							},
						],
					},
					{
						streamMode: "messages",
						configurable: {
							thread_id: "user123",
						},
					},
				);

				return createSSEStreamResponse(stream, {
					transform: ([chunk]) => {
						const reasoning = chunk.additional_kwargs?.reasoning_content;

						if (reasoning) {
							return {
								type: "reasoning",
								content: String(reasoning),
							};
						}

						if (typeof chunk.content === "string" && chunk.content) {
							return {
								type: "text",
								content: chunk.content,
							};
						}

						return null;
					},
				});
			},
		},
	},

	component: ChatPage,
});

function ChatPage() {
	const stream = useChatStream("/api/ai-chatbot");

	return (
		<div className="flex flex-col h-dvh">
			<Conversation className="flex-1">
				<ConversationContent>
					{stream.messages.map((msg, i) => {
						if (msg.role === "user") {
							return (
								<Message key={i} from="user">
									<MessageContent>{msg.content}</MessageContent>
								</Message>
							);
						}

						if (msg.role === "assistant") {
							return (
								<div key={i}>
									{msg.reasoning && (
										<Reasoning>
											<ReasoningTrigger />

											<ReasoningContent>{msg.reasoning}</ReasoningContent>
										</Reasoning>
									)}

									<Message from="assistant">
										<MessageContent>
											<MessageResponse>{msg.content}</MessageResponse>
										</MessageContent>
									</Message>
								</div>
							);
						}

						return null;
					})}
				</ConversationContent>

				<ConversationScrollButton />
			</Conversation>

			<PromptInput
				onSubmit={({ text }) => {
					stream.sendMessage(text);
				}}
			>
				<PromptInputBody>
					<PromptInputTextarea placeholder="Ask something..." />
				</PromptInputBody>

				<PromptInputFooter>
					<PromptInputSubmit
						status={stream.isLoading ? "streaming" : "ready"}
					/>
				</PromptInputFooter>
			</PromptInput>
		</div>
	);
}
