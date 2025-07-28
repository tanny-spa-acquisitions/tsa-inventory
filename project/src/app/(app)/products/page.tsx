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
import { toast } from "react-toastify";
import DraggableProductsGrid from "@/screens/Inventory/DraggableProductsGrid";

const ProductsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { productsData, deleteProducts, isLoadingProductsData } =
    useContextQueries();
  const { addProductPage, setAddProductPage, editMode, dataFilters } =
    useAppContext();

  const handleDeleteProduct = async (item: Product) => {
    try {
      await deleteProducts([item.serial_number]);
      toast.success("Deleted product");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

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

  if (!currentUser) return null;

  return (
    <>
      {addProductPage ? (
        <ProductPage />
      ) : (
        <div className="w-[100%] h-[100%] relative">
          <div className="z-[800] absolute top-0 left-0 h-[60px] w-[100%]">
            <ProductsHeader title={"TSA Products"} />
          </div>
          <div className="absolute h-[calc(100%-70px)] mt-[70px] pt-[8px] overflow-scroll left-0 w-[100%] px-[30px] pb-[50px]">
            {productsData && filteredProducts(productsData).length > 0 ? (
              <div className="w-[100%] h-[100%] overflow-y-scroll">
                {productsData && filteredProducts(productsData).length > 0 && (
                  <DraggableProductsGrid
                    data={filteredProducts(productsData)}
                    sheet={false}
                  />
                )}
                <div className="h-[60px] w-[100%]" />
              </div>
            ) : isLoadingProductsData ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px] md:gap-[30px]">
                {Array.from({ length: 6 }, (_, index) => {
                  return (
                    <div key={index}>
                      <CustomInventoryFrameSkeleton />
                    </div>
                  );
                })}
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsPage;
