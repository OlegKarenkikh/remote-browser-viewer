import { chromium } from "playwright";
import { randomUUID } from "crypto";

const sessions = new Map();

export async function createSession() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const id = randomUUID();

  sessions.set(id, { id, browser, context, page });
  return sessions.get(id);
}

export function getSession(id) {
  return sessions.get(id);
}

export async function destroySession(id) {
  const s = sessions.get(id);
  if (!s) return false;
  await s.context.close();
  await s.browser.close();
  sessions.delete(id);
  return true;
}
