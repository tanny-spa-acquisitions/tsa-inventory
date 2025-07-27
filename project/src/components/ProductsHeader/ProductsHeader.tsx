"use client";
import React, { useContext } from "react";
import { FiEdit } from "react-icons/fi";
import { PiExport } from "react-icons/pi";
import { BsWindow } from "react-icons/bs";
import { AuthContext } from "@/contexts/authContext";
import { appTheme } from "@/util/appTheme";
import { toast } from "react-toastify";
import { useAppContext } from "@/contexts/appContext";
import { makeRequest } from "@/util/axios";
import { GOOGLE_SHEET_URL } from "@/util/config";
import { GoTrash } from "react-icons/go";
import { IoTrashSharp } from "react-icons/io5";
import { Product, useContextQueries } from "@/contexts/queryContext";
import { usePathname } from "next/navigation";
import Modal2Continue from "@/modals/Modal2Continue";
import { useModal2Store } from "@/store/useModalStore";
import { FaPlus } from "react-icons/fa6";
import Modal2Input from "@/modals/Modal2Input";

const ProductsHeader = ({ title }: { title: String }) => {
  const pathName = usePathname();
  const { currentUser } = useContext(AuthContext);
  const {
    setEditingLock,
    editMode,
    setEditMode,
    dataFilters,
    setDataFilters,
    selectedProducts,
    setSelectedProducts,
    setNewRows,
  } = useAppContext();
  const { deleteProducts } = useContextQueries();
  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);

  const handleWixSync = async () => {
    setEditingLock(true);
    try {
      await makeRequest.post("/api/products/wix-sync");
      toast.success("Updated Wix data");
    } catch (e) {
      toast.error("Wix sync failed");
    } finally {
      setEditingLock(false);
    }
  };

  const handleGoogleExport = async () => {
    setEditingLock(true);
    try {
      await makeRequest.post("/api/products/google-sync");
      window.open(GOOGLE_SHEET_URL, "_blank");
    } catch (e) {
      toast.error("Export failed");
    } finally {
      setEditingLock(false);
    }
  };

  const handleConfirmDelete = () => {
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
        <Modal2Continue
          text={`Delete ${selectedProducts.length} product${
            selectedProducts.length > 1 ? "s" : ""
          } from inventory?`}
          onContinue={handleDeleteSelected}
        />
      ),
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected for deletion");
      return;
    }
    setEditingLock(true);
    try {
      await deleteProducts(selectedProducts);
      toast.success("Deleted successfully");
    } catch (e) {
      if (selectedProducts.length === 1) {
        toast.error("Failed to delete product");
      } else {
        toast.error("Failed to delete products");
      }
    } finally {
      setEditingLock(false);
      setSelectedProducts([]);
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

  if (!currentUser) return null;

  return (
    <div className="flex flex-row relative items-center sm:justify-between justify-end h-[60px] mb-[17px] pt-[20px] px-[20px]">
      <div className="hidden sm:flex flex-row gap-[19px] items-center">
        <h1 className="hidden md:flex mt-[-5px] text-2xl font-[600]">
          {title}
        </h1>
        <div
          style={{
            backgroundColor: appTheme[currentUser.theme].header_1_1,
          }}
          className="flex w-[202px] pl-[4px] h-[32px] rounded-[18px] flex-row items-center"
        >
          <div
            onClick={() => {
              setDataFilters({ ...dataFilters, listings: "All" });
              setSelectedProducts([]);
            }}
            style={{
              backgroundColor:
                dataFilters.listings === "All"
                  ? appTheme[currentUser.theme].header_1_2
                  : "transparent",
            }}
            className="cursor-pointer w-[64px] h-[26px] flex items-center justify-center text-[13px] font-[500] rounded-[18px]"
          >
            All
          </div>
          <div
            className="w-[1px] h-[22px] rounded-[4px]"
            style={{
              opacity: dataFilters.listings === "Sold" ? "0.1" : 0,
              backgroundColor: appTheme[currentUser.theme].text_1,
            }}
          />
          <div
            onClick={() => {
              setDataFilters({ ...dataFilters, listings: "Active" });
              setSelectedProducts([]);
            }}
            style={{
              backgroundColor:
                dataFilters.listings === "Active"
                  ? appTheme[currentUser.theme].header_1_2
                  : "transparent",
            }}
            className="cursor-pointer w-[64px] h-[26px] flex items-center justify-center text-[13px] font-[500] rounded-[18px]"
          >
            Active
          </div>
          <div
            className="w-[1px] h-[22px] rounded-[4px]"
            style={{
              opacity: dataFilters.listings === "All" ? "0.1" : 0,
              backgroundColor: appTheme[currentUser.theme].text_1,
            }}
          />
          <div
            onClick={() => {
              setDataFilters({ ...dataFilters, listings: "Sold" });
              setSelectedProducts([]);
            }}
            style={{
              backgroundColor:
                dataFilters.listings === "Sold"
                  ? appTheme[currentUser.theme].header_1_2
                  : "transparent",
            }}
            className="cursor-pointer w-[64px] h-[26px] flex items-center justify-center text-[13px] font-[500] rounded-[18px]"
          >
            Sold
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-[11px]">
        <div
          style={{
            backgroundColor: appTheme[currentUser.theme].background_2,
          }}
          className="dim hover:brightness-75 rounded-[25px] w-[150px] h-[32px] flex flex-row justify-center items-center gap-[6px] text-[13px] font-[600] cursor-pointer"
          onClick={handleGoogleExport}
        >
          <p
            style={{
              color: appTheme[currentUser.theme].text_1,
            }}
          >
            Export Sheet
          </p>

          <PiExport color={appTheme[currentUser.theme].text_1} size={18} />
        </div>

        <div
          style={{
            backgroundColor: appTheme[currentUser.theme].background_2,
          }}
          className="dim hover:brightness-75 rounded-[25px] w-[140px] h-[32px] flex flex-row justify-center items-center gap-[10px] text-[13px] font-[600] cursor-pointer"
          onClick={handleWixSync}
        >
          <p
            style={{
              color: appTheme[currentUser.theme].text_1,
            }}
          >
            Sync Wix
          </p>

          <BsWindow color={appTheme[currentUser.theme].text_1} size={17} />
        </div>

        <div
          style={{
            backgroundColor: appTheme[currentUser.theme].background_2,
            border: editMode
              ? `1px solid ${appTheme[currentUser.theme].text_1}`
              : "none",
          }}
          className="mr-[2px] dim hover:brightness-75 rounded-[25px] w-[33px] h-[33px] flex flex-row justify-center items-center gap-[10px] text-[15px] cursor-pointer"
          onClick={() => {
            setEditMode((prev) => !prev);
          }}
        >
          <FiEdit
            size={17}
            color={appTheme[currentUser.theme].text_1}
            className="flex items-center justify-center"
          />
        </div>

        <div
          style={{
            backgroundColor: appTheme[currentUser.theme].background_2,
          }}
          className="mr-[2px] dim hover:brightness-75 rounded-[25px] w-[33px] h-[33px] flex flex-row justify-center items-center gap-[10px] text-[15px] cursor-pointer"
          onClick={handleAddRow}
        >
          <FaPlus
            size={17}
            color={appTheme[currentUser.theme].text_1}
            className="flex items-center justify-center"
          />
        </div>

        {selectedProducts.length > 0 && pathName === "/" && (
          <div
            style={{
              backgroundColor: appTheme[currentUser.theme].background_2,
            }}
            className="mr-[2px] dim hover:brightness-75 rounded-[25px] w-[33px] h-[33px] flex flex-row justify-center items-center gap-[10px] text-[15px] cursor-pointer"
            onClick={handleConfirmDelete}
          >
            <IoTrashSharp
              size={18}
              color={appTheme[currentUser.theme].text_1}
              className="flex items-center justify-center"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsHeader;
