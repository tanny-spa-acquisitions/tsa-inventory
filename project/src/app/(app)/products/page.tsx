"use client";
import { useContext, useState } from "react";
import { AuthContext } from "../../../contexts/authContext";
import React from "react";
import { useAppContext } from "@/contexts/appContext";
import CustomInventoryFrame from "@/components/CustomInventoryFrame/CustomInventoryFrame";
import CustomInventoryFrameSkeleton from "@/components/CustomInventoryFrame/CustomInventoryFrameSkeleton";
import { appTheme } from "@/util/appTheme";
import { FaPlus } from "react-icons/fa";
import { useModal1Store } from "@/store/useModalStore";
import "react-datepicker/dist/react-datepicker.css";
import { Product, useContextQueries } from "@/contexts/queryContext";
import ProductPage from "../../../components/ProductPage/ProductPage";
import { BsPencilSquare } from "react-icons/bs";
import { IoCloseOutline } from "react-icons/io5";

const ProductsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { productsData, deleteProduct } = useContextQueries();
  const { setProductImages } = useAppContext();
  const modal1 = useModal1Store((state: any) => state.modal1);
  const setModal1 = useModal1Store((state: any) => state.setModal1);

  const [editMode, setEditMode] = useState<boolean>(false);

  const handleAddProduct = () => {
    setProductImages([]);
    setModal1({
      ...modal1,
      open: !modal1.open,
      showClose: true,
      offClickClose: true,
      width: "w-[100vw] h-[100vh] overflow-scroll",
      maxWidth: "",
      aspectRatio: "",
      borderRadius: "",
      content: <ProductPage newProduct={true} />,
    });
  };

  const handleDeleteProduct = async (item: Product) => {
    await deleteProduct(item.serial_number)
  };

  if (!currentUser) return <></>;

  return (
    <div className="w-full relative px-[30px] pb-[50px]">
      <div
        onClick={handleAddProduct}
        style={{
          backgroundColor: appTheme[currentUser.theme].app_color_1,
        }}
        className="cursor-pointer dim hover:brightness-75 items-center justify-center flex z-[900] rounded-full fixed bottom-[45px] right-[45px] w-[50px] h-[50px]"
      >
        <FaPlus className="w-[23px] h-[23px]" color="white" />
      </div>

      <div className="my-[25px] w-[100%] text-center relative">
        <p className="text-[30px] leading-[30px] tracking-[1px] font-[600]">
          Hot Tub Inventory
        </p>
        <BsPencilSquare
          onClick={() => {
            setEditMode((prev) => !prev);
          }}
          size={25}
          color={appTheme[currentUser.theme].text_1}
          style={{ opacity: editMode ? 0.96 : 0.7 }}
          className="absolute dim hover:brightness-75 cursor-pointer right-[10px] top-[5px] flex items-center justify-center"
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-[30px]">
        {productsData && productsData.length > 0 ? (
          productsData.map((item, index) => {
            return (
              <div key={index} className="relative">
                <CustomInventoryFrame item={item} index={index} />
                {editMode && (
                  <div
                    style={{
                      border: `1px solid ${appTheme[currentUser.theme].text_4}`,
                      backgroundColor: appTheme[currentUser.theme].background_1,
                    }}
                    className="ignore-click w-[26px] h-[26px] flex items-center justify-center dim hover:brightness-75 cursor-pointer rounded-[10px] absolute top-[-8px] right-[-9px] z-20"
                    onClick={() => {
                      handleDeleteProduct(item);
                    }}
                  >
                    <IoCloseOutline
                      color={appTheme[currentUser.theme].text_2}
                    />
                  </div>
                )}
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
