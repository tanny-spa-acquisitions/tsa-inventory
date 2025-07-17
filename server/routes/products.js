import express from "express";
import {
  getProducts,
  updateProduct,
  deleteProduct
} from "../controllers/products.js";

const router = express.Router();

router.get("/get", getProducts);
router.post("/update", updateProduct);
router.delete("/delete", deleteProduct);

export default router;
