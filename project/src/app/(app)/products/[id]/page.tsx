"use client";
import { AuthContext } from "@/contexts/authContext";
import { useVideo } from "@/contexts/videoContext";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getCurrentTimestamp } from "@/util/functions/Data";
import Upload from "@/components/Upload/Upload";
import { IoCloseOutline } from "react-icons/io5";
import axios from "axios";
import { BACKEND_URL } from "@/util/config";
import { appTheme } from "@/util/appTheme";
import { getNotes, setNotes, updateCell } from "@/util/functions/Inventory";

const ProductPage = () => {
  const { inventory, editingLock, setEditingLock } = useVideo();
  const { currentUser } = useContext(AuthContext);
  const params = useParams();
  const id = params?.id as string;

  const TubIDColumn = 7;

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

  type FileImage = {
    name: string;
    file: File;
  };

  const handleSend = async (files: FileImage[]) => {
    const formData = new FormData();
    files.forEach((fileImage, index) => {
      formData.append("files", fileImage.file, fileImage.name);
    });
    try {
      const response = await axios.post(
        BACKEND_URL + "/api/compress",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        const currentNote = await getNote();
        const urls = response.data.urls;
        const newValue = urls.join(" ");
        await editNote(currentNote.trim().length === 0 ? newValue : currentNote + " " + newValue);
      }
      return response.status === 200;
    } catch (error) {
      console.error("Upload error:", error);
      return false;
    }
  };

  const handleFiles = (files: File[]) => {
    setEditingLock(true);
    const uploadedNames: string[] = [];
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      const readerPromises = imageFiles.map((file) => {
        return new Promise<FileImage>(async (resolve) => {
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

      Promise.all(readerPromises)
        .then(async (images) => {
          setUploadPopup(false);
          await handleSend(images);
        })
        .then(async () => {
          setEditingLock(false);
        });
    } else {
      alert("Only image files are allowed!");
      setEditingLock(false)
    }
  };

  const getNote = async () => {
    const productIndex = inventory.findIndex(
      (item: any) => item[TubIDColumn] === id
    );
    if (productIndex === -1) return;
    const notes = await getNotes(productIndex)
    const note = notes.notes
    return note
  };

  const editNote = async (newValue: any) => {
    const productIndex = inventory.findIndex(
      (item: any) => item[TubIDColumn] === id
    );
    if (productIndex === -1) return;
    setNotes(productIndex, newValue);
  };

  if (!inventory || inventory.length === 0 || !currentUser) return null;
  const productIndex = inventory.findIndex(
    (item: any) => item[TubIDColumn] === id
  );
  if (productIndex === -1) return <div className="p-4">Product not found</div>;
  const product = inventory[productIndex];

  return (
    <div
      className="p-6 max-w-3xl mx-auto"
      style={{ color: appTheme[currentUser.theme].text_1 }}
    >
      <h1 className="text-3xl font-bold mb-2">{product[1]}</h1>
      <p className="text-md font-[400] mb-2">{product[14]}</p>
      <p className="text-md font-[300] mb-2">{product[6]}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* {product.imageUrls.map((url: string, i: number) => (
          <div key={i} className="relative aspect-square w-full rounded overflow-hidden">
            <Image
              src={url}
              alt={`Product image ${i + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))} */}

        <div
          onClick={() => {
            setUploadPopup(true);
          }}
          className="cursor-pointer flex items-center hover:bg-[#EEE] transition-all duration-300 ease-in-out px-[10px] py-[5px] text-[13px] flex-items-center justify-center font-[500]"
          style={{ borderRadius: "3px", border: "1px solid #999" }}
        >
          Upload
        </div>

        {uploadPopup && (
          <div className="z-[999] fixed top-0 left-0">
            <div
              className="absolute top-0 w-[100vw] h-[100vh]"
              style={{ backgroundColor: "black", opacity: 0.4 }}
            ></div>
            <div className="absolute top-0 w-[100vw] h-[100vh] flex items-center justify-center">
              <div
                ref={uploadPopupRef}
                className="w-[70%] aspect-[1.5/1] relative"
                style={{
                  userSelect: "none",
                  backgroundColor: "white",
                  borderRadius: "30px",
                  border: "1.5px solid black",
                }}
              >
                <Upload handleFiles={handleFiles} />
                <IoCloseOutline
                  onClick={() => {
                    setUploadPopup(false);
                  }}
                  className="absolute top-2 right-3"
                  style={{ cursor: "pointer" }}
                  color={appTheme[currentUser.theme].text_3}
                  size={40}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
