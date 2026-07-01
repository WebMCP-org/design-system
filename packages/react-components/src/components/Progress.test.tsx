import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Progress, ProgressIndicator, ProgressTrack } from "./Progress.js";

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

test("renders shadcn default progress anatomy", () => {
  const mounted = mount(<Progress value={60} aria-label="Upload progress" />);

  const progress = mounted.container.querySelector(".progress");
  const indicator = mounted.container.querySelector(".progress__indicator");
  expect(progress?.getAttribute("data-slot")).toBe("progress");
  expect(progress?.getAttribute("role")).toBe("progressbar");
  expect(progress?.getAttribute("aria-valuenow")).toBe("60");
  expect(indicator?.getAttribute("data-slot")).toBe("progress-indicator");
  expect((indicator as HTMLElement | null)?.style.width).toBe("60%");
  mounted.cleanup();
});

test("keeps existing compound progress anatomy", () => {
  const mounted = mount(
    <Progress value={25} aria-label="Install progress">
      <ProgressTrack className="custom-track">
        <ProgressIndicator className="custom-indicator" />
      </ProgressTrack>
    </Progress>,
  );

  expect(mounted.container.querySelector(".custom-track")).not.toBeNull();
  expect(mounted.container.querySelector(".custom-indicator")?.getAttribute("data-slot")).toBe(
    "progress-indicator",
  );
  mounted.cleanup();
});
