import jwt from "jsonwebtoken";
import { db } from "../connection/connect.js";
import dotenv from "dotenv";
import { formatDateToMySQL } from "../functions/data.js";
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
