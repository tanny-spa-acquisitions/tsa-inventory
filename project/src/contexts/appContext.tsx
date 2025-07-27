"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { fetchInventory } from "../util/functions/Inventory";
import { getCurrentTimestamp } from "@/util/functions/Data";
import axios from "axios";
import { BACKEND_URL } from "@/util/config";
import {
  UseFormGetValues,
  UseFormReturn,
  UseFormSetValue,
} from "react-hook-form";
import { ProductFormData } from "@/components/ProductPage/ProductPage";
import { Product, useContextQueries } from "./queryContext";
import { toast } from "react-toastify";
import { usePathname } from "next/navigation";

type AppContextType = {
  editingLock: boolean;
  setEditingLock: React.Dispatch<React.SetStateAction<boolean>>;
  inventory: any[];
  setInventory: React.Dispatch<React.SetStateAction<any[]>>;
  uploadPopup: boolean;
  setUploadPopup: React.Dispatch<React.SetStateAction<boolean>>;
  handleFiles: (
    files: File[],
    setValue: UseFormSetValue<ProductFormData>,
    getValues: UseFormGetValues<ProductFormData>
  ) => void;
  uploadPopupRef: React.RefObject<HTMLDivElement | null>;
  addProductPage: boolean;
  setAddProductPage: React.Dispatch<React.SetStateAction<boolean>>;
  dataFilters: DataFilters;
  setDataFilters: React.Dispatch<React.SetStateAction<DataFilters>>;
  filteredProducts: (products: Product[]) => Product[];
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProducts: string[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  newRows: Product[];
  setNewRows: React.Dispatch<React.SetStateAction<Product[]>>;
  saveProducts: () => Promise<void>;
  formRefs: React.RefObject<Map<string, UseFormReturn<ProductFormData>>>;
  previousPath: string | null;
};

export type FileImage = {
  name: string;
  file: File;
};

export type DataFilters = {
  listings: "All" | "Active" | "Sold";
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const lastPathRef = useRef<string | null>(null);
  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      setPreviousPath(lastPathRef.current);
      lastPathRef.current = pathname;
    }
  }, [pathname]);

  const { updateProducts } = useContextQueries();
  const [editingLock, setEditingLock] = useState<boolean>(false);

  const [inventory, setInventory] = useState<any[]>([]);
  useEffect(() => {
    fetchInventory().then((data) => {
      setInventory(data);
    });
  }, []);

  const [uploadPopup, setUploadPopup] = useState(false);
  const uploadPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        uploadPopupRef.current &&
        !uploadPopupRef.current.contains(event.target as Node)
      ) {
        setUploadPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSend = async (files: FileImage[]) => {
    const formData = new FormData();
    files.forEach((fileImage, index) => {
      formData.append("files", fileImage.file, fileImage.name);
    });
    try {
      const response = await axios.post(
        BACKEND_URL + "/api/images/compress",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        const isValidUrl = (url: string) =>
          typeof url === "string" && url.startsWith("https://");
        const cleanUrls = response.data.urls.filter(isValidUrl);
        return cleanUrls;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Upload error:", error);
      return [];
    }
  };

  const handleFileProcessing = async (files: File[]): Promise<string[]> => {
    setEditingLock(true);
    const uploadedNames: string[] = [];
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      alert("Only image files are allowed!");
      setEditingLock(false);
      return [];
    }

    const readerPromises = imageFiles.map((file) => {
      return new Promise<FileImage>((resolve) => {
        const extension = file.type.split("/").pop();
        if (!extension) return;

        const lastDotIndex = file.name.lastIndexOf(".");
        if (lastDotIndex === -1) return;

        const newFileName = file.name.slice(0, lastDotIndex);
        let sanitizedFileName = newFileName.replace(/[^a-zA-Z0-9]/g, "_");
        const newExtension = "webp";
        const timeStamp = getCurrentTimestamp();

        sanitizedFileName = `${timeStamp}--${sanitizedFileName}.${newExtension}`;
        uploadedNames.push(sanitizedFileName);
        resolve({ name: sanitizedFileName, file });
      });
    });

    try {
      const images = await Promise.all(readerPromises);
      setUploadPopup(false);
      const urls = await handleSend(images);
      return urls;
    } catch (err) {
      console.error("Error processing files:", err);
      return [];
    } finally {
      setEditingLock(false);
    }
  };

  const handleFiles = async (
    files: File[],
    setValue: UseFormSetValue<ProductFormData>,
    getValues: UseFormGetValues<ProductFormData>
  ) => {
    const newImages = await handleFileProcessing(files);
    if (newImages.length === 0) return;
    const currentImages = getValues("images") || [];
    const updated = [...currentImages, ...newImages];
    setValue("images", updated, { shouldDirty: true });
  };

  const [addProductPage, setAddProductPage] = useState<boolean>(false);

  const [dataFilters, setDataFilters] = useState<DataFilters>({
    listings: "All",
  });
  const filteredProducts = (products: Product[]) => {
    if (products.length === 0) return [];
    if (dataFilters.listings === "All") {
      return products;
    } else if (dataFilters.listings === "Sold") {
      return products.filter(
        (product) =>
          product.sale_status === "Sold Awaiting Delivery" ||
          product.sale_status === "Delivered"
      );
    } else {
      return products.filter(
        (product) =>
          product.sale_status === "Not Yet Posted" ||
          product.sale_status === "Awaiting Sale"
      );
    }
  };

  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [newRows, setNewRows] = useState<Product[]>([]);

  const formRefs = useRef<Map<string, UseFormReturn<ProductFormData>>>(
    new Map()
  );

  const saveProducts = async () => {
    const updatedProducts: Product[] = [];

    for (const [serial, form] of formRefs.current.entries()) {
      // if (
      //   newProduct &&
      //   productsData.filter((item) => item.serial_number === data.serial_number)
      //     .length > 0
      // ) {
      //   toast.error("Serial # is already used on another product");
      //   return;
      // }

      const values = form.getValues();

      if (Object.keys(form.formState.dirtyFields).length === 0) continue;

      updatedProducts.push({
        ...values,
        date_entered: values.date_entered ?? undefined,
        date_sold: values.date_sold ?? undefined,
        note: values.note ?? "",
        images: Array.isArray(values.images) ? values.images : [],
      });
    }

    if (updatedProducts.length === 0 && newRows.length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      setEditingLock(true);
      await updateProducts([...updatedProducts, ...newRows]);
      setNewRows([]);
      formRefs.current.clear();
      toast.success("Products updated");
    } catch (err) {
      toast.error("Failed to update products");
    } finally {
      setEditingLock(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        editingLock,
        setEditingLock,
        inventory,
        setInventory,
        uploadPopup,
        setUploadPopup,
        handleFiles,
        uploadPopupRef,
        addProductPage,
        setAddProductPage,
        dataFilters,
        setDataFilters,
        filteredProducts,
        editMode,
        setEditMode,
        selectedProducts,
        setSelectedProducts,
        newRows,
        setNewRows,
        saveProducts,
        formRefs,
        previousPath,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a AppContextProvider");
  }
  return context;
};
