import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Radio, RadioGroup, RadioGroupItem, RadioIndicator } from "./RadioGroup.js";

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

test("renders shadcn-compatible radio group anatomy", () => {
  const mounted = mount(
    <RadioGroup defaultValue="pro" aria-label="Plan">
      <RadioGroupItem value="pro" aria-invalid="true" aria-label="Pro" />
    </RadioGroup>,
  );

  const group = mounted.container.querySelector("[data-slot='radio-group']");
  const item = mounted.container.querySelector("[data-slot='radio-group-item']");
  expect(group?.getAttribute("role")).toBe("radiogroup");
  expect(item?.getAttribute("role")).toBe("radio");
  expect(item?.hasAttribute("data-checked")).toBe(true);
  expect(item?.getAttribute("aria-invalid")).toBe("true");
  expect(mounted.container.querySelector("[data-slot='radio-group-indicator']")).not.toBeNull();
  mounted.cleanup();
});

test("keeps the existing compound radio anatomy", () => {
  const mounted = mount(
    <RadioGroup defaultValue="manual" aria-label="Manual radio">
      <Radio value="manual" aria-label="Manual">
        <RadioIndicator className="custom-indicator" />
      </Radio>
    </RadioGroup>,
  );

  expect(mounted.container.querySelector(".custom-indicator")).not.toBeNull();
  mounted.cleanup();
});
