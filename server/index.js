import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import https from "https";
import fs from "fs";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import { getSheetData, updateRow } from "./functions/google.js";
import compressRouter from "./routes/compress.js";
import userRoutes from "./routes/users.js";
import { db } from "./connection/connect.js";
dotenv.config();

// const isProduction = process.env.NODE_ENV === "production";
const isProduction = true;

const app = express();
const PORT = process.env.PORT || 8080;

const server = isProduction
  ? http.createServer(app)
  : https.createServer(
      {
        key: fs.readFileSync("./ssl/key.pem"),
        cert: fs.readFileSync("./ssl/cert.pem"),
      },
      app
    );

const __dirname = new URL(".", import.meta.url).pathname;
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// App
app.use((req, res, next) => {
  if (req.headers.authorization) {
    req.accessToken = req.headers.authorization.split(" ")[1];
  }
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : "*",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Database
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed: ", err);
    return;
  }
  console.log("Connected to MySQL Database");
  connection.release();
});

// INVENTORY
app.get("/google/inventory", async (req, res) => {
  try {
    const data = await getSheetData();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/google/update", async (req, res) => {
  const { rowIndex, rowData } = req.body;
  try {
    await updateRow(rowIndex, rowData);
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/api", compressRouter);

server.listen(PORT, () => {
  console.log("API is running on port " + PORT);
});

app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.get("/api/*", (req, res) => {
  res.status(404).json("Page does not exist!");
});
