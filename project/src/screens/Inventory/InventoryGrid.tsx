"use client";
import ProductsHeader from "@/components/ProductsHeader/ProductsHeader";
import { useAppContext } from "@/contexts/appContext";
import { AuthContext } from "@/contexts/authContext";
import { Product, useContextQueries } from "@/contexts/queryContext";
import { appTheme } from "@/util/appTheme";
import React, { useContext, useRef } from "react";
import { FaCheck } from "react-icons/fa6";
import InventoryRowForm from "./InventoryRowForm";

export type InventoryDataItem = {
  title: string;
  titlePaddingLeft: string;
  className: string;
};

const InventoryGrid = () => {
  const { currentUser } = useContext(AuthContext);
  const { productsData } = useContextQueries();
  const {
    filteredProducts,
    selectedProducts,
    setSelectedProducts,
    newRows,
    setNewRows,
    saveProducts,
    formRefs,
  } = useAppContext();

  const inventoryDataLayout: InventoryDataItem[] = [
    {
      title: "Image",
      titlePaddingLeft: "10px",
      className: "w-[64px]",
    },
    {
      title: "Serial",
      titlePaddingLeft: "6px",
      className: "hidden [@media(min-width:650px)]:flex w-[120px]",
    },
    {
      title: "Title",
      titlePaddingLeft: "2px",
      className: "min-w-[100px] flex-grow basis-0",
    },
    {
      title: "Price ($)",
      titlePaddingLeft: "3px",
      className: "w-[90px] [@media(min-width:550px)]:w-[70px]",
    },
    {
      title: "Make",
      titlePaddingLeft: "6px",
      className:
        "hidden [@media(min-width:800px)]:flex min-w-[80px] flex-grow basis-0",
    },
    {
      title: "Model",
      titlePaddingLeft: "5px",
      className:
        "hidden [@media(min-width:800px)]:flex min-w-[80px] flex-grow basis-0",
    },
    {
      title: "Length",
      titlePaddingLeft: "0px",
      className: "hidden [@media(min-width:1150px)]:flex w-[65px]",
    },
    {
      title: "Width",
      titlePaddingLeft: "3px",
      className: "hidden [@media(min-width:1150px)]:flex w-[65px]",
    },
    {
      title: "Repairs",
      titlePaddingLeft: "4px",
      className: "hidden [@media(min-width:550px)]:flex w-[100px]",
    },
    {
      title: "Sale",
      titlePaddingLeft: "4px",
      className: "hidden [@media(min-width:550px)]:flex w-[100px]",
    },
    {
      title: "Entered",
      titlePaddingLeft: "2px",
      className: "hidden [@media(min-width:1360px)]:flex w-[85px]",
    },
    {
      title: "Sold",
      titlePaddingLeft: "3px",

      className: "hidden [@media(min-width:1360px)]:flex w-[85px]",
    },
    {
      title: "Description",
      titlePaddingLeft: "0px",

      className:
        "hidden [@media(min-width:1550px)]:flex min-w-[100px] flex-grow basis-0",
    },
    {
      title: "Note",
      titlePaddingLeft: "5px",

      className:
        "hidden [@media(min-width:1550px)]:flex min-w-[100px] flex-grow basis-0",
    },
  ];

  const selectAllProducts = () => {
    if (productsData && filteredProducts(productsData).length > 0) {
      const allSerialNumbers = filteredProducts(productsData).map(
        (product: Product) => product.serial_number
      );
      const allSelected =
        selectedProducts.length === filteredProducts(productsData).length &&
        selectedProducts.every((sn) => allSerialNumbers.includes(sn));
      if (allSelected) {
        setSelectedProducts([]);
      } else {
        setSelectedProducts(allSerialNumbers);
      }
    }
  };

  const deleteNewRow = (index: number) => () => {
    const itemIndex = index - productsData.length;
    setNewRows((prev) => {
      if (itemIndex >= 0 && itemIndex < prev.length) {
        return prev.filter((_, i) => i !== itemIndex);
      }
      return prev;
    });
  };

  if (!currentUser) return null;

  return (
    <div className="relative w-[100%] h-[100%] overflow-hidden">
      <div className="z-[800] absolute top-0 left-0 h-[60px] w-[100%]">
        <ProductsHeader title={"TSA Data"} />
      </div>

      <div className="absolute w-[100%] h-[100%] left-0 top-0 px-[20px]">
        <div
          className="mt-[75px] h-[calc(100%-75px)] w-[100%] min-h-[101px] relative rounded-t-[13px]"
          // style={{
          //   border: `0.5px solid ${appTheme[currentUser.theme].background_3}`,
          // }}
        >
          <div
            style={{
              backgroundColor: appTheme[currentUser.theme].background_2,
            }}
            className="absolute top-0 left-0 h-[40px] w-[100%] flex flex-row items-center rounded-t-[13px]"
          >
            <div className="w-[48px] h-[100%] items-center justify-center flex">
              <div
                style={{
                  border: `1px solid ${
                    appTheme[currentUser.theme].background_4
                  }`,
                }}
                onClick={selectAllProducts}
                className="cursor-pointer dim w-[17px] h-[17px] rounded-[4px] flex items-center justify-center"
              >
                <div
                  style={{
                    backgroundColor: appTheme[currentUser.theme].background_4,
                  }}
                  className="w-[8px] h-[1px]"
                ></div>
              </div>
            </div>
            {inventoryDataLayout.map((item: any, index: number) => {
              return (
                <div
                  key={index}
                  style={{
                    paddingLeft: item.titlePaddingLeft,
                  }}
                  className={`font-[500] text-[14px] ${item.className}`}
                >
                  {item.title}
                </div>
              );
            })}
          </div>

          <div className="absolute top-0 left-0 w-[100%] h-[calc(100%-40px)] mt-[40px]">
            <div className="w-[100%] h-[100%] overflow-y-scroll pb-[20px]">
              {productsData &&
                newRows &&
                filteredProducts(productsData).length > 0 &&
                [...filteredProducts(productsData), ...newRows].map(
                  (product: Product, index: number) => (
                    <div
                      style={{
                        borderTop: `0.5px solid ${
                          appTheme[currentUser.theme].background_3
                        }`,
                        borderLeft: `0.5px solid ${
                          appTheme[currentUser.theme].background_3
                        }`,
                        borderRight: `0.5px solid ${
                          appTheme[currentUser.theme].background_3
                        }`,
                        borderBottom:
                          index ===
                          [...filteredProducts(productsData), ...newRows]
                            .length -
                            1
                            ? `1px solid ${
                                appTheme[currentUser.theme].background_3
                              }`
                            : `0.5px solid ${
                                appTheme[currentUser.theme].background_3
                              }`,
                      }}
                      key={index}
                      className="select-none w-[100%] flex flex-row h-[60px] items-center"
                    >
                      <div
                        className="w-[48px] h-[100%] items-center justify-center flex"
                        style={{
                          borderRight: `1px solid ${
                            appTheme[currentUser.theme].background_3
                          }`,
                        }}
                      >
                        {productsData?.some(
                          (p) => p.serial_number === product.serial_number
                        ) ? (
                          <div
                            onClick={() => {
                              if (
                                selectedProducts.includes(product.serial_number)
                              ) {
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
                            {selectedProducts.includes(
                              product.serial_number
                            ) && (
                              <FaCheck
                                color={appTheme[currentUser.theme].text_1}
                                size={11}
                              />
                            )}
                          </div>
                        ) : (
                          <div
                            onClick={deleteNewRow(index)}
                            style={{
                              backgroundColor:
                                appTheme[currentUser.theme].background_2,
                            }}
                            className="cursor-pointer dim w-[17px] h-[17px] rounded-full flex items-center justify-center"
                          >
                            <div
                              style={{
                                backgroundColor:
                                  appTheme[currentUser.theme].text_1,
                              }}
                              className="w-[8px] h-[1px] rounded-[3px]"
                            ></div>
                          </div>
                        )}
                      </div>

                      <InventoryRowForm
                        key={product.serial_number}
                        product={product}
                        inventoryDataLayout={inventoryDataLayout}
                        registerFormRef={(serial, formInstance) => {
                          formRefs.current.set(serial, formInstance);
                        }}
                        saveProducts={saveProducts}
                      />
                    </div>
                  )
                )}
            </div>
          </div>
        </div>
      </div>

      <div
        onClick={saveProducts}
        className="absolute bottom-[35px] right-[30px] h-[40px] w-[110px] font-[600] rounded-[25px] dim cursor-pointer hover:brightness-75 items-center justify-center flex"
        style={{ backgroundColor: appTheme[currentUser.theme].app_color_1 }}
      >
        Save
      </div>
    </div>
  );
};

export default InventoryGrid;
