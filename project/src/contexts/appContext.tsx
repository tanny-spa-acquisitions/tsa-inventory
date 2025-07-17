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

type AppContextType = {
  editingLock: boolean;
  setEditingLock: React.Dispatch<React.SetStateAction<boolean>>;
  inventory: any[];
  setInventory: React.Dispatch<React.SetStateAction<any[]>>;
  uploadPopup: boolean;
  setUploadPopup: React.Dispatch<React.SetStateAction<boolean>>;
  handleFiles: (files: File[]) => void;
  uploadPopupRef: React.RefObject<HTMLDivElement | null>;
  productImages: string[];
  setProductImages: React.Dispatch<React.SetStateAction<string[]>>;
};

export type FileImage = {
  name: string;
  file: File;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
        return response.data.urls;
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

  const handleFiles = async (files: File[]) => {
    const newImages = await handleFileProcessing(files);
    setProductImages([...productImages, ...newImages]);
  };

  const [productImages, setProductImages] = useState<string[]>([
    "https://res.cloudinary.com/dsw56yw2e/image/upload/v1752695895/tsa/t0ztnj6oleyzrq9imi2j.webp",
    "https://res.cloudinary.com/dsw56yw2e/image/upload/v1752695894/tsa/soluzd06ni8uvbqyxs4t.webp",
  ]);

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
        productImages,
        setProductImages,
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
