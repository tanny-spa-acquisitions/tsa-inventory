import xlsx from "xlsx";
import {
  clearDownloadsFolder,
  excelDateToJSDate,
  getDriveFolderId,
  getRowColor,
  getRowValues,
} from "./helpers.js";
import ExcelJS from "exceljs";
import { downloadCommand } from "./google/downloadFolder.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), "..", ".env"),
});

const extractRow = async (sheet, row, index) => {
  const tub = {
    color: getRowColor(sheet, index),
    title: row[1],
    date_entered: row[2] ? excelDateToJSDate(row[2]) : row[2],
    make: row[4],
    model: row[5],
    price: row[6],
    serial_number: row[7],
    type: row[8],
    repair_status: row[9],
    sale_status: row[10],
    date_sold: row[11] ? excelDateToJSDate(row[11]) : row[11],
    length: row[13],
    width: row[14],
    photos: row[15],
  };
  console.log(tub);
  const folderId = getDriveFolderId(tub.photos);
  await downloadCommand(folderId);
  // clearDownloadsFolder();
};

const extractMaster = async () => {
  try {
    const workbook = xlsx.readFile("./master.xlsx");
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const workbook_data = new ExcelJS.Workbook();
    await workbook_data.xlsx.readFile("./master.xlsx");
    const sheet_data = workbook_data.worksheets[0];

    let readingData = true;
    let i = 2;
    while (readingData) {
      const rowValues = getRowValues(sheet, i);
      if (rowValues[0] !== null) {
        extractRow(sheet_data, rowValues, i);
        i += 1;
        readingData = false;
      } else {
        readingData = false;
      }
    }
  } catch (err) {
    console.error("Error reading Excel file:", err);
  }
};
extractMaster();
