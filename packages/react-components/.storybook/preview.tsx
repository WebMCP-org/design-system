import type { Preview } from "@storybook/react-vite";
import { useEffect } from "react";
import "../src/styles/index.css";

const withTheme = (Story: React.ComponentType, context: { globals: { theme?: string } }) => {
  const theme = context.globals.theme;

  useEffect(() => {
    const colorSchemeMeta =
      document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]') ??
      document.head.appendChild(document.createElement("meta"));
    colorSchemeMeta.name = "color-scheme";

    const applyTheme = () => {
      let resolvedTheme: "light" | "dark";

      if (theme === "dark") {
        resolvedTheme = "dark";
        localStorage.theme = "dark";
        colorSchemeMeta.content = "dark";
      } else if (theme === "light") {
        resolvedTheme = "light";
        localStorage.theme = "light";
        colorSchemeMeta.content = "light";
      } else {
        // 'system' or undefined - respect system preference
        localStorage.removeItem("theme");
        colorSchemeMeta.content = "light dark";
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }

      // Set both data-theme and class to match design-tokens selectors
      document.documentElement.setAttribute("data-theme", resolvedTheme);
      document.documentElement.classList.toggle("sigvelo-dark", resolvedTheme === "dark");
      document.documentElement.classList.toggle("sigvelo-light", resolvedTheme === "light");

      // Also apply background to Storybook's body for full theming
      document.body.style.backgroundColor = `var(--sigvelo-background-color)`;
      document.body.style.color = `var(--sigvelo-text-body)`;
      document.body.style.transition = "background-color 150ms ease, color 150ms ease";
    };

    applyTheme();

    // Listen for system preference changes when in system mode
    if (!theme || theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleMediaChange = () => applyTheme();

      mediaQuery.addEventListener("change", handleMediaChange);
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }
  }, [theme]);

  return <Story />;
};

const preview: Preview = {
  tags: ["autodocs"],
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "system",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
          { value: "system", icon: "browser", title: "System" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      codePanel: true,
    },
    backgrounds: {
      disable: true,
    },
    a11y: {
      test: "error",
    },
  },
  decorators: [withTheme],
};

export default preview;
