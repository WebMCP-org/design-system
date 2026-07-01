import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import {
  EnvironmentVariable,
  EnvironmentVariableCopyButton,
  EnvironmentVariableName,
  EnvironmentVariableRequired,
  EnvironmentVariableValue,
  EnvironmentVariables,
  EnvironmentVariablesContent,
  EnvironmentVariablesHeader,
  EnvironmentVariablesTitle,
} from "./EnvironmentVariables.js";

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

test("renders upstream defaults without children", () => {
  const mounted = mount(
    <EnvironmentVariables>
      <EnvironmentVariablesHeader>
        <EnvironmentVariablesTitle />
      </EnvironmentVariablesHeader>
      <EnvironmentVariablesContent>
        <EnvironmentVariable name="DATABASE_URL" value="postgres://localhost/app" />
      </EnvironmentVariablesContent>
    </EnvironmentVariables>,
  );

  expect(mounted.container.textContent).toContain("Environment Variables");
  expect(mounted.container.textContent).toContain("DATABASE_URL");
  expect(mounted.container.textContent).not.toContain("postgres://localhost/app");
  mounted.cleanup();
});

test("allows upstream child overrides", () => {
  const mounted = mount(
    <EnvironmentVariables>
      <EnvironmentVariable name="API_KEY" value="secret">
        <EnvironmentVariableName>Key</EnvironmentVariableName>
        <EnvironmentVariableValue>Hidden</EnvironmentVariableValue>
        <EnvironmentVariableRequired>Needed</EnvironmentVariableRequired>
      </EnvironmentVariable>
    </EnvironmentVariables>,
  );

  expect(mounted.container.textContent).toContain("Key");
  expect(mounted.container.textContent).toContain("Hidden");
  expect(mounted.container.textContent).toContain("Needed");
  mounted.cleanup();
});

test("supports upstream copy callbacks and copyFormat prop", async () => {
  let copiedText = "";
  let copied = false;
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (text: string) => {
        copiedText = text;
      },
    },
  });

  const mounted = mount(
    <EnvironmentVariables>
      <EnvironmentVariable name="API_KEY" value="secret">
        <EnvironmentVariableCopyButton copyFormat="export" onCopy={() => (copied = true)} />
      </EnvironmentVariable>
    </EnvironmentVariables>,
  );

  const button = mounted.container.querySelector("button");
  if (!button) throw new Error("Copy button did not render.");

  await act(async () => {
    button.click();
  });

  expect(copiedText).toBe('export API_KEY="secret"');
  expect(copied).toBe(true);
  mounted.cleanup();
});

test("reports copy errors", async () => {
  const failed = new Error("denied");
  let reported: Error | null = null;
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async () => {
        throw failed;
      },
    },
  });

  const mounted = mount(
    <EnvironmentVariables>
      <EnvironmentVariable name="API_KEY" value="secret">
        <EnvironmentVariableCopyButton onError={(error) => (reported = error)} />
      </EnvironmentVariable>
    </EnvironmentVariables>,
  );

  const button = mounted.container.querySelector("button");
  if (!button) throw new Error("Copy button did not render.");

  await act(async () => {
    button.click();
  });

  expect(reported).toBe(failed);
  mounted.cleanup();
});
