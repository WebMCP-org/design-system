import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Badge, badgeVariants } from "./Badge.js";

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

test("maps shadcn badge variants and slot data", () => {
  expect(badgeVariants({ variant: "secondary" })).toContain("badge--neutral");
  expect(badgeVariants({ variant: "destructive" })).toContain("badge--destructive");
  expect(badgeVariants({ variant: "ghost" })).toContain("badge--ghost");
  expect(badgeVariants({ variant: "link" })).toContain("badge--link");

  const mounted = mount(<Badge variant="destructive">Failed</Badge>);

  const badge = mounted.container.querySelector("span");
  expect(badge?.dataset.slot).toBe("badge");
  expect(badge?.dataset.variant).toBe("destructive");
  expect(badge?.className).toContain("badge--destructive");
  mounted.cleanup();
});

test("renders shadcn asChild badges without dropping child props", () => {
  let childClicks = 0;
  let badgeClicks = 0;

  const mounted = mount(
    <Badge
      asChild
      variant="link"
      className="badge-extra"
      onClick={() => {
        badgeClicks += 1;
      }}
    >
      <a
        href="#badge-link"
        className="child-extra"
        onClick={(event) => {
          event.preventDefault();
          childClicks += 1;
        }}
      >
        Docs
      </a>
    </Badge>,
  );

  const badge = mounted.container.querySelector("a");
  expect(badge?.dataset.slot).toBe("badge");
  expect(badge?.dataset.variant).toBe("link");
  expect(badge?.getAttribute("href")).toBe("#badge-link");
  expect(badge?.className).toContain("badge--link");
  expect(badge?.className).toContain("badge-extra");
  expect(badge?.className).toContain("child-extra");

  act(() => {
    badge?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });

  expect(childClicks).toBe(1);
  expect(badgeClicks).toBe(1);
  mounted.cleanup();
});
