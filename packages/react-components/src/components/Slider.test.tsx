import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "./Slider.js";

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

test("renders shadcn-compatible slider anatomy by default", () => {
  const mounted = mount(<Slider defaultValue={40} />);

  const slider = mounted.container.querySelector("[data-slot='slider']");
  expect(slider?.getAttribute("data-orientation")).toBe("horizontal");
  expect(mounted.container.querySelector("[data-slot='slider-control']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='slider-track']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='slider-range']")).not.toBeNull();
  expect(mounted.container.querySelectorAll("[data-slot='slider-thumb']")).toHaveLength(1);
  expect(mounted.container.querySelector("input[type='range']")).not.toBeNull();
  mounted.cleanup();
});

test("uses value arrays to render range thumbs without custom children", () => {
  const mounted = mount(<Slider defaultValue={[20, 80]} />);

  expect(mounted.container.querySelectorAll("[data-slot='slider-thumb']")).toHaveLength(2);
  expect(mounted.container.querySelector("[data-slot='slider-range']")).not.toBeNull();
  mounted.cleanup();
});

test("keeps existing compound slider anatomy", () => {
  const mounted = mount(
    <Slider defaultValue={[20, 80]}>
      <SliderControl className="custom-control">
        <SliderTrack className="custom-track">
          <SliderIndicator className="custom-range" />
          <SliderThumb className="custom-min" index={0} />
          <SliderThumb className="custom-max" index={1} />
        </SliderTrack>
      </SliderControl>
    </Slider>,
  );

  expect(mounted.container.querySelector(".custom-control")).not.toBeNull();
  expect(mounted.container.querySelector(".custom-track")?.getAttribute("data-slot")).toBe(
    "slider-track",
  );
  expect(mounted.container.querySelector(".custom-range")?.getAttribute("data-slot")).toBe(
    "slider-range",
  );
  expect(mounted.container.querySelectorAll("[data-slot='slider-thumb']")).toHaveLength(2);
  mounted.cleanup();
});

test("renders slider output as the Base UI output element", () => {
  const mounted = mount(
    <Slider defaultValue={30}>
      <SliderOutput>{(value) => `${value}%`}</SliderOutput>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb aria-label="Volume" />
        </SliderTrack>
      </SliderControl>
    </Slider>,
  );

  const output = mounted.container.querySelector("[data-slot='slider-output']");
  expect(output?.tagName).toBe("OUTPUT");
  expect(output?.querySelector("output")).toBeNull();
  expect(output?.textContent).toBe("30%");
  mounted.cleanup();
});

test("exposes vertical orientation for styling", () => {
  const mounted = mount(<Slider defaultValue={50} orientation="vertical" />);

  expect(
    mounted.container.querySelector("[data-slot='slider']")?.getAttribute("data-orientation"),
  ).toBe("vertical");
  mounted.cleanup();
});
