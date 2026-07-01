import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { CommitFileAdditions, CommitFileDeletions, CommitHash, CommitTimestamp } from "./Commit.js";

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

test("supports upstream commit hash and timestamp children", () => {
  const mounted = mount(
    <>
      <CommitHash>abcdef0</CommitHash>
      <CommitTimestamp date={new Date("2026-01-01T00:00:00Z")}>January 1</CommitTimestamp>
    </>,
  );

  expect(mounted.container.textContent).toContain("abcdef0");
  expect(mounted.container.textContent).toContain("January 1");
  mounted.cleanup();
});

test("hides zero file changes", () => {
  const mounted = mount(
    <>
      <CommitFileAdditions count={0} />
      <CommitFileDeletions count={0} />
    </>,
  );

  expect(mounted.container.textContent).toBe("");
  mounted.cleanup();
});

test("keeps hash prop shorthand", () => {
  const mounted = mount(<CommitHash hash="a1b2c3d4e5f6" />);

  expect(mounted.container.textContent).toBe("a1b2c3d");
  mounted.cleanup();
});
