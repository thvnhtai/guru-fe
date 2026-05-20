/**
 * Multi-tab collaboration tests.
 *
 * These tests require BOTH the Next.js dev server (handled by playwright.config.ts
 * via `webServer`) AND the Yjs WebSocket backend:
 *
 *   NEXT_PUBLIC_WS_URL=ws://localhost:4000
 *
 * Start the backend before running:
 *   cd ../guru-be && pnpm start   # or however the backend is started
 *
 * If the WS backend is unavailable the provider will silently fail to connect
 * and the collaboration assertions will time out.
 */

import { test, expect, type BrowserContext } from "@playwright/test";

/** Open a fresh browser context and navigate to the given room as the given user. */
async function joinRoom(
  context: BrowserContext,
  roomId: string,
  name: string
) {
  const page = await context.newPage();
  await page.goto(`/room/${roomId}`);
  // userStore reads from sessionStorage — set the name directly via JS so
  // the awareness state is correct without going through the home page flow.
  await page.evaluate((n) => {
    sessionStorage.setItem("guru:name", n);
  }, name);
  // Trigger the name setter via the store (Zustand exposes setState)
  await page.evaluate((n) => {
    // Access the Zustand store's setState via the global window binding
    // (only available in dev mode via Next.js)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__userStore?.setState({ name: n });
  }, name);
  return page;
}

test.describe("Real-time code collaboration", () => {
  // Use a fixed room ID so both contexts join the same Yjs document
  const ROOM_ID = "collab-test-room";

  test("Tab A types code and Tab B sees it", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();

    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await pageA.goto(`/room/${ROOM_ID}`);
      await pageB.goto(`/room/${ROOM_ID}`);

      // Wait for both to show "connected" (banner disappears)
      await expect(
        pageA.getByText(/connecting to collaboration server/i)
      ).not.toBeVisible({ timeout: 10_000 });
      await expect(
        pageB.getByText(/connecting to collaboration server/i)
      ).not.toBeVisible({ timeout: 10_000 });

      // Tab A types into Monaco
      const editorA = pageA.locator(".monaco-editor textarea").first();
      await editorA.click();
      await editorA.type("hello");

      // Tab B should see "hello" in its Monaco editor within 2s
      await expect(
        pageB.locator(".monaco-editor .view-lines")
      ).toContainText("hello", { timeout: 2000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("Tab B appends text and Tab A sees the combined result", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();

    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await pageA.goto(`/room/${ROOM_ID}-append`);
      await pageB.goto(`/room/${ROOM_ID}-append`);

      await expect(
        pageA.getByText(/connecting to collaboration server/i)
      ).not.toBeVisible({ timeout: 10_000 });
      await expect(
        pageB.getByText(/connecting to collaboration server/i)
      ).not.toBeVisible({ timeout: 10_000 });

      const editorA = pageA.locator(".monaco-editor textarea").first();
      await editorA.click();
      await editorA.type("hello");

      // Wait for B to receive "hello"
      await expect(
        pageB.locator(".monaco-editor .view-lines")
      ).toContainText("hello", { timeout: 2000 });

      // Tab B appends " world"
      const editorB = pageB.locator(".monaco-editor textarea").first();
      await editorB.click();
      await pageB.keyboard.press("End");
      await editorB.type(" world");

      // Tab A should see full "hello world"
      await expect(
        pageA.locator(".monaco-editor .view-lines")
      ).toContainText("hello world", { timeout: 2000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("language change in Tab A propagates to Tab B", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();

    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await pageA.goto(`/room/${ROOM_ID}-lang`);
      await pageB.goto(`/room/${ROOM_ID}-lang`);

      await expect(
        pageA.getByText(/connecting to collaboration server/i)
      ).not.toBeVisible({ timeout: 10_000 });

      // Tab A selects JavaScript
      await pageA
        .getByRole("combobox", { name: /select programming language/i })
        .selectOption("javascript");

      // Tab B should see JavaScript selected
      await expect(
        pageB.getByRole("combobox", { name: /select programming language/i })
      ).toHaveValue("javascript", { timeout: 2000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});

test.describe("Real-time chat collaboration", () => {
  const ROOM_ID = "chat-test-room";

  test("message sent in Tab A appears in Tab B", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();

    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await pageA.goto(`/room/${ROOM_ID}`);
      await pageB.goto(`/room/${ROOM_ID}`);

      await expect(
        pageA.getByText(/connecting to collaboration server/i)
      ).not.toBeVisible({ timeout: 10_000 });
      await expect(
        pageB.getByText(/connecting to collaboration server/i)
      ).not.toBeVisible({ timeout: 10_000 });

      // Tab A sends a chat message
      const input = pageA.getByPlaceholder(/message/i);
      await input.fill("hello from tab A");
      await input.press("Enter");

      // Tab B should see the message
      await expect(pageB.getByText("hello from tab A")).toBeVisible({
        timeout: 2000,
      });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test("Tab B reply appears in Tab A", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();

    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await pageA.goto(`/room/${ROOM_ID}-reply`);
      await pageB.goto(`/room/${ROOM_ID}-reply`);

      await expect(
        pageA.getByText(/connecting to collaboration server/i)
      ).not.toBeVisible({ timeout: 10_000 });
      await expect(
        pageB.getByText(/connecting to collaboration server/i)
      ).not.toBeVisible({ timeout: 10_000 });

      const inputA = pageA.getByPlaceholder(/message/i);
      await inputA.fill("first");
      await inputA.press("Enter");

      await expect(pageB.getByText("first")).toBeVisible({ timeout: 2000 });

      const inputB = pageB.getByPlaceholder(/message/i);
      await inputB.fill("second");
      await inputB.press("Enter");

      await expect(pageA.getByText("second")).toBeVisible({ timeout: 2000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});
