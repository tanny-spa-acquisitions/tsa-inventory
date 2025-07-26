"use client";
import { useContext } from "react";
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
import { IoCloseOutline } from "react-icons/io5";
import ProductsHeader from "@/components/ProductsHeader/ProductsHeader";

const ProductsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { productsData, deleteProduct, isLoadingProductsData } =
    useContextQueries();
  const { addProductPage, setAddProductPage, editMode } = useAppContext();
  const modal1 = useModal1Store((state: any) => state.modal1);
  const setModal1 = useModal1Store((state: any) => state.setModal1);

  const handleAddProduct = () => {
    setAddProductPage(true);
  };

  const handleDeleteProduct = async (item: Product) => {
    await deleteProduct(item.serial_number);
  };

  if (!currentUser) return null;

  return (
    <>
      {addProductPage ? (
        <ProductPage newProduct={true} />
      ) : (
        <div className="w-[100%]">
          <ProductsHeader title={"TSA Products"} />
          <div className="w-[100%] relative px-[30px] pb-[50px]">
            <div
              onClick={handleAddProduct}
              style={{
                backgroundColor: appTheme[currentUser.theme].app_color_1,
              }}
              className="cursor-pointer dim hover:brightness-75 items-center justify-center flex z-[900] rounded-full fixed bottom-[45px] right-[45px] w-[50px] h-[50px]"
            >
              <FaPlus className="w-[23px] h-[23px]" color="white" />
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
                            border: `1px solid ${
                              appTheme[currentUser.theme].text_4
                            }`,
                            backgroundColor:
                              appTheme[currentUser.theme].background_1,
                          }}
                          className="ignore-click w-[26px] h-[26px] flex items-center justify-center dim hover:brightness-75 cursor-pointer rounded-[20px] absolute top-[-8px] right-[-9px] z-20"
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
              ) : isLoadingProductsData ? (
                <>
                  {Array.from({ length: 6 }, (_, index) => {
                    return (
                      <div key={index}>
                        <CustomInventoryFrameSkeleton />
                      </div>
                    );
                  })}
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsPage;
