import jwt from "jsonwebtoken";
import { db } from "../connection/connect.js";
import { google } from "googleapis";
import axios from "axios";
import dotenv from "dotenv";
import { formatDateToMySQL, formatSQLDate } from "../functions/data.js";
dotenv.config();

export const getProducts = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.json(null);

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return res.status(403).json("Token is invalid!");
    const q = "SELECT * FROM tubs";
    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json({ products: data });
    });
  });
};

export const updateProduct = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Access token missing");

  const {
    serial_number,
    name,
    description,
    note,
    make,
    model,
    price,
    date_sold,
    repair_status,
    sale_status,
    length,
    width,
    images,
  } = req.body.product;

  jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is invalid!");

    const q = `
      INSERT INTO tubs (
        serial_number, name, description, note, make, model, price, type, date_sold,
        repair_status, sale_status, length, width, images
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        description = VALUES(description),
        note = VALUES(note),
        make = VALUES(make),
        model = VALUES(model),
        price = VALUES(price),
        type = VALUES(type),
        date_sold = VALUES(date_sold),
        repair_status = VALUES(repair_status),
        sale_status = VALUES(sale_status),
        length = VALUES(length),
        width = VALUES(width),
        images = VALUES(images)
    `;

    const values = [
      serial_number,
      name,
      description,
      note,
      make,
      model,
      price,
      "TSA",
      date_sold ? formatDateToMySQL(date_sold) : null,
      repair_status,
      sale_status,
      length,
      width,
      JSON.stringify(images),
    ];

    db.query(q, values, (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json("Database error");
      }

      return res.status(200).json({ success: true });
    });
  });
};

export const deleteProduct = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Access token missing");

  const { serial_number } = req.body;

  if (!serial_number) {
    return res.status(400).json("Missing serial number");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is invalid!");

    const q = `DELETE FROM tubs WHERE serial_number = ?`;

    db.query(q, [serial_number], (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json("Database error");
      }

      if (result.affectedRows === 0) {
        return res.status(404).json("Product not found");
      }

      return res.status(200).json({ success: true });
    });
  });
};

export const syncToGoogleSheets = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token.");

  jwt.verify(token, process.env.JWT_SECRET, async (err) => {
    if (err) return res.status(403).json("Invalid token");

    db.query("SELECT * FROM tubs", async (err, data) => {
      if (err) return res.status(500).json(err);

      const spreadsheetId = "1eqbNGSklj9kRzh7jcRG9PtNKURURjy_V8sc3Kz5WJSo";
      const sheetName = "Inventory";

      try {
        // Format the data
        const rows = data.map((row, index) => {
          return [
            index + 1, // index instead of ID
            row.serial_number,
            row.name,
            row.description || "",
            row.note || "",
            row.make || "",
            row.model || "",
            `$${row.price}`,
            row.type || "",
            formatSQLDate(row.date_entered),
            formatSQLDate(row.date_sold),
            row.repair_status,
            row.sale_status,
            row.length || "",
            row.width || "",
            Array.isArray(row.images)
              ? row.images.join(" ")
              : typeof row.images === "string"
              ? JSON.parse(row.images || "[]").join(" ")
              : "",
          ];
        });

        const header = [
          "ID",
          "Serial Number",
          "Name",
          "Description",
          "Note",
          "Make",
          "Model",
          "Price",
          "Type",
          "Date Entered",
          "Date Sold",
          "Repair Status",
          "Sale Status",
          "Length",
          "Width",
          "Images",
        ];

        const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        const parsed = JSON.parse(raw);
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");

        const auth = new google.auth.GoogleAuth({
          credentials: parsed,
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: `${sheetName}!A1:Z`,
        });

        // Overwrite with new data
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1:Z`,
          valueInputOption: "RAW",
          requestBody: {
            values: [header, ...rows],
          },
        });

        // Format header and data rows
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 1,
                  },
                  cell: {
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      horizontalAlignment: "CENTER",
                      wrapStrategy: "CLIP",
                      backgroundColor: {
                        red: 0.9,
                        green: 0.9,
                        blue: 0.9,
                      },
                      padding: {
                        top: 10,
                        bottom: 10,
                      },
                    },
                  },
                  fields:
                    "userEnteredFormat(textFormat,horizontalAlignment,wrapStrategy,backgroundColor,padding)",
                },
              },
              {
                repeatCell: {
                  range: {
                    sheetId: 0,
                    startRowIndex: 1,
                  },
                  cell: {
                    userEnteredFormat: {
                      textFormat: { bold: false },
                      horizontalAlignment: "LEFT",
                      wrapStrategy: "CLIP",
                    },
                  },
                  fields:
                    "userEnteredFormat(textFormat,horizontalAlignment,wrapStrategy)",
                },
              },
              {
                updateDimensionProperties: {
                  range: {
                    sheetId: 0,
                    dimension: "COLUMNS",
                    startIndex: 0,
                    endIndex: 1,
                  },
                  properties: {
                    pixelSize: 50,
                  },
                  fields: "pixelSize",
                },
              },
              {
                updateDimensionProperties: {
                  range: {
                    sheetId: 0,
                    dimension: "COLUMNS",
                    startIndex: 1,
                    endIndex: 5,
                  },
                  properties: {
                    pixelSize: 130,
                  },
                  fields: "pixelSize",
                },
              },
            ],
          },
        });

        return res.json({ success: true });
      } catch (e) {
        console.error(e);
        return res.status(500).json("Google Sheets sync failed.");
      }
    });
  });
};

export const syncToWix = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Unauthorized");
  jwt.verify(token, process.env.JWT_SECRET, async (err) => {
    if (err) return res.status(403).json("Token is invalid!");
    const q = "SELECT * FROM tubs";
    db.query(q, async (err, data) => {
      if (err) return res.status(500).json(err);
      
      const corrected_data = data.map((item) => ({
        serialNumber: item.serial_number,
        sold: !!item.date_sold,
        name: item.name,
        description_fld: item.description || "",
        make: item.make || "",
        model: item.model || "",
        price: parseFloat(item.price) || 0,
        length: parseFloat(item.length) || 0,
        width: parseFloat(item.width) || 0,
        images: item.images?.join(" ") || "",
      }));
      
      try {
        await axios.post(
          "https://tannyspaacquisitions.com/_functions/addHotTub",
          corrected_data,
          {
            headers: {
              Authorization: `Bearer ${process.env.WIX_GENERATED_SECRET}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
            validateStatus: (status) => status < 500,
          }
        );
        return res.status(200).json({ success: true });
      } catch (err) {
        console.error("Failed to sync with Wix:", err.response?.data || err.message);
        return res.status(500).json("Wix sync failed.");
      }
    });
  });
};










// export const syncToWix = async () => {
//   const hotTubData = {
//     serialNumber: "4321",
//     sold: false,
//     name: "Another Tub 2",
//     description_fld: "Soothing luxury 2",
//     make: "DreamTubs 2",
//     model: "XT500",
//     price: 12999,
//     length: 80,
//     width: 85,
//     images: "https://example.com/tub.jpg",
//   };

//   try {
//     const res = await axios.post(
//       "https://tannyspaacquisitions.com/_functions/addHotTub",
//       hotTubData,
//       {
//         headers: {
//           Authorization:
//             "Bearer 06f86df10d2b9dee119ec5f3d879c8431aac47dee6b8bc1bd8eed7900e7165e4",
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   } catch (err) {
//     console.error("Failed to insert:", err.response?.data || err.message);
//   }
// };