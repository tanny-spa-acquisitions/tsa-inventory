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

const ProductsHeader = ({ title }: { title: String }) => {
  const { currentUser } = useContext(AuthContext);
  const { setEditingLock, editMode, setEditMode, dataFilters, setDataFilters } = useAppContext();

  const handleWixSync = async () => {
    setEditingLock(true);
    try {
      await makeRequest.post("/api/products/wix-sync");
      toast.success("Updated Wix Data");
    } catch (e) {
      toast.error("Wix Sync Failed");
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
        alert("Sync failed.");
      } finally {
        setEditingLock(false);
      }
    };

  if (!currentUser) return null;

  return (
    <div className="flex flex-row relative items-center sm:justify-between justify-end h-[60px] mb-[17px] pt-[20px] px-[20px]">
      <div className="hidden sm:flex flex-row gap-[19px] items-center">
        <h1 className="hidden md:flex mt-[-5px] text-2xl font-[600]">{title}</h1>
        <div
          style={{
            backgroundColor: appTheme[currentUser.theme].background_1_2,
          }}
          className="flex w-[202px] pl-[4px] h-[32px] rounded-[18px] flex-row items-center"
        >
          <div
            onClick={() => setDataFilters({ ...dataFilters, listings: "All" })}
            style={{
              backgroundColor:
                dataFilters.listings === "All"
                  ? appTheme[currentUser.theme].background_3
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
            onClick={() =>
              setDataFilters({ ...dataFilters, listings: "Active" })
            }
            style={{
              backgroundColor:
                dataFilters.listings === "Active"
                  ? appTheme[currentUser.theme].background_3
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
            onClick={() => setDataFilters({ ...dataFilters, listings: "Sold" })}
            style={{
              backgroundColor:
                dataFilters.listings === "Sold"
                  ? appTheme[currentUser.theme].background_3
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
      </div>
    </div>
  );
};

export default ProductsHeader;
