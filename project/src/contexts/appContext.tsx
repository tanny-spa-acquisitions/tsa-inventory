"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { fetchInventory } from "../util/functions/Inventory";
import { getCurrentTimestamp, getNextOrdinal } from "@/util/functions/Data";
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
import { usePathname, useRouter } from "next/navigation";
import { useModal2Store } from "@/store/useModalStore";
import Modal2Continue from "@/modals/Modal2Continue";

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
  saveProducts: () => Promise<void>;
  productFormRef: React.RefObject<UseFormReturn<ProductFormData> | null>;
  formRefs: React.RefObject<Map<string, UseFormReturn<ProductFormData>>>;
  previousPath: string | null;
  pageClick: (newPage: string) => void;
  onSubmit: (
    data: ProductFormData,
    overrideNewProduct?: boolean
  ) => Promise<boolean>;
  submitProductForm: () => Promise<boolean>;
  resetTimer: () => void;
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
  const { productsData, localDataRef } = useContextQueries();
  const pathname = usePathname();
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const lastPathRef = useRef<string | null>(null);
  const router = useRouter();
  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);

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

  const formRefs = useRef<Map<string, UseFormReturn<ProductFormData>>>(
    new Map()
  );
  type ProductFormRef = React.RefObject<UseFormReturn<ProductFormData> | null>;
  const productFormRef: ProductFormRef = useRef(null);

  const saveProducts = async () => {
    let updatedProducts: Product[] = [];

    const localData = localDataRef.current;

    // Step 1: Build a map from serial -> ordinal (from localDataRef)
    const ordinalMap = new Map<string, number>();
    for (const item of localData) {
      ordinalMap.set(item.serial_number, item.ordinal);
    }

    // Step 2: Loop through formRefs and override values with the form ones
    for (const [serial, form] of formRefs.current.entries()) {
      const values = form.getValues();
      const isDirty = Object.keys(form.formState.dirtyFields).length > 0;

      const stored = productsData.find((p) => p.serial_number === serial);
      const currentOrdinal = ordinalMap.get(serial);
      const ordinalChanged = stored?.ordinal !== currentOrdinal;

      if (isDirty || ordinalChanged) {
        updatedProducts.push({
          ...values,
          date_entered: values.date_entered ?? undefined,
          date_sold: values.date_sold ?? undefined,
          note: values.note ?? "",
          images: Array.isArray(values.images) ? values.images : [],
          ordinal: currentOrdinal ?? 0,
        });
      }
    }

    // Step 3: Handle any new items in localData that weren’t in formRefs (e.g., new unsaved items)
    for (const item of localData) {
      const existsInForm = formRefs.current.has(item.serial_number);
      const existsInUpdated = updatedProducts.some(
        (p) => p.serial_number === item.serial_number
      );
      const stored = productsData.find(
        (p) => p.serial_number === item.serial_number
      );

      const ordinalChanged = stored?.ordinal !== item.ordinal;

      if (!existsInForm && ordinalChanged && !existsInUpdated) {
        updatedProducts.push(item);
      }
    }

    if (updatedProducts.length === 0) {
      // toast.info("No changes to save", {
      //   toastId: "no-changes-toast",
      // });
      return;
    }

    cancelTimer();

    try {
      setEditingLock(true);
      await updateProducts(updatedProducts);
      for (const [, form] of formRefs.current.entries()) {
        form.reset(form.getValues());
      }
      // toast.success("Products updated");
    } catch (err) {
      toast.error("Failed to update products");
    } finally {
      setEditingLock(false);
    }
  };

  const promptSave = (onNoSave: () => void, onContinue: () => void) => {
    setModal2({
      ...modal2,
      open: !modal2.open,
      showClose: false,
      offClickClose: true,
      width: "w-[300px]",
      maxWidth: "max-w-[400px]",
      aspectRatio: "aspect-[5/2]",
      borderRadius: "rounded-[12px] md:rounded-[15px]",
      content: (
        <Modal2Continue
          text={`Save products before continuing?`}
          onContinue={onContinue}
          threeOptions={true}
          onNoSave={onNoSave}
        />
      ),
    });
  };

  const pageClick = (newPage: string) => {
    if (pathname === "/") {
      if (newPage === "/") return;
      let dirtyRows = 0;
      for (const [serial, form] of formRefs.current.entries()) {
        if (Object.keys(form.formState.dirtyFields).length !== 0) {
          dirtyRows += 1;
        }
      }
      // if (localData.length > productsData.length || dirtyRows > 0) {
      const localDataCurrent = localDataRef.current;
      if (localDataCurrent.length > productsData.length || dirtyRows > 0) {
        const onContinue = async () => {
          await saveProducts();
          router.push(newPage);
        };
        promptSave(() => router.push(newPage), onContinue);
      } else {
        router.push(newPage);
      }
    } else if (pathname.startsWith("/products")) {
      const onContinue = async () => {
        const result = await submitProductForm();
        if (result) {
          router.push(newPage);
        }
      };
      if (pathname === "/products") {
        if (addProductPage) {
          promptSave(() => router.push(newPage), onContinue);
        } else {
          router.push(newPage);
        }
      } else {
        const isDirty = productFormRef?.current?.formState?.isDirty;
        if (isDirty) {
          promptSave(() => router.push(newPage), onContinue);
        } else {
          router.push(newPage);
        }
      }
    } else {
      router.push(newPage);
    }
  };

  const onSubmit = async (
    data: ProductFormData,
    overrideNewProduct?: boolean
  ): Promise<boolean> => {
    try {
      const isNew = overrideNewProduct ?? addProductPage;

      if (data.serial_number.length !== 14) {
        toast.error("Serial # is not 14 characters");
        return false;
      }

      const existing = productsData.find(
        (item) => item.serial_number === data.serial_number
      );

      if (isNew && existing) {
        toast.error("Serial # is already used on another product");
        return false;
      }

      const ordinal = existing?.ordinal ?? getNextOrdinal(productsData);
      const normalizedData: Product = {
        ...data,
        note: data.note ?? "",
        images: Array.isArray(data.images) ? data.images : [],
        ordinal,
      };

      await updateProducts([normalizedData]);
      // toast.success("Updated products");
      return true;
    } catch (error) {
      toast.error("Error updating products");
      return false;
    }
  };

  const submitProductForm = async () => {
    const form = productFormRef.current;
    if (!form) return false;
    const data = form.getValues();
    try {
      return await onSubmit(data);
    } catch (err) {
      return false;
    }
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(async () => {
      console.log("Saving");
      await saveProducts();
    }, 3000);
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    startTimer();
  };

  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
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
        saveProducts,
        formRefs,
        productFormRef,
        previousPath,
        pageClick,
        onSubmit,
        submitProductForm,
        resetTimer,
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
