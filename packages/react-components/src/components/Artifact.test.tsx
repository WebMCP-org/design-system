import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { ArtifactAction, ArtifactClose } from "./Artifact.js";

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

function TestIcon({ className }: { className?: string }) {
  return <svg className={className} data-testid="artifact-test-icon" aria-hidden="true" />;
}

afterEach(() => {
  document.body.innerHTML = "";
});

test("supports upstream icon component and optional label", () => {
  const mounted = mount(<ArtifactAction tooltip="Download" icon={TestIcon} />);

  expect(mounted.container.querySelector("[data-testid='artifact-test-icon']")).not.toBeNull();
  expect(mounted.container.textContent).toContain("Download");
  mounted.cleanup();
});

test("supports children fallback for actions and close", () => {
  const mounted = mount(
    <>
      <ArtifactAction label="Run">R</ArtifactAction>
      <ArtifactClose label="Dismiss">D</ArtifactClose>
    </>,
  );

  expect(mounted.container.textContent).toContain("R");
  expect(mounted.container.textContent).toContain("D");
  mounted.cleanup();
});
