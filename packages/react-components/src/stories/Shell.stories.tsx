import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Shell } from "../components/Shell";

const meta = {
  title: "Components/Shell",
  component: Shell.Root,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Shell.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const FilterIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const LayersIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const Default: Story = {
  render: () => (
    <div style={{ height: 500 }}>
      <Shell.Root heading="Map Application">
        <Shell.ActionBar>
          <Shell.Action icon={<FilterIcon />} label="Filter" />
          <Shell.Action icon={<LayersIcon />} label="Layers" />
          <Shell.Action icon={<SearchIcon />} label="Search" />
        </Shell.ActionBar>
        <Shell.Content>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--sigvelo-color-text-muted)",
              fontSize: "0.875rem",
            }}
          >
            Main content area
          </div>
        </Shell.Content>
      </Shell.Root>
    </div>
  ),
};

export const WithPanel: Story = {
  render: function WithPanel() {
    const [filterOpen, setFilterOpen] = useState(true);

    return (
      <div style={{ height: 500 }}>
        <Shell.Root heading="Map Application">
          <Shell.ActionBar>
            <Shell.Action
              icon={<FilterIcon />}
              active={filterOpen}
              onClick={() => setFilterOpen(!filterOpen)}
              label="Filter"
            />
            <Shell.Action icon={<LayersIcon />} label="Layers" />
          </Shell.ActionBar>
          <Shell.Panel heading="Filters" open={filterOpen}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label style={{ fontSize: "0.875rem", color: "var(--sigvelo-color-text)" }}>
                <input type="checkbox" defaultChecked /> Show markers
              </label>
              <label style={{ fontSize: "0.875rem", color: "var(--sigvelo-color-text)" }}>
                <input type="checkbox" /> Show boundaries
              </label>
              <label style={{ fontSize: "0.875rem", color: "var(--sigvelo-color-text)" }}>
                <input type="checkbox" defaultChecked /> Show labels
              </label>
            </div>
          </Shell.Panel>
          <Shell.Content>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--sigvelo-color-text-muted)",
                fontSize: "0.875rem",
              }}
            >
              Main content area
            </div>
          </Shell.Content>
        </Shell.Root>
      </div>
    );
  },
};

export const MultiplePanels: Story = {
  render: function MultiplePanels() {
    const [activePanel, setActivePanel] = useState<string | null>("filter");

    const toggle = (panel: string) => {
      setActivePanel(activePanel === panel ? null : panel);
    };

    return (
      <div style={{ height: 500 }}>
        <Shell.Root heading="Interactive Map">
          <Shell.ActionBar>
            <Shell.Action
              icon={<FilterIcon />}
              active={activePanel === "filter"}
              onClick={() => toggle("filter")}
              label="Filter"
            />
            <Shell.Action
              icon={<LayersIcon />}
              active={activePanel === "layers"}
              onClick={() => toggle("layers")}
              label="Layers"
            />
            <Shell.Action
              icon={<SearchIcon />}
              active={activePanel === "search"}
              onClick={() => toggle("search")}
              label="Search"
            />
          </Shell.ActionBar>
          <Shell.Panel heading="Filters" open={activePanel === "filter"}>
            <p
              style={{ margin: 0, fontSize: "0.875rem", color: "var(--sigvelo-color-text-muted)" }}
            >
              Filter controls go here.
            </p>
          </Shell.Panel>
          <Shell.Panel heading="Layers" open={activePanel === "layers"}>
            <p
              style={{ margin: 0, fontSize: "0.875rem", color: "var(--sigvelo-color-text-muted)" }}
            >
              Layer toggles go here.
            </p>
          </Shell.Panel>
          <Shell.Panel heading="Search" open={activePanel === "search"}>
            <input
              type="text"
              placeholder="Search locations..."
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid var(--sigvelo-color-neutral-border-muted)",
                borderRadius: "var(--sigvelo-radius-md)",
                fontSize: "0.875rem",
                background: "var(--sigvelo-color-canvas)",
                color: "var(--sigvelo-color-text)",
                boxSizing: "border-box",
              }}
            />
          </Shell.Panel>
          <Shell.Content>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--sigvelo-color-text-muted)",
                fontSize: "0.875rem",
              }}
            >
              Map content
            </div>
          </Shell.Content>
        </Shell.Root>
      </div>
    );
  },
};

export const NoHeader: Story = {
  render: () => (
    <div style={{ height: 400 }}>
      <Shell.Root>
        <Shell.ActionBar>
          <Shell.Action icon={<FilterIcon />} label="Filter" />
          <Shell.Action icon={<LayersIcon />} label="Layers" />
        </Shell.ActionBar>
        <Shell.Content>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--sigvelo-color-text-muted)",
              fontSize: "0.875rem",
            }}
          >
            Shell without a header
          </div>
        </Shell.Content>
      </Shell.Root>
    </div>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <div style={{ height: 400 }}>
      <Shell.Root heading="Minimal Shell">
        <Shell.Content>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--sigvelo-color-text-muted)",
              fontSize: "0.875rem",
            }}
          >
            Content only — no action bar or panel
          </div>
        </Shell.Content>
      </Shell.Root>
    </div>
  ),
};
