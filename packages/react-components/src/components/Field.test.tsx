import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Field } from "./Field.js";

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

test("renders shadcn-compatible field anatomy slots", () => {
  const mounted = mount(
    <Field.Set>
      <Field.Legend variant="label">Notifications</Field.Legend>
      <Field.Group data-slot="checkbox-group">
        <Field.Root orientation="horizontal" data-invalid>
          <Field.Content>
            <Field.Title>Email updates</Field.Title>
            <Field.Description>Receive project updates.</Field.Description>
          </Field.Content>
        </Field.Root>
      </Field.Group>
      <Field.Separator>or</Field.Separator>
    </Field.Set>,
  );

  expect(mounted.container.querySelector("[data-slot='field-set']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='checkbox-group']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='field']")?.getAttribute("role")).toBe(
    "group",
  );
  expect(mounted.container.querySelector("[data-slot='field-content']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='field-separator-content']")).not.toBeNull();
  mounted.cleanup();
});

test("renders unique TanStack-style field errors", () => {
  const mounted = mount(
    <Field.Error
      errors={[
        { message: "Email is required" },
        { message: "Email is required" },
        "Use a work email",
      ]}
    />,
  );

  const alert = mounted.container.querySelector("[role='alert']");
  expect(alert?.textContent).toContain("Email is required");
  expect(alert?.textContent).toContain("Use a work email");
  expect(alert?.querySelectorAll("li")).toHaveLength(2);
  mounted.cleanup();
});
