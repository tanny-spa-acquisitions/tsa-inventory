import { appTheme } from "@/util/appTheme";
import { inventoryDataLayout } from "./InventoryGrid";
import InventoryRowForm from "./InventoryRowForm";
import { RiDraggable } from "react-icons/ri";
import { useAppContext } from "@/contexts/appContext";
import { Product, useContextQueries } from "@/contexts/queryContext";
import { AuthContext } from "@/contexts/authContext";
import React, { useContext, useEffect } from "react";
import { FaCheck } from "react-icons/fa6";
import { ProductFormData } from "@/util/schemas/productSchema";
import { useForm } from "react-hook-form";

const InventoryRow = ({
  index,
  product,
}: {
  index: number;
  product: Product;
}) => {
  const { currentUser } = useContext(AuthContext);

  const {
    filteredProducts,
    editMode,
    selectedProducts,
    setSelectedProducts,
    formRefs,
  } = useAppContext();
  const { productsData, localData, setLocalData } = useContextQueries();

  const deleteNewRow = (serial: string) => () => {
    setLocalData((prev) =>
      prev.filter((item) => item.serial_number !== serial)
    );
  };

  const form = useForm<ProductFormData>({
    defaultValues: product,
  });

  useEffect(() => {
    form.reset(product);
  }, [product]);


  if (!currentUser) return null;

  return (
    <div
      style={{
        backgroundColor: appTheme[currentUser.theme].background_1,
        borderTop: `0.5px solid ${appTheme[currentUser.theme].background_3}`,
        borderLeft: `0.5px solid ${appTheme[currentUser.theme].background_3}`,
        borderRight: `0.5px solid ${appTheme[currentUser.theme].background_3}`,
        borderBottom:
          index === filteredProducts(localData).length - 1
            ? `1px solid ${appTheme[currentUser.theme].background_3}`
            : `0.5px solid ${appTheme[currentUser.theme].background_3}`,
      }}
      className="select-none w-[100%] flex flex-row h-[60px] items-center"
    >
      <div
        className={`${
          editMode && "hover:brightness-75 dim"
        } w-[48px] h-[100%] items-center justify-center flex`}
        style={{
          cursor: editMode ? "pointer" : "auto",
          borderRight: `1px solid ${appTheme[currentUser.theme].background_3}`,
        }}
      >
        {editMode ? (
          <RiDraggable className="opacity-[0.5]" size={23}></RiDraggable>
        ) : (
          <>
            {productsData?.some(
              (p) => p.serial_number === product.serial_number
            ) ? (
              <div
                onClick={() => {
                  if (selectedProducts.includes(product.serial_number)) {
                    setSelectedProducts(
                      selectedProducts.filter(
                        (sn) => sn !== product.serial_number
                      )
                    );
                  } else {
                    setSelectedProducts([
                      ...selectedProducts,
                      product.serial_number,
                    ]);
                  }
                }}
                style={{
                  border: `1px solid ${
                    appTheme[currentUser.theme].background_3
                  }`,
                  backgroundColor: selectedProducts.includes(
                    product.serial_number
                  )
                    ? appTheme[currentUser.theme].app_color_1
                    : "transparent",
                }}
                className="cursor-pointer dim w-[17px] h-[17px] rounded-[4px] flex items-center justify-center"
              >
                {selectedProducts.includes(product.serial_number) && (
                  <FaCheck
                    color={appTheme[currentUser.theme].text_1}
                    size={11}
                  />
                )}
              </div>
            ) : (
              <div
                onClick={deleteNewRow(product.serial_number)}
                style={{
                  backgroundColor: appTheme[currentUser.theme].background_2,
                }}
                className="cursor-pointer dim w-[17px] h-[17px] rounded-full flex items-center justify-center"
              >
                <div
                  style={{
                    backgroundColor: appTheme[currentUser.theme].text_1,
                  }}
                  className="w-[8px] h-[1px] rounded-[3px]"
                ></div>
              </div>
            )}
          </>
        )}
      </div>

      <InventoryRowForm
        product={product}
        inventoryDataLayout={inventoryDataLayout}
        registerFormRef={(serial, formInstance) => {
          formRefs.current.set(serial, formInstance);
        }}
      />
    </div>
  );
};

export default InventoryRow;
