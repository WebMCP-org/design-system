import type { Meta, StoryObj } from "@storybook/react-vite";
import { AgentConnectionPanel } from "../components/AgentConnection";
import { GithubMotionMark } from "../components/GithubMotionMark";
import { NaniteScene } from "../components/NaniteScene";

const meta = {
  title: "Components/Nanites",
  component: NaniteScene,
  subcomponents: {
    AgentConnectionPanel,
    GithubMotionMark,
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Nanites visual and connection helpers: NaniteScene for setup/status illustration, GithubMotionMark for GitHub install affordances, and AgentConnectionPanel for copyable agent connection commands.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    variant: "idle",
  },
} satisfies Meta<typeof NaniteScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scenes: Story = {
  name: "Status illustrations",
  parameters: {
    docs: {
      description: {
        story: "Reusable Nanite states for setup, working, success, and problem surfaces.",
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "1.5rem", minWidth: "32rem" }}>
      {(["idle", "helmet", "working", "celebrating", "concerned"] as const).map((variant) => (
        <div
          key={variant}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <NaniteScene variant={variant} mode="solo" title={`Nanite ${variant}`} />
          <span style={{ color: "var(--sigvelo-color-text)", textTransform: "capitalize" }}>
            {variant}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const GithubMotion: Story = {
  name: "GitHub install affordance",
  parameters: {
    docs: {
      description: {
        story: "Inline motion mark for GitHub authorization or installation prompts.",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.75rem",
        color: "var(--sigvelo-color-primary-text)",
        fontWeight: "var(--sigvelo-font-weight-semibold)",
      }}
    >
      <GithubMotionMark size={22} />
      GitHub install required
    </div>
  ),
};

export const AgentConnection: Story = {
  name: "Agent connection panel",
  parameters: {
    docs: {
      description: {
        story: "Copyable connection commands for wiring coding agents to a hosted MCP endpoint.",
      },
    },
  },
  render: () => (
    <div style={{ width: "36rem" }}>
      <AgentConnectionPanel origin="https://nanites.example.com" />
    </div>
  ),
};
