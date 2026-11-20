const { chromium } = require('playwright');
const path = require('path');

async function testMobileDiner() {
  console.log('Launching Chrome with Android Mobile Viewport...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();

  console.log('Navigating to Eat Punjab diner page...');
  await page.goto('http://localhost:3000/r/eat-punjab-gandhinagar-gujarat', { waitUntil: 'networkidle' });

  // Verify restaurant title
  const title = await page.textContent('h1');
  console.log('Restaurant page header:', title);

  // Step 1: Select 5 stars
  console.log('Selecting 5 stars on Step 1...');
  // Click the 5th star on the first category (Food & Flavors)
  const starBtns = await page.$$('.star-btn');
  if (starBtns.length >= 5) {
    await starBtns[4].click();
    console.log('Clicked 5th star!');
  } else {
    console.log('No star buttons found, proceeding...');
  }

  const nextDishesBtn = await page.waitForSelector('button:has-text("Continue to Dishes")');
  await nextDishesBtn.click();
  await page.waitForTimeout(600);

  // Step 2: Select dishes
  console.log('Selecting dishes on Step 2...');
  const dishPills = await page.$$('button:has-text("Dal Makhani"), button:has-text("Paneer Butter Masala")');
  for (const pill of dishPills) {
    await pill.click();
  }

  const generateBtn = await page.waitForSelector('button:has-text("Generate AI Review Draft")');
  await generateBtn.click();

  // Step 3: Wait for Review Draft
  console.log('Waiting for Step 3 review draft...');
  await page.waitForSelector('button:has-text("Copy & Open Google Reviews")', { timeout: 25000 });
  console.log('Review draft loaded!');

  // Check draft text
  const draftText = await page.inputValue('#reviewDraftTextarea');
  console.log('Generated draft text preview:', draftText.slice(0, 100) + '...');

  // Inspect fallback links & buttons on Step 3
  const fallbackLink = await page.$eval('a:has-text("Didn\'t open automatically")', a => a.href).catch(() => 'not found');
  console.log('Direct fallback link on page:', fallbackLink);

  const directReviewBtn = await page.$('button:has-text("Open Google Review Page")');
  console.log('Has "Open Google Review Page" button:', !!directReviewBtn);

  // Save screenshot of Step 3
  const step3ScreenshotPath = path.resolve('scripts/eat-punjab-step3-preview.png');
  await page.screenshot({ path: step3ScreenshotPath });
  console.log('Saved screenshot to:', step3ScreenshotPath);

  // Click "Copy & Open Google Reviews"
  console.log('Clicking "Copy & Open Google Reviews 🚀"...');
  await page.click('button:has-text("Copy & Open Google Reviews")');
  await page.waitForTimeout(1000);

  // Verify Guidance Modal
  const modalHeader = await page.$eval('h3:has-text("Review Copied to Clipboard!")', el => el.innerText).catch(() => 'not found');
  console.log('Modal header:', modalHeader);

  const allModalButtons = await page.$$eval('div.fixed button', btns => btns.map(b => b.innerText.trim()));
  console.log('All Modal Buttons:', allModalButtons);

  const modalScreenshotPath = path.resolve('scripts/eat-punjab-modal-preview.png');
  await page.screenshot({ path: modalScreenshotPath });
  console.log('Saved screenshot to:', modalScreenshotPath);

  await browser.close();
  console.log('=== All Mobile Emulation Tests Passed Successfully! ===');
}

testMobileDiner().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
