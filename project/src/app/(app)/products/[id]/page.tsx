"use client";
import { AuthContext } from "@/contexts/authContext";
import { useVideo } from "@/contexts/videoContext";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Upload from "@/components/Upload/Upload";
import { IoCloseOutline } from "react-icons/io5";
import { appTheme } from "@/util/appTheme";
import { getNotes, setNotes, updateCell } from "@/util/functions/Inventory";

const ProductPage = () => {
  const { inventory, uploadPopup, setUploadPopup, handleFiles } = useVideo();
  const { currentUser } = useContext(AuthContext);
  const params = useParams();
  const id = params?.id as string;

  const TubIDColumn = 7;

  // const getNote = async () => {
  //   const productIndex = inventory.findIndex(
  //     (item: any) => item[TubIDColumn] === id
  //   );
  //   if (productIndex === -1) return;
  //   const notes = await getNotes(productIndex)
  //   const note = notes.notes
  //   return note
  // };

  // const editNote = async (newValue: any) => {
  //   const productIndex = inventory.findIndex(
  //     (item: any) => item[TubIDColumn] === id
  //   );
  //   if (productIndex === -1) return;
  //   setNotes(productIndex, newValue);
  // };

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
      </div>
    </div>
  );
};

export default ProductPage;
