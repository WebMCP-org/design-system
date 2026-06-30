import type { Meta, StoryObj } from "@storybook/react";
import { AgentConnectionPanel } from "../components/AgentConnection";
import { GithubMotionMark } from "../components/GithubMotionMark";
import { NaniteScene } from "../components/NaniteScene";

const meta = {
  title: "Components/Nanites",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scenes: Story = {
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
          <span style={{ color: "var(--sigvelo-text-body)", textTransform: "capitalize" }}>
            {variant}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const GithubMotion: Story = {
  render: () => (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.75rem",
        color: "var(--sigvelo-primary-text-colorful)",
        fontWeight: "var(--sigvelo-font-weight-semibold)",
      }}
    >
      <GithubMotionMark size={22} />
      GitHub install required
    </div>
  ),
};

export const AgentConnection: Story = {
  render: () => (
    <div style={{ width: "36rem" }}>
      <AgentConnectionPanel origin="https://nanites.example.com" />
    </div>
  ),
};
