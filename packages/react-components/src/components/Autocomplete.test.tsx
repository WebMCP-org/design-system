import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Autocomplete } from "./Autocomplete.js";

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

const tags = ["React", "Vue"];

test("renders autocomplete list anatomy without dropping Base UI children", async () => {
  const mounted = mount(
    <Autocomplete.Root items={tags} open>
      <Autocomplete.Input aria-label="Framework" />
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.Status>2 results</Autocomplete.Status>
            <Autocomplete.List className="custom-list">
              {(item: string) => (
                <Autocomplete.Item key={item} value={item}>
                  {item}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>,
  );

  await nextFrame();

  expect(mounted.container.querySelector("[data-slot='autocomplete-input']")).not.toBeNull();
  expect(document.querySelector("[data-slot='autocomplete-positioner']")).not.toBeNull();
  expect(document.querySelector("[data-slot='autocomplete-content']")).not.toBeNull();
  expect(document.querySelector("[data-slot='autocomplete-status']")).not.toBeNull();
  expect(document.querySelector("[data-slot='autocomplete-list']")).not.toBeNull();
  expect(document.querySelector("[data-slot='autocomplete-list']")?.className).toContain(
    "autocomplete__list",
  );
  expect(document.querySelector("[data-slot='autocomplete-list']")?.className).toContain(
    "custom-list",
  );
  expect(document.querySelector("[data-slot='autocomplete-item']")).not.toBeNull();
  mounted.cleanup();
});
