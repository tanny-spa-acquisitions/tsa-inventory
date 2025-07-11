"use client";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../../contexts/authContext";
import React from "react";
import { useVideo } from "@/contexts/videoContext";
import CustomInventoryFrame from "@/components/CustomInventoryFrame/CustomInventoryFrame";
import CustomInventoryFrameSkeleton from "@/components/CustomInventoryFrame/CustomInventoryFrameSkeleton";

const ProductsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { inventory, setInventory } = useVideo();

  if (!currentUser) return <></>;

  return (
    <div className="w-full relative px-[30px] pb-[50px]">
      <p className="my-[25px] text-[30px] leading-[30px] tracking-[1px] font-[600] w-[100%] text-center">
        Hot Tub Inventory
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-[30px]">
        {inventory && inventory.length > 0 ? (
          inventory
            .slice(2)
            .reverse()
            .map((item, index) => {
              return (
                <div key={index}>
                  <CustomInventoryFrame item={item} index={index} />
                </div>
              );
            })
        ) : (
          <>
            {Array.from({ length: 6 }, (_, index) => {
              return (
                <div key={index}>
                  <CustomInventoryFrameSkeleton />
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
