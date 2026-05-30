import { describe, expect, it } from 'vitest';
import { fetchEntries } from '../../../src/integrations/google-sheets/reader/entries.js';
import { fetchEntry } from '../../../src/integrations/google-sheets/reader/entry.js';
import { fetchTabs } from '../../../src/integrations/google-sheets/reader/tabs.js';
import { delay } from '../helpers/delay.js';
import { hasEnv } from '../helpers/env.js';

describe.skipIf(
  !hasEnv('SHEETS_SPREADSHEET_ID'),
)('Google Sheets reader integration', () => {
  it('reads spreadsheet tabs', async () => {
    const tabs = await fetchTabs();
    expect(tabs.length).toBeGreaterThan(0);
    expect(tabs[0]?.title).toBeTruthy();
    await delay();
  });

  it('reads entries for the first tab', async () => {
    const tabs = await fetchTabs();
    await delay();

    const tab = tabs[0]?.title;
    expect(tab).toBeTruthy();
    if (!tab) return;

    const entries = await fetchEntries(tab);
    expect(Array.isArray(entries)).toBe(true);
    await delay();
  });

  it('reads a single entry by date', async () => {
    const response = await fetchEntry();
    expect(response.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    if (response.tab) {
      expect(typeof response.tab).toBe('string');
    }
  });
});
