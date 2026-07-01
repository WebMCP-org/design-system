import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { PreviewCard } from "./PreviewCard.js";

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

test("renders shadcn-compatible hover card content shorthand", async () => {
  const mounted = mount(
    <PreviewCard.Root open>
      <PreviewCard.Trigger href="#profile">Profile</PreviewCard.Trigger>
      <PreviewCard.Content>
        <div>Preview details</div>
      </PreviewCard.Content>
    </PreviewCard.Root>,
  );

  await nextFrame();

  expect(mounted.container.querySelector("[data-slot='hover-card-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='hover-card-portal']")).not.toBeNull();
  expect(document.querySelector("[data-slot='hover-card-positioner']")).not.toBeNull();
  expect(document.querySelector("[data-slot='hover-card-content']")).not.toBeNull();
  expect(document.body.textContent).toContain("Preview details");
  mounted.cleanup();
});

test("keeps explicit preview card primitive anatomy", async () => {
  const mounted = mount(
    <PreviewCard.Root open>
      <PreviewCard.Trigger href="#profile">Profile</PreviewCard.Trigger>
      <PreviewCard.Portal>
        <PreviewCard.Positioner sideOffset={8}>
          <PreviewCard.Popup>
            <PreviewCard.Arrow />
            <div>Preview details</div>
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>,
  );

  await nextFrame();

  expect(document.querySelector("[data-slot='hover-card-portal']")).not.toBeNull();
  expect(document.querySelector("[data-slot='hover-card-positioner']")).not.toBeNull();
  expect(document.querySelector("[data-slot='hover-card-content']")).not.toBeNull();
  expect(document.querySelector("[data-slot='hover-card-arrow']")).not.toBeNull();
  expect(document.body.textContent).toContain("Preview details");
  mounted.cleanup();
});
