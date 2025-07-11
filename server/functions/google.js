import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

export const SHEET_ID = "1OWM3yehCwn_E8xDc9o0g9oAtWDm-vf3AkXCE-IYkvew"; 
export const SHEET_NAME = "Inventory"; 

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
  ],
});

const drive = google.drive({ version: "v3", auth });

export async function getSheetSharedEmails() {
  const res = await drive.permissions.list({
    fileId: SHEET_ID,
    fields: "permissions(emailAddress)",
  });

  const emails = res.data.permissions
    .map((perm) => perm.emailAddress)
    .filter(Boolean); // remove undefined entries

  return emails;
}

export async function getSheetData() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}`,
  });
  return res.data.values;
}

export async function updateRow(rowIndex, rowData) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [rowData],
    },
  });
}
