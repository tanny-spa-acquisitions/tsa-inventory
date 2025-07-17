import express from "express";
import {
  getProducts,
  updateProduct,
  deleteProduct,
  syncToGoogleSheets
} from "../controllers/products.js";

const router = express.Router();

router.get("/get", getProducts);
router.post("/update", updateProduct);
router.delete("/delete", deleteProduct);
router.post("/google-sync", syncToGoogleSheets);

export default router;
