import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Activity, ActivityContent, ActivityItem, ActivityTrigger } from "../components/Activity";
import { FileIcon, SearchIcon, TerminalIcon } from "../components/_internal/icons";

const meta = {
  title: "Components/Activity",
  component: Activity,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Activity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Streaming: Story = {
  render: () => (
    <div style={{ width: "32rem" }}>
      <Activity isStreaming>
        <ActivityTrigger label="Running targeted tests" />
        <ActivityContent>
          <ActivityItem icon={<SearchIcon />}>Searched code</ActivityItem>
          <ActivityItem icon={<FileIcon />}>Edited a file</ActivityItem>
          <ActivityItem icon={<TerminalIcon />}>Ran targeted tests</ActivityItem>
        </ActivityContent>
      </Activity>
    </div>
  ),
};

export const Settled: Story = {
  render: () => (
    <div style={{ width: "32rem" }}>
      <Activity>
        <ActivityTrigger label="Worked for 12s" />
        <ActivityContent>
          <ActivityItem icon={<SearchIcon />}>Searched code</ActivityItem>
          <ActivityItem icon={<FileIcon />}>Edited a file</ActivityItem>
          <ActivityItem icon={<TerminalIcon />}>Ran targeted tests</ActivityItem>
        </ActivityContent>
      </Activity>
    </div>
  ),
};

export const Expanded: Story = {
  render: () => (
    <div style={{ width: "32rem" }}>
      <Activity defaultOpen>
        <ActivityTrigger label="Worked for 12s" />
        <ActivityContent>
          <ActivityItem icon={<SearchIcon />}>Searched code</ActivityItem>
          <ActivityItem icon={<FileIcon />}>Edited a file</ActivityItem>
          <ActivityItem icon={<TerminalIcon />}>Ran targeted tests</ActivityItem>
        </ActivityContent>
      </Activity>
    </div>
  ),
};

const LIVE_STEPS = [
  "Checked date/time",
  "Workspace overview loaded",
  "Searched code for auth call sites",
  "Edited middleware/auth.ts",
  "Ran targeted tests",
];

function LiveDemo() {
  const [count, setCount] = useState(1);
  const done = count >= LIVE_STEPS.length;

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setCount((c) => c + 1), 1200);
    return () => clearInterval(id);
  }, [done]);

  return (
    <div style={{ width: "32rem" }}>
      <Activity isStreaming={!done}>
        <ActivityTrigger label={done ? "Worked for 6s" : LIVE_STEPS[count - 1]} />
        <ActivityContent>
          {LIVE_STEPS.slice(0, count).map((step) => (
            <ActivityItem key={step}>{step}</ActivityItem>
          ))}
        </ActivityContent>
      </Activity>
    </div>
  );
}

/** Items stream in every 1.2s; the collapsed shimmer line is the latest one. */
export const LiveStreaming: Story = {
  render: () => <LiveDemo />,
};
