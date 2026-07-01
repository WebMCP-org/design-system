import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { ModelSelector, ModelSelectorContent, ModelSelectorDialog } from "./ModelSelector.js";

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

afterEach(() => {
  document.body.innerHTML = "";
});

test("renders upstream hidden title in selector content", () => {
  const mounted = mount(
    <ModelSelector open>
      <ModelSelectorContent title="Choose a model">
        <ModelSelectorDialog />
      </ModelSelectorContent>
    </ModelSelector>,
  );

  const title = document.body.querySelector(".model-selector__title");
  expect(title?.textContent).toBe("Choose a model");
  mounted.cleanup();
});
