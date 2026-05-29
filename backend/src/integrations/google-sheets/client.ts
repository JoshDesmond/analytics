import path from 'node:path';
import { google } from 'googleapis';

const keyFile = path.resolve(
  process.cwd(),
  process.env.SHEETS_API_JSON ?? 'service-account.json',
);

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const sheets = google.sheets({ version: 'v4', auth });

export function getSpreadsheetId(): string {
  const id = process.env.SHEETS_SPREADSHEET_ID;
  if (!id) {
    throw new Error('SHEETS_SPREADSHEET_ID is not set');
  }
  return id;
}
