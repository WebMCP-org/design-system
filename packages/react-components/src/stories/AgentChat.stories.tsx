import type { Meta, StoryObj } from "@storybook/react-vite";
import { AgentChat, type AgentChatMessage } from "../components/AgentChat";

const meta = {
  title: "Components/AgentChat",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const messages: AgentChatMessage[] = [
  {
    id: "u1",
    role: "user",
    parts: [{ type: "text", text: "Read the package manifest and suggest the next check." }],
  },
  {
    id: "a1",
    role: "assistant",
    parts: [
      {
        type: "reasoning",
        text: "The user is asking for repo guidance. I should inspect available scripts first.",
        state: "done",
      },
      {
        type: "tool-read",
        state: "output-available",
        toolCallId: "call-read-package-json",
        input: { path: "package.json" },
        output: { scripts: ["check", "test", "test:storybook"] },
      },
      {
        type: "text",
        text: "Run `vp check` first, then `vp test`, then `vp run test:storybook`.",
      },
    ],
  },
];

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "min(48rem, 92vw)",
        height: "34rem",
        border:
          "var(--sigvelo-border-style) var(--sigvelo-border-width) var(--sigvelo-color-neutral-border-subtle)",
        borderRadius: "var(--sigvelo-radius-md)",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Frame>
      <AgentChat messages={messages} onSubmit={() => undefined} />
    </Frame>
  ),
};

export const Empty: Story = {
  render: () => (
    <Frame>
      <AgentChat messages={[]} onSubmit={() => undefined} />
    </Frame>
  ),
};
