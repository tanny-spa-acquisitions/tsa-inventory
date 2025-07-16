import express from "express";
import {
  getProducts,
  updateProduct,
} from "../controllers/products.js";

const router = express.Router();

router.get("/get", getProducts);
router.post("/update", updateProduct);

export default router;
