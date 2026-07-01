import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtStep,
} from "./ChainOfThought.js";

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

function CustomIcon() {
  return <svg data-testid="chain-of-thought-custom-icon" aria-hidden="true" />;
}

afterEach(() => {
  document.body.innerHTML = "";
});

test("matches upstream header and step composition defaults", () => {
  const mounted = mount(
    <>
      <ChainOfThought>
        <ChainOfThoughtHeader />
      </ChainOfThought>
      <ChainOfThoughtStep
        icon={CustomIcon}
        label={<span>React label</span>}
        description={<em>React description</em>}
      />
    </>,
  );

  expect(mounted.container.textContent).toContain("Chain of Thought");
  expect(mounted.container.textContent).toContain("React label");
  expect(mounted.container.textContent).toContain("React description");
  expect(mounted.container.querySelector("[data-status='complete']")).not.toBeNull();
  expect(
    mounted.container.querySelector("[data-testid='chain-of-thought-custom-icon']"),
  ).not.toBeNull();
  mounted.cleanup();
});

test("supports upstream search-result and image children", () => {
  const mounted = mount(
    <>
      <ChainOfThoughtSearchResult href="#source">
        <span>Custom source chip</span>
      </ChainOfThoughtSearchResult>
      <ChainOfThoughtImage caption="Generated preview">
        <div data-testid="chain-of-thought-custom-image">Custom media</div>
      </ChainOfThoughtImage>
    </>,
  );

  expect(mounted.container.textContent).toContain("Custom source chip");
  expect(mounted.container.textContent).toContain("Custom media");
  expect(mounted.container.textContent).toContain("Generated preview");
  expect(mounted.container.querySelector("img")).toBeNull();
  mounted.cleanup();
});
