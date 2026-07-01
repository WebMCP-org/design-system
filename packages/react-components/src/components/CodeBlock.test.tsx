import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContainer,
  CodeBlockContent,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockLanguageSelector,
  CodeBlockLanguageSelectorContent,
  CodeBlockLanguageSelectorItem,
  CodeBlockLanguageSelectorTrigger,
  CodeBlockLanguageSelectorValue,
  CodeBlockTitle,
  highlightCode,
  type TokenizedCode,
} from "./CodeBlock.js";

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

test("renders upstream header-only usage with default code content", () => {
  const mounted = mount(
    <CodeBlock code={'print("hi")'} isStreaming language="python">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <span aria-hidden="true">file</span>
          <CodeBlockFilename>script.py</CodeBlockFilename>
        </CodeBlockTitle>
        <CodeBlockActions />
      </CodeBlockHeader>
    </CodeBlock>,
  );

  expect(mounted.container.querySelector(".code-block__filename")?.textContent).toBe("script.py");
  expect(mounted.container.querySelector(".code-block__content")?.textContent).toContain(
    'print("hi")',
  );
  mounted.cleanup();
});

test("does not duplicate content when a custom container is supplied", () => {
  const mounted = mount(
    <CodeBlock code="const value = 1;" isStreaming language="ts">
      <CodeBlockHeader />
      <CodeBlockContainer>
        <CodeBlockContent />
      </CodeBlockContainer>
    </CodeBlock>,
  );

  expect(mounted.container.querySelectorAll(".code-block__content")).toHaveLength(1);
  mounted.cleanup();
});

test("supports composable language selector children", async () => {
  const mounted = mount(
    <CodeBlock code="console.log('hi')" isStreaming language="typescript">
      <CodeBlockLanguageSelector open value="python">
        <CodeBlockLanguageSelectorTrigger aria-label="Language">
          <CodeBlockLanguageSelectorValue />
        </CodeBlockLanguageSelectorTrigger>
        <CodeBlockLanguageSelectorContent>
          <CodeBlockLanguageSelectorItem value="python">Python</CodeBlockLanguageSelectorItem>
        </CodeBlockLanguageSelectorContent>
      </CodeBlockLanguageSelector>
    </CodeBlock>,
  );

  await nextFrame();

  expect(mounted.container.querySelector("[data-slot='select-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='select-content']")).not.toBeNull();
  expect(document.querySelector("[data-slot='select-item']")?.textContent).toContain("Python");
  mounted.cleanup();
});

test("highlights Shiki bundled languages beyond local aliases", async () => {
  const result = await new Promise<TokenizedCode>((resolve) => {
    const cached = highlightCode('print("hi")', "python", resolve);
    if (cached) resolve(cached);
  });

  expect(
    result.tokens
      .flat()
      .map((token) => token.content)
      .join(""),
  ).toContain('print("hi")');
  expect(result.tokens[0]?.length).toBeGreaterThan(1);
});
