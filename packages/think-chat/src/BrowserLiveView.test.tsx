import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vite-plus/test";
import { BrowserLiveView } from "./BrowserLiveView";

test("renders the live iframe with a Live badge while the URL is valid", () => {
  const html = renderToStaticMarkup(
    <BrowserLiveView
      url="https://live.browser.run/session/abc?mode=tab"
      expiresAt={Date.now() + 60_000}
      pageTitle="example.com"
    />,
  );
  expect(html).toContain("browser-live-view__frame");
  expect(html).toContain("https://live.browser.run/session/abc?mode=tab");
  expect(html).toContain("Live");
  expect(html).not.toContain("Live view ended");
});

test("renders the ended state once the URL has expired", () => {
  const html = renderToStaticMarkup(
    <BrowserLiveView
      url="https://live.browser.run/session/abc"
      expiresAt={Date.now() - 1}
      pageTitle="example.com — checkout"
    />,
  );
  expect(html).toContain("data-expired");
  expect(html).toContain("Live view ended");
  expect(html).toContain("example.com — checkout");
  expect(html).not.toContain("browser-live-view__frame");
});

test("expired view prefers the screenshot fallback", () => {
  const html = renderToStaticMarkup(
    <BrowserLiveView
      url="https://live.browser.run/session/abc"
      expiresAt={Date.now() - 1}
      fallback={<img src="data:image/png;base64,abc" alt="Last browser state" />}
    />,
  );
  expect(html).toContain("data:image/png;base64,abc");
  expect(html).not.toContain("Live view ended");
});
