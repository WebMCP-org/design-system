import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { WebPreview, WebPreviewBody, WebPreviewConsole } from "./WebPreview.js";

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

test("renders loading content alongside iframe preview", () => {
  const mounted = mount(
    <WebPreview defaultUrl="https://example.com">
      <WebPreviewBody loading={<span>Loading preview</span>} />
    </WebPreview>,
  );

  expect(mounted.container.querySelector("iframe")?.getAttribute("src")).toBe(
    "https://example.com",
  );
  expect(mounted.container.textContent).toContain("Loading preview");
  mounted.cleanup();
});

test("supports optional console logs and children", () => {
  const mounted = mount(
    <WebPreview>
      <WebPreviewConsole>
        <div>custom console row</div>
      </WebPreviewConsole>
    </WebPreview>,
  );

  const button = mounted.container.querySelector<HTMLButtonElement>(".web-preview__console-header");
  if (!button) throw new Error("Console toggle did not render.");

  act(() => {
    button.click();
  });

  expect(mounted.container.textContent).toContain("No console output");
  expect(mounted.container.textContent).toContain("custom console row");
  mounted.cleanup();
});
