"use client";
import ProductsHeader from "@/components/ProductsHeader/ProductsHeader";
import { useAppContext } from "@/contexts/appContext";
import { AuthContext } from "@/contexts/authContext";
import { Product, useContextQueries } from "@/contexts/queryContext";
import { appTheme } from "@/util/appTheme";
import React, { useContext, useRef } from "react";
import { FaCheck } from "react-icons/fa6";
import InventoryRowForm from "./InventoryRowForm";
import { ProductFormData } from "@/util/schemas/productSchema";
import { UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";
import { useModal2Store } from "@/store/useModalStore";
import Modal2Input from "@/modals/Modal2Input";

export type InventoryDataItem = {
  title: string;
  titlePaddingLeft: string;
  className: string;
};

const InventoryGrid = () => {
  const { currentUser } = useContext(AuthContext);
  const { productsData, updateProducts } = useContextQueries();
  const {
    filteredProducts,
    selectedProducts,
    setSelectedProducts,
    setEditingLock,
    newRows,
    setNewRows,
  } = useAppContext();
  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);
  const formRefs = useRef<Map<string, UseFormReturn<ProductFormData>>>(
    new Map()
  );

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

  const saveProducts = async () => {
    const updatedProducts: Product[] = [];

    for (const [serial, form] of formRefs.current.entries()) {
      // if (
      //   newProduct &&
      //   productsData.filter((item) => item.serial_number === data.serial_number)
      //     .length > 0
      // ) {
      //   toast.error("Serial # is already used on another product");
      //   return;
      // }

      const values = form.getValues();

      if (Object.keys(form.formState.dirtyFields).length === 0) continue;

      updatedProducts.push({
        ...values,
        date_entered: values.date_entered ?? undefined,
        date_sold: values.date_sold ?? undefined,
        note: values.note ?? "",
        images: Array.isArray(values.images) ? values.images : [],
      });
    }

    if (updatedProducts.length === 0 && newRows.length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      setEditingLock(true);
      await updateProducts([...updatedProducts, ...newRows]);
      setNewRows([]);
      formRefs.current.clear();
      toast.success("Products updated");
    } catch (err) {
      toast.error("Failed to update products");
    } finally {
      setEditingLock(false);
    }
  };

  const handleAddRow = () => {
    if (!currentUser) return null;
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
        <Modal2Input
          text={`Enter a new product serial number:`}
          onContinue={(newSerial: string, newMake: string, newModel: string) =>
            addRow(newSerial, newMake, newModel)
          }
        />
      ),
    });
  };

  const addRow = (newSerial: string, newMake: string, newModel: string) => {
    const newProduct: Product = {
      serial_number: newSerial,
      name: "",
      price: 0,
      make: newMake,
      model: newModel,
      length: 0,
      width: 0,
      sale_status: "Not Yet Posted",
      repair_status: "In Progress",
      date_entered: undefined,
      date_sold: undefined,
      description: "",
      note: "",
      images: [],
    };
    setNewRows((prev) => [...prev, newProduct]);
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
    <div>
      <ProductsHeader title={"TSA Data"} />
      <div className="w-[100%] px-[20px]">
        <div
          className="w-[100%] min-h-[101px] relative rounded-t-[13px]"
          style={{
            border: `0.5px solid ${appTheme[currentUser.theme].background_3}`,
          }}
        >
          <div
            style={{
              backgroundColor: appTheme[currentUser.theme].background_2,
            }}
            className="w-[100%] flex flex-row h-[40px] items-center rounded-t-[13px]"
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

          {productsData &&
            newRows &&
            filteredProducts(productsData).length > 0 &&
            [...filteredProducts(productsData), ...newRows].map(
              (product: Product, index: number) => (
                <div
                  style={{
                    borderTop: `1px solid ${
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
                        {selectedProducts.includes(product.serial_number) && (
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
                            backgroundColor: appTheme[currentUser.theme].text_1,
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
                  />
                </div>
              )
            )}
        </div>
      </div>
      <div
        onClick={saveProducts}
        className="absolute bottom-[35px] right-[30px] h-[40px] w-[110px] font-[600] rounded-[25px] dim cursor-pointer hover:brightness-75 items-center justify-center flex"
        style={{ backgroundColor: appTheme[currentUser.theme].app_color_1 }}
      >
        Save
      </div>

      <div
        onClick={handleAddRow}
        className="absolute bottom-[35px] right-[150px] h-[40px] w-[110px] font-[600] rounded-[25px] dim cursor-pointer hover:brightness-75 items-center justify-center flex"
        style={{ backgroundColor: appTheme[currentUser.theme].app_color_1 }}
      >
        New
      </div>
    </div>
  );
};

export default InventoryGrid;
