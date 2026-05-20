import { test, expect } from "@playwright/test";

test.describe("Room creation and joining", () => {
  test("creates a room and redirects to workspace", async ({ page }) => {
    await page.goto("/");

    // Fill in name and create a room
    await page.getByPlaceholder(/your name/i).fill("Alice");
    await page.getByRole("button", { name: /create room/i }).click();

    // Should redirect to /room/<id>
    await expect(page).toHaveURL(/\/room\/.+/);

    // Workspace layout is visible
    await expect(page.getByRole("banner")).toBeVisible(); // RoomHeader
  });

  test("room URL contains a valid room ID", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/your name/i).fill("Bob");
    await page.getByRole("button", { name: /create room/i }).click();

    const url = page.url();
    const roomId = url.split("/room/")[1];
    expect(roomId).toBeTruthy();
    // Room IDs are URL-safe (no spaces, no special chars except hyphens)
    expect(roomId).toMatch(/^[a-z0-9-]+$/);
  });

  test("navigating directly to a room URL shows workspace", async ({ page }) => {
    await page.goto("/room/test-room-123");
    // The room page renders (editor panel visible via the disconnected banner or layout)
    // We check for the header which is always present
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("shows 'Load problem' button in room header", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/your name/i).fill("Charlie");
    await page.getByRole("button", { name: /create room/i }).click();
    await expect(page.getByRole("button", { name: /load problem/i })).toBeVisible();
  });

  test("shows 'Copy link' button in room header", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/your name/i).fill("Charlie");
    await page.getByRole("button", { name: /create room/i }).click();
    await expect(page.getByRole("button", { name: /copy link/i })).toBeVisible();
  });

  test("shows language selector in room header", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/your name/i).fill("Dana");
    await page.getByRole("button", { name: /create room/i }).click();
    await expect(
      page.getByRole("combobox", { name: /select programming language/i })
    ).toBeVisible();
  });

  test("'Load problem' opens problem picker modal", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/your name/i).fill("Eve");
    await page.getByRole("button", { name: /create room/i }).click();

    await page.getByRole("button", { name: /load problem/i }).click();
    await expect(page.getByText(/load a problem/i)).toBeVisible();
    await expect(page.getByPlaceholder(/search by title/i)).toBeVisible();
  });

  test("problem picker closes on backdrop click", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/your name/i).fill("Frank");
    await page.getByRole("button", { name: /create room/i }).click();

    await page.getByRole("button", { name: /load problem/i }).click();
    await expect(page.getByText(/load a problem/i)).toBeVisible();

    // Click outside the modal (the backdrop overlay)
    await page.locator(".fixed.inset-0").click({ position: { x: 10, y: 10 } });
    await expect(page.getByText(/load a problem/i)).not.toBeVisible();
  });
});
