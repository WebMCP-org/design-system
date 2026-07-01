import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";
import { Combobox } from "../components/Combobox";

const meta = {
  title: "Components/Combobox",
  component: Combobox.Root,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Base UI Combobox wrapped with Sigvelo class names and CSS-token styling. Use it for bounded selection with search; use Autocomplete when free text remains valid.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Combobox.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface Fruit {
  label: string;
  value: string;
}

const fruits: Fruit[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
  { label: "Cherry", value: "cherry" },
  { label: "Grape", value: "grape" },
  { label: "Lemon", value: "lemon" },
  { label: "Mango", value: "mango" },
  { label: "Orange", value: "orange" },
  { label: "Peach", value: "peach" },
  { label: "Strawberry", value: "strawberry" },
];

export const Default: Story = {
  name: "Fruit picker",
  parameters: {
    docs: {
      description: {
        story:
          "Single-select combobox with trigger, popup, list items, and selected-item indicator.",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid var(--sigvelo-color-neutral-border-muted)",
        borderRadius: "var(--sigvelo-radius-md)",
        width: "240px",
      }}
    >
      <Combobox.Root items={fruits}>
        <Combobox.Input placeholder="Select a fruit..." aria-label="Select a fruit" />
        <Combobox.Trigger aria-label="Open fruit list">
          <ChevronDownIcon />
        </Combobox.Trigger>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4}>
            <Combobox.Popup>
              <Combobox.List>
                {(item: Fruit) => (
                  <Combobox.Item value={item} key={item.value}>
                    <Combobox.ItemIndicator>
                      <CheckIcon />
                    </Combobox.ItemIndicator>
                    {item.label}
                  </Combobox.Item>
                )}
              </Combobox.List>
              <Combobox.Empty>No fruits found</Combobox.Empty>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText("Open fruit list"));
    await expect(await screen.findByText("Apple")).toBeInTheDocument();
    await expect(screen.getByText("Banana")).toBeInTheDocument();
  },
};

interface Country {
  label: string;
  value: string;
  region: string;
}

const countries: Country[] = [
  { label: "United States", value: "us", region: "Americas" },
  { label: "Canada", value: "ca", region: "Americas" },
  { label: "Mexico", value: "mx", region: "Americas" },
  { label: "United Kingdom", value: "uk", region: "Europe" },
  { label: "Germany", value: "de", region: "Europe" },
  { label: "France", value: "fr", region: "Europe" },
  { label: "Japan", value: "jp", region: "Asia" },
  { label: "China", value: "cn", region: "Asia" },
  { label: "India", value: "in", region: "Asia" },
];

export const WithGroups: Story = {
  name: "Grouped country picker",
  parameters: {
    docs: {
      description: {
        story: "Groups options by region while preserving Base UI listbox keyboard behavior.",
      },
    },
  },
  render: () => {
    const groupedCountries = countries.reduce(
      (acc, country) => {
        if (!acc[country.region]) {
          acc[country.region] = [];
        }
        acc[country.region].push(country);
        return acc;
      },
      {} as Record<string, Country[]>,
    );

    const groups = Object.entries(groupedCountries).map(([region, items]) => ({
      value: region,
      items,
    }));

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid var(--sigvelo-color-neutral-border-muted)",
          borderRadius: "var(--sigvelo-radius-md)",
          width: "240px",
        }}
      >
        <Combobox.Root items={groups}>
          <Combobox.Input placeholder="Select a country..." aria-label="Select a country" />
          <Combobox.Trigger aria-label="Open country list">
            <ChevronDownIcon />
          </Combobox.Trigger>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={4}>
              <Combobox.Popup>
                <Combobox.List>
                  {(group: { value: string; items: Country[] }) => (
                    <Combobox.Group items={group.items} key={group.value}>
                      <Combobox.GroupLabel>{group.value}</Combobox.GroupLabel>
                      {group.items.map((country) => (
                        <Combobox.Item value={country} key={country.value}>
                          <Combobox.ItemIndicator>
                            <CheckIcon />
                          </Combobox.ItemIndicator>
                          {country.label}
                        </Combobox.Item>
                      ))}
                    </Combobox.Group>
                  )}
                </Combobox.List>
                <Combobox.Empty>No countries found</Combobox.Empty>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText("Open country list"));

    await expect(await screen.findByText("Americas")).toBeInTheDocument();
    await expect(screen.getByText("Europe")).toBeInTheDocument();
    await expect(screen.getByText("Asia")).toBeInTheDocument();
  },
};

export const WithDefaultValue: Story = {
  name: "Default value",
  parameters: {
    docs: {
      description: {
        story:
          "Starts with a selected item while still allowing the user to search and replace it.",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid var(--sigvelo-color-neutral-border-muted)",
        borderRadius: "var(--sigvelo-radius-md)",
        width: "240px",
      }}
    >
      <Combobox.Root items={fruits} defaultValue={fruits[2]}>
        <Combobox.Input placeholder="Select a fruit..." aria-label="Select a fruit" />
        <Combobox.Trigger aria-label="Open fruit list">
          <ChevronDownIcon />
        </Combobox.Trigger>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4}>
            <Combobox.Popup>
              <Combobox.List>
                {(item: Fruit) => (
                  <Combobox.Item value={item} key={item.value}>
                    <Combobox.ItemIndicator>
                      <CheckIcon />
                    </Combobox.ItemIndicator>
                    {item.label}
                  </Combobox.Item>
                )}
              </Combobox.List>
              <Combobox.Empty>No fruits found</Combobox.Empty>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  ),
};

export const FormField: Story = {
  render: () => (
    <div style={{ width: "280px" }}>
      <label
        id="fruit-label"
        style={{
          display: "block",
          marginBottom: "0.5rem",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        Favorite Fruit
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid var(--sigvelo-color-neutral-border-muted)",
          borderRadius: "var(--sigvelo-radius-md)",
        }}
      >
        <Combobox.Root items={fruits}>
          <Combobox.Input placeholder="Select a fruit..." aria-labelledby="fruit-label" />
          <Combobox.Trigger aria-label="Open fruit list">
            <ChevronDownIcon />
          </Combobox.Trigger>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={4}>
              <Combobox.Popup>
                <Combobox.List>
                  {(item: Fruit) => (
                    <Combobox.Item value={item} key={item.value}>
                      <Combobox.ItemIndicator>
                        <CheckIcon />
                      </Combobox.ItemIndicator>
                      {item.label}
                    </Combobox.Item>
                  )}
                </Combobox.List>
                <Combobox.Empty>No fruits found</Combobox.Empty>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </div>
      <p
        style={{
          marginTop: "0.5rem",
          fontSize: "0.75rem",
          color: "var(--sigvelo-color-text-muted)",
        }}
      >
        Choose your favorite fruit from the list.
      </p>
    </div>
  ),
};
