import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Field } from "./Field.js";
import { Form } from "./Form.js";

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

test("passes native submit events through for TanStack-style forms", () => {
  let submitType: string | undefined;
  const mounted = mount(
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        submitType = event.type;
      }}
    >
      <button type="submit">Submit</button>
    </Form>,
  );

  const form = mounted.container.querySelector("form");
  act(() => {
    form?.requestSubmit();
  });

  expect(mounted.container.querySelector("[data-slot='form']")).not.toBeNull();
  expect(submitType).toBe("submit");
  mounted.cleanup();
});

test("keeps Base UI values submit handler", () => {
  let submittedValues: Record<string, unknown> | undefined;
  const mounted = mount(
    <Form
      onFormSubmit={(values) => {
        submittedValues = values;
      }}
    >
      <Field.Root name="email">
        <Field.Control defaultValue="alex@example.com" />
      </Field.Root>
      <button type="submit">Submit</button>
    </Form>,
  );

  const form = mounted.container.querySelector("form");
  act(() => {
    form?.requestSubmit();
  });

  expect(submittedValues).toEqual({ email: "alex@example.com" });
  mounted.cleanup();
});
