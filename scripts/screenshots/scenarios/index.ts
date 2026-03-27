import { Page } from 'playwright';
import { capture } from '../utils/capture';
import { CONFIG } from '../config';

const BASE_URL = CONFIG.BASE_URL;

export async function runPcScenarios(page: Page): Promise<void> {
  // home-items-pc
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'home-items-pc', 'pc');
  } catch (e) {
    console.error('❌ home-items-pc failed:', e);
  }

  // item-drag-reorder (PC) - inject CSS drag state on first item
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      const items = document.querySelectorAll('[draggable], [data-dnd-item], li, [role="listitem"]');
      if (items.length > 0) {
        (items[0] as HTMLElement).style.opacity = '0.5';
        (items[0] as HTMLElement).style.transform = 'scale(1.02)';
        (items[0] as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
      }
    });
    await capture(page, 'item-drag-reorder', 'pc');
  } catch (e) {
    console.error('❌ item-drag-reorder failed:', e);
  }

  // item-new-form-pc
  try {
    await page.goto(`${BASE_URL}/items/new`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'item-new-form-pc', 'pc');
  } catch (e) {
    console.error('❌ item-new-form-pc failed:', e);
  }

  // item-edit-form (PC) - click edit on first item
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const editBtn = page.locator('a[href*="/items/"], button:has-text("編集"), button[aria-label*="編集"]').first();
    await editBtn.click({ timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await capture(page, 'item-edit-form-pc', 'pc');
  } catch (e) {
    console.error('❌ item-edit-form-pc failed:', e);
  }

  // group-switcher (PC) - click group switcher if any
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const groupSwitcher = page.locator('button:has(svg.lucide-chevron-down), button:has-text("個人"), button:has-text("山田家")').first();
    await groupSwitcher.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    await capture(page, 'group-switcher-pc', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ group-switcher-pc failed (may not exist):', e);
  }

  // group-new-form (PC)
  try {
    await page.goto(`${BASE_URL}/groups/new`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'group-new-form', 'pc');
  } catch (e) {
    console.error('❌ group-new-form failed:', e);
  }

  // join-invite-page (PC)
  try {
    await page.goto(`${BASE_URL}/join`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'join-invite-page-pc', 'pc');
  } catch (e) {
    console.error('❌ join-invite-page-pc failed:', e);
  }

  // settings (PC)
  try {
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'settings', 'pc');
  } catch (e) {
    console.error('❌ settings failed:', e);
  }
}

export async function runMobileScenarios(page: Page): Promise<void> {
  // home-items-mobile
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'home-items-mobile', 'mobile');
  } catch (e) {
    console.error('❌ home-items-mobile failed:', e);
  }

  // category-filter-active (mobile) - click a category filter chip
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const categoryBtn = page.locator('button.rounded-full:has-text("食材"), button.rounded-full:has-text("未分類")').first();
    await categoryBtn.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    await capture(page, 'category-filter-active', 'mobile');
  } catch (e) {
    console.error('❌ category-filter-active failed:', e);
  }

  // item-low-stock (mobile) - inject CSS to highlight low-stock items
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      const items = document.querySelectorAll('li, [data-item]');
      const count = Math.min(items.length, 3);
      for (let i = 0; i < count; i++) {
        (items[i] as HTMLElement).style.borderLeft = '4px solid #ef4444';
        (items[i] as HTMLElement).style.backgroundColor = '#fef2f2';
      }
    });
    await capture(page, 'item-low-stock', 'mobile');
  } catch (e) {
    console.error('❌ item-low-stock failed:', e);
  }

  // item-new-form-mobile
  try {
    await page.goto(`${BASE_URL}/items/new`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'item-new-form-mobile', 'mobile');
  } catch (e) {
    console.error('❌ item-new-form-mobile failed:', e);
  }

  // item-edit-form (mobile) - click edit on first item
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const editBtn = page.locator('a[href*="/items/"], button:has-text("編集"), button[aria-label*="編集"]').first();
    await editBtn.click({ timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await capture(page, 'item-edit-form-mobile', 'mobile');
  } catch (e) {
    console.error('❌ item-edit-form-mobile failed:', e);
  }

  // group-switcher (mobile)
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const groupSwitcher = page.locator('button:has(svg.lucide-chevron-down), button:has-text("個人"), button:has-text("山田家")').first();
    await groupSwitcher.click({ timeout: 5000 });
    await page.waitForTimeout(400);
    await capture(page, 'group-switcher-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ group-switcher-mobile failed (may not exist):', e);
  }

  // join-invite-page (mobile)
  try {
    await page.goto(`${BASE_URL}/join`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'join-invite-page-mobile', 'mobile');
  } catch (e) {
    console.error('❌ join-invite-page-mobile failed:', e);
  }
}

export async function runLoginScenario(page: Page): Promise<void> {
  // login (PC, no auth)
  try {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'login', 'pc');
  } catch (e) {
    console.error('❌ login failed:', e);
  }

  // signup (PC, no auth)
  try {
    await page.goto(`${BASE_URL}/signup`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'signup', 'pc');
  } catch (e) {
    console.error('❌ signup failed:', e);
  }
}
