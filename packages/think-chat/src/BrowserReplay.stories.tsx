import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserReplay } from "./BrowserReplay";

const START = 1_700_000_000_000;

const BROWSER_RECORDING_TAB: unknown[] = [
  {
    type: 4,
    data: { href: "https://example.com/workspace", width: 1200, height: 750 },
    timestamp: START,
  },
  {
    type: 2,
    data: {
      node: {
        id: 1,
        type: 0,
        childNodes: [
          { id: 2, type: 1, name: "html", publicId: "", systemId: "" },
          {
            id: 3,
            type: 2,
            tagName: "html",
            attributes: { lang: "en" },
            childNodes: [
              {
                id: 4,
                type: 2,
                tagName: "head",
                attributes: {},
                childNodes: [
                  {
                    id: 5,
                    type: 2,
                    tagName: "style",
                    attributes: {},
                    childNodes: [
                      {
                        id: 6,
                        type: 3,
                        textContent:
                          "body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f8fafc;color:#111827}main{display:grid;place-content:center;min-height:100vh}.panel{width:520px;border:1px solid #d1d5db;border-radius:12px;background:white;box-shadow:0 20px 60px rgba(15,23,42,.12);padding:28px}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#64748b}.title{margin:8px 0 10px;font-size:28px;line-height:1.1}.body{margin:0 0 22px;color:#475569;line-height:1.55}.button{display:inline-flex;border:0;border-radius:8px;background:#111827;color:white;padding:10px 14px;font-weight:650}",
                      },
                    ],
                  },
                ],
              },
              {
                id: 7,
                type: 2,
                tagName: "body",
                attributes: {},
                childNodes: [
                  {
                    id: 8,
                    type: 2,
                    tagName: "main",
                    attributes: {},
                    childNodes: [
                      {
                        id: 9,
                        type: 2,
                        tagName: "section",
                        attributes: { class: "panel" },
                        childNodes: [
                          {
                            id: 10,
                            type: 2,
                            tagName: "div",
                            attributes: { class: "eyebrow" },
                            childNodes: [{ id: 11, type: 3, textContent: "Browser Run" }],
                          },
                          {
                            id: 12,
                            type: 2,
                            tagName: "h1",
                            attributes: { class: "title" },
                            childNodes: [{ id: 13, type: 3, textContent: "Replay recording" }],
                          },
                          {
                            id: 14,
                            type: 2,
                            tagName: "p",
                            attributes: { class: "body" },
                            childNodes: [
                              {
                                id: 15,
                                type: 3,
                                textContent:
                                  "This fixture is plain rrweb JSON, matching one targetId entry from BrowserRecording.events.",
                              },
                            ],
                          },
                          {
                            id: 16,
                            type: 2,
                            tagName: "button",
                            attributes: { class: "button" },
                            childNodes: [{ id: 17, type: 3, textContent: "Approve handoff" }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      initialOffset: { top: 0, left: 0 },
    },
    timestamp: START + 50,
  },
  {
    type: 3,
    data: { source: 1, positions: [{ x: 594, y: 472, id: 16, timeOffset: 0 }] },
    timestamp: START + 900,
  },
  {
    type: 3,
    data: { source: 2, type: 2, id: 16, x: 594, y: 472 },
    timestamp: START + 1400,
  },
];

const meta = {
  title: "Packages/Browser Replay",
  component: BrowserReplay,
  args: {
    autoPlay: false,
    events: [],
  },
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BrowserReplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    events: BROWSER_RECORDING_TAB,
  },
  render: (args) => (
    <div style={{ width: "min(54rem, 92vw)" }}>
      <BrowserReplay {...args} />
    </div>
  ),
};

export const Empty: Story = {
  render: (args) => (
    <div style={{ width: "min(54rem, 92vw)" }}>
      <BrowserReplay {...args} />
    </div>
  ),
};
