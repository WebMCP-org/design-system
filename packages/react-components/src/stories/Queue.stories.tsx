import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { Button } from "../components/Button";
import {
  Queue,
  QueueItem,
  QueueItemActions,
  QueueItemAttachment,
  QueueItemContent,
  QueueItemDescription,
  QueueItemFile,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "../components/Queue";
import { XIcon } from "../components/_internal/icons";

const meta = {
  title: "Components/Queue",
  component: Queue,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Queue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Agent work queue",
  parameters: {
    docs: {
      description: {
        story: "Grouped todos and attachments with active, pending, and complete status rows.",
      },
    },
  },
  render: () => (
    <div style={{ width: "28rem" }}>
      <Queue>
        <QueueSection>
          <QueueSectionTrigger>
            <QueueSectionLabel count={3}>Todos</QueueSectionLabel>
          </QueueSectionTrigger>
          <QueueSectionContent>
            <QueueList>
              <QueueItem status="complete">
                <QueueItemIndicator status="complete" />
                <QueueItemContent>Draft response to the user</QueueItemContent>
              </QueueItem>
              <QueueItem status="active">
                <QueueItemIndicator status="active" />
                <QueueItemContent>
                  Search the web for sources
                  <QueueItemDescription>
                    Looking across the last 24 hours of news results
                  </QueueItemDescription>
                </QueueItemContent>
              </QueueItem>
              <QueueItem status="pending">
                <QueueItemIndicator status="pending" />
                <QueueItemContent>Summarize the findings</QueueItemContent>
                <QueueItemActions>
                  <Button variant="ghost" size="icon" aria-label="Remove" onClick={fn()}>
                    <XIcon />
                  </Button>
                </QueueItemActions>
              </QueueItem>
            </QueueList>
          </QueueSectionContent>
        </QueueSection>

        <QueueSection>
          <QueueSectionTrigger>
            <QueueSectionLabel count={2}>Attachments</QueueSectionLabel>
          </QueueSectionTrigger>
          <QueueSectionContent>
            <QueueList>
              <QueueItem>
                <QueueItemIndicator />
                <QueueItemContent>
                  brief.pdf
                  <QueueItemAttachment>
                    <QueueItemFile name="brief.pdf" size="238 KB" />
                  </QueueItemAttachment>
                </QueueItemContent>
              </QueueItem>
              <QueueItem>
                <QueueItemIndicator />
                <QueueItemContent>
                  data.csv
                  <QueueItemAttachment>
                    <QueueItemFile name="data.csv" size="1.4 MB" />
                  </QueueItemAttachment>
                </QueueItemContent>
              </QueueItem>
            </QueueList>
          </QueueSectionContent>
        </QueueSection>
      </Queue>
    </div>
  ),
};

export const CollapsedSection: Story = {
  name: "Collapsed history",
  parameters: {
    docs: {
      description: {
        story: "Keeps completed work available without making it the primary focus.",
      },
    },
  },
  render: () => (
    <div style={{ width: "28rem" }}>
      <Queue>
        <QueueSection defaultOpen>
          <QueueSectionTrigger>
            <QueueSectionLabel count={1}>Active</QueueSectionLabel>
          </QueueSectionTrigger>
          <QueueSectionContent>
            <QueueList>
              <QueueItem status="active">
                <QueueItemIndicator status="active" />
                <QueueItemContent>Running tests</QueueItemContent>
              </QueueItem>
            </QueueList>
          </QueueSectionContent>
        </QueueSection>
        <QueueSection defaultOpen={false}>
          <QueueSectionTrigger>
            <QueueSectionLabel count={4}>Completed</QueueSectionLabel>
          </QueueSectionTrigger>
          <QueueSectionContent>
            <QueueList>
              <QueueItem status="complete">
                <QueueItemIndicator status="complete" />
                <QueueItemContent>Setup project</QueueItemContent>
              </QueueItem>
              <QueueItem status="complete">
                <QueueItemIndicator status="complete" />
                <QueueItemContent>Install deps</QueueItemContent>
              </QueueItem>
            </QueueList>
          </QueueSectionContent>
        </QueueSection>
      </Queue>
    </div>
  ),
};

export const VercelCompatibleProps: Story = {
  name: "Vercel-compatible props",
  parameters: {
    docs: {
      description: {
        story:
          "Compatibility aliases for AI Elements-style queue props while using Sigvelo styles.",
      },
    },
  },
  render: () => (
    <div style={{ width: "28rem" }}>
      <Queue>
        <QueueSection>
          <QueueSectionTrigger>
            <QueueSectionLabel count={2} label="todos" icon={<span aria-hidden="true">*</span>} />
          </QueueSectionTrigger>
          <QueueSectionContent>
            <QueueList>
              <QueueItem status="completed">
                <QueueItemIndicator completed />
                <QueueItemContent completed>
                  Completed item
                  <QueueItemDescription completed>Already handled</QueueItemDescription>
                </QueueItemContent>
              </QueueItem>
              <QueueItem>
                <QueueItemIndicator />
                <QueueItemContent>
                  Attachment
                  <QueueItemAttachment>
                    <QueueItemFile>brief.pdf</QueueItemFile>
                  </QueueItemAttachment>
                </QueueItemContent>
              </QueueItem>
            </QueueList>
          </QueueSectionContent>
        </QueueSection>
      </Queue>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("2 todos")).toBeInTheDocument();
    await expect(canvas.getByText("Completed item")).toBeInTheDocument();
    await expect(canvas.getByText("brief.pdf")).toBeInTheDocument();
  },
};
