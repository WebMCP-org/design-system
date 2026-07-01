import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./Select.js";

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

test("renders shadcn-compatible select trigger anatomy", () => {
  const mounted = mount(
    <Select value="draft" onValueChange={() => {}} items={[{ value: "draft", label: "Draft" }]}>
      <SelectTrigger size="default" aria-invalid="true" aria-label="Status">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
    </Select>,
  );

  const trigger = mounted.container.querySelector("[data-slot='select-trigger']");
  expect(trigger?.getAttribute("data-size")).toBe("default");
  expect(trigger?.getAttribute("aria-invalid")).toBe("true");
  expect(mounted.container.querySelector("[data-slot='select-value']")).not.toBeNull();
  expect(trigger?.querySelector(".select__icon")).not.toBeNull();
  mounted.cleanup();
});

test("renders shadcn-compatible select content anatomy", () => {
  const mounted = mount(
    <Select value="draft" onValueChange={() => {}} open>
      <SelectTrigger aria-label="Status">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Workflow</SelectLabel>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectSeparator />
          <SelectItem value="published">Published</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>,
  );

  expect(document.querySelector("[data-slot='select-content']")).not.toBeNull();
  expect(document.querySelector("[data-slot='select-viewport']")).not.toBeNull();
  expect(document.querySelector("[data-slot='select-group']")).not.toBeNull();
  expect(document.querySelector("[data-slot='select-label']")).not.toBeNull();
  expect(document.querySelector("[data-slot='select-item']")).not.toBeNull();
  expect(document.querySelector("[data-slot='select-item-indicator']")).not.toBeNull();
  expect(document.querySelector("[data-slot='select-separator']")).not.toBeNull();
  mounted.cleanup();
});
