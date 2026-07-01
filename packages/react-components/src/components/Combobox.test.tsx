import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Combobox } from "./Combobox.js";

function mount(ui: ReactNode) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });

  return {
    container,
    root,
    cleanup() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

async function nextFrame() {
  await act(async () => {
    await new Promise(requestAnimationFrame);
  });
}

afterEach(() => {
  document.body.innerHTML = "";
});

const fruits = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
];

test("renders shadcn-compatible combobox anatomy", async () => {
  const mounted = mount(
    <Combobox.Root items={fruits} defaultValue={fruits[0]} open>
      <Combobox.Input aria-label="Fruit" />
      <Combobox.Trigger aria-label="Open fruit list" />
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup>
            <Combobox.List className="custom-list">
              {(item: (typeof fruits)[number]) => (
                <Combobox.Item key={item.value} value={item}>
                  <Combobox.ItemIndicator />
                  {item.label}
                </Combobox.Item>
              )}
            </Combobox.List>
            <Combobox.Empty>No fruit found.</Combobox.Empty>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>,
  );

  await nextFrame();

  expect(mounted.container.querySelector("[data-slot='combobox-input']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='combobox-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='combobox-positioner']")).not.toBeNull();
  expect(document.querySelector("[data-slot='combobox-content']")).not.toBeNull();
  expect(document.querySelector("[data-slot='combobox-list']")).not.toBeNull();
  expect(document.querySelector("[data-slot='combobox-list']")?.className).toContain(
    "combobox__list",
  );
  expect(document.querySelector("[data-slot='combobox-list']")?.className).toContain("custom-list");
  expect(document.querySelector("[data-slot='combobox-item']")).not.toBeNull();
  expect(document.querySelector("[data-slot='combobox-item-indicator']")).not.toBeNull();
  mounted.cleanup();
});
