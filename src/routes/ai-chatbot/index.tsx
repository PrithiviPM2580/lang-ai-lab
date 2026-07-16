/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { useStream } from "@langchain/react";
import { createFileRoute } from "@tanstack/react-router";
import { AIMessage, HumanMessage } from "langchain";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "#/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "#/components/ai-elements/message";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
} from "#/components/ai-elements/prompt-input";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "#/components/ai-elements/reasoning";
import {
	Tool,
	ToolContent,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from "#/components/ai-elements/tool";
import type { agent } from "#/lib/ai-chatbot/langraph/agent";

export const Route = createFileRoute("/ai-chatbot/")({
	component: RouteComponent,
});

function RouteComponent() {
	const stream = useStream<typeof agent>({
		apiUrl: "http://localhost:2024",
		assistantId: "ai-chatbot",
	});

	function getReasoningText(msg: AIMessage) {
		return (
			msg.contentBlocks.find((block) => block.type === "reasoning")
				?.reasoning ?? ""
		);
	}

	function getTextContent(msg: AIMessage) {
		return msg.text;
	}

	function getToolCalls(msg: AIMessage) {
		return (msg.tool_calls ?? []).map((tc) => ({
			id: tc.id,
			name: tc.name,
			args: tc.args,
			state: "input-available" as const,
		}));
	}
	return (
		<div className="flex flex-col h-dvh">
			<Conversation className="flex-1">
				<ConversationContent>
					{stream.messages.map((msg, i) => {
						if (HumanMessage.isInstance(msg)) {
							return (
								<Message key={i} from="user">
									<MessageContent>{msg.text}</MessageContent>
								</Message>
							);
						}
						if (AIMessage.isInstance(msg)) {
							return (
								<div key={i}>
									{/* Reasoning block (shows when model emits thinking tokens) */}
									<Reasoning>
										<ReasoningTrigger />
										<ReasoningContent>{getReasoningText(msg)}</ReasoningContent>
									</Reasoning>

									{/* Inline tool calls with input/output display */}
									{getToolCalls(msg).map((tc) => (
										<Tool key={tc.id} defaultOpen>
											<ToolHeader type={`tool-${tc.name}`} state={tc.state} />
											<ToolContent>
												<ToolInput input={tc.args} />
												{tc?.state === "input-available" && (
													<ToolOutput output={tc?.args} errorText={undefined} />
												)}
											</ToolContent>
										</Tool>
									))}

									{/* Streamed text response */}
									<Message from="assistant">
										<MessageContent>
											<MessageResponse>{getTextContent(msg)}</MessageResponse>
										</MessageContent>
									</Message>
								</div>
							);
						}
					})}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			<PromptInput
				onSubmit={({ text }) =>
					stream.submit(
						{ messages: [{ type: "human", content: text }] },
						{
							config: {
								configurable: {
									thread_id: "user123",
								},
							},
						},
					)
				}
			>
				<PromptInputBody>
					<PromptInputTextarea placeholder="Ask me something..." />
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
