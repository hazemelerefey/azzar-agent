import * as path from 'node:path';

import { chromium, request } from '../e2e/node_modules/playwright';

async function main() {
  console.log('Signing in via BetterAuth API endpoint...');
  const api = await request.newContext({ baseURL: 'http://localhost:3010' });

  const signInRes = await api.post('/api/auth/sign-in/email', {
    data: {
      email: 'elerefy@gmail.com',
      password: 'TestPassword123!',
    },
  });

  console.log('Sign in status:', signInRes.status(), signInRes.statusText());

  const storageState = await api.storageState();
  const cookies = storageState.cookies;
  console.log('Obtained cookies count:', cookies.length);

  await api.dispose();

  console.log('Launching browser with cookies...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await context.addCookies(cookies);

  const page = await context.newPage();

  const requests: any[] = [];
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('chat') || url.includes('11434') || url.includes('ollama')) {
      requests.push({
        url,
        method: req.method(),
        postData: req.postData(),
      });
      console.log(`[REQ] ${req.method()} ${url}`);
    }
  });

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('webapi/chat')) {
      console.log(`[RES] ${res.status()} ${url}`);
      try {
        const text = await res.text();
        console.log(`[RES BODY] ${text.slice(0, 500)}`);
      } catch (e) {}
    }
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (
      text.includes('Error') ||
      text.includes('identity') ||
      text.includes('AZZAR') ||
      text.includes('systemRole')
    ) {
      console.log(`[CONSOLE] ${text}`);
    }
  });

  console.log('Navigating to http://localhost:3010/agent/agt_yhttxcLL1cMB...');
  await page.goto('http://localhost:3010/agent/agt_yhttxcLL1cMB', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await page.waitForTimeout(5000);
  console.log('Loaded URL:', page.url());

  // Click "Start New Topic" to ensure clean state
  try {
    const newTopicBtn = page.locator('text="Start New Topic"').first();
    if (await newTopicBtn.isVisible({ timeout: 5000 })) {
      console.log('Clicking "Start New Topic"...');
      await newTopicBtn.click();
      await page.waitForTimeout(3000);
    }
  } catch (e) {
    console.log('No new topic button found, continuing...');
  }

  // Wait for the Lexical contenteditable editor
  const editorSelector = 'div[contenteditable="true"]';
  console.log('Waiting for Lexical contenteditable editor...');
  await page.waitForSelector(editorSelector, { timeout: 30000 });
  console.log('Found editor! Clicking and typing "who are u"...');

  await page.click(editorSelector);
  await page.fill(editorSelector, 'who are u');
  await page.waitForTimeout(1000);

  // Press Enter to send
  console.log('Pressing Enter to send...');
  await page.keyboard.press('Enter');

  // Also check if there's a send button to click if Enter didn't trigger
  await page.waitForTimeout(2000);
  const sendButton = page
    .locator('button[type="submit"], button[aria-label*="send"], button:has(svg)')
    .last();

  console.log('Waiting for Ollama response to stream...');
  // Wait up to 50 seconds for the response
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(5000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (
      bodyText.includes('أذّار') ||
      bodyText.includes('AZZAR') ||
      bodyText.includes('Technology') ||
      bodyText.includes('large language model')
    ) {
      console.log(
        `Assistant response detected at ${(i + 1) * 5}s! Waiting 5 more seconds to settle...`,
      );
      await page.waitForTimeout(5000);
      break;
    }
  }

  const screenshotPath = path.resolve(
    'C:/Users/abdoh/.gemini/antigravity/brain/d73219cd-d9c8-43e5-96b6-89264395275d/live_ui_chat_proof.png',
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot saved to:', screenshotPath);

  console.log('\n=== Captured Chat/Ollama Requests ===');
  for (const r of requests) {
    console.log(`\nURL: ${r.url} [${r.method}]`);
    if (r.postData) {
      try {
        const fs = await import('node:fs');
        fs.writeFileSync(
          'C:/Users/abdoh/.gemini/antigravity/brain/d73219cd-d9c8-43e5-96b6-89264395275d/captured_chat_payload.json',
          r.postData,
        );
        console.log('Saved payload to captured_chat_payload.json');
      } catch (e) {
        console.error('Error saving payload:', e);
      }
    }
  }

  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('\n=== Page Text (Assistant Response) ===');
  console.log(pageText.slice(0, 2000));

  await browser.close();
  console.log('Test completed successfully.');
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
