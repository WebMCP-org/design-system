import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Test, TestDuration, TestResults, TestResultsProgress, TestStatus } from "./TestResults.js";

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

test("supports upstream test status children and duration text", () => {
  const mounted = mount(
    <Test name="renders" status="failed" duration={1250}>
      <TestStatus>custom status</TestStatus>
      <TestDuration />
    </Test>,
  );

  expect(mounted.container.textContent).toContain("custom status");
  expect(mounted.container.textContent).toContain("1250ms");
  mounted.cleanup();
});

test("renders upstream passed and failed progress segments", () => {
  const mounted = mount(
    <TestResults summary={{ failed: 1, passed: 3, skipped: 0, total: 4 }}>
      <TestResultsProgress />
    </TestResults>,
  );

  expect(
    mounted.container.querySelector<HTMLElement>(".test-results__progress-segment--passed")?.style
      .width,
  ).toBe("75%");
  expect(
    mounted.container.querySelector<HTMLElement>(".test-results__progress-segment--failed")?.style
      .width,
  ).toBe("25%");
  expect(mounted.container.querySelector("[role='progressbar']")).not.toBeNull();
  mounted.cleanup();
});
