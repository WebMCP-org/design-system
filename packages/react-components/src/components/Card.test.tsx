import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card.js";

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

test("renders shadcn card anatomy slots", () => {
  const mounted = mount(
    <Card>
      <CardHeader>
        <CardTitle>Plan</CardTitle>
        <CardDescription>Usage summary</CardDescription>
        <CardAction>Menu</CardAction>
      </CardHeader>
      <CardContent>Content</CardContent>
      <CardFooter>Footer</CardFooter>
    </Card>,
  );

  const card = mounted.container.querySelector(".card");
  expect(card?.getAttribute("data-slot")).toBe("card");
  expect(mounted.container.querySelector(".card__header")?.getAttribute("data-slot")).toBe(
    "card-header",
  );
  expect(mounted.container.querySelector(".card__title")?.getAttribute("data-slot")).toBe(
    "card-title",
  );
  expect(mounted.container.querySelector(".card__description")?.tagName).toBe("DIV");
  expect(mounted.container.querySelector(".card__description")?.getAttribute("data-slot")).toBe(
    "card-description",
  );
  expect(mounted.container.querySelector(".card__action")?.getAttribute("data-slot")).toBe(
    "card-action",
  );
  expect(mounted.container.querySelector(".card__content")?.getAttribute("data-slot")).toBe(
    "card-content",
  );
  expect(mounted.container.querySelector(".card__footer")?.getAttribute("data-slot")).toBe(
    "card-footer",
  );
  mounted.cleanup();
});
