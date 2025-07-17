"use client"
import React, { useContext, useEffect, useState } from "react";
import {
  fetchInventory,
  updateRow,
  updateCell,
} from "../../util/functions/Inventory";
import { IoSync } from "react-icons/io5";
import { appTheme } from "../../util/appTheme";
import appDetails from "../../util/appDetails.json";
import { AuthContext } from "@/contexts/authContext";
import { useAppContext } from "@/contexts/appContext";

const InventoryDisplay = () => {
  const { currentUser } = useContext(AuthContext);
  const { inventory, setInventory } = useAppContext()
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<any[]>([]);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditedRow(inventory[index]);
  };

  const handleChange = (e: any, i: number) => {
    const updated = [...editedRow];
    updated[i] = e.target.value;
    setEditedRow(updated);
  };

  const handleSave = async () => {
    if (editIndex === null) return;
    await updateRow(editIndex, editedRow);
    const newData = [...inventory];
    newData[editIndex] = editedRow;
    setInventory(newData);
    setEditIndex(null);
  };

  const handleSync = async () => {
    setInventory([]);
    const data = await fetchInventory();
    setInventory(data);
  };

  const columnWidths: { [key: number]: string } = {
    0: "52px", 
    1: "200px", 
    2: "100px", 
    3: "45px", 
    4: "140px", 
    5: "140px", 
    7: "160px", 
    8: "90px", 
    14: "180px", 
  };
  const DEFAULT_COLUMN_WIDTH = "120px";

  if (!currentUser) return;

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-bold mb-4">Hot Tub Inventory</h1>
        <div
          className="text-2xl mb-4 cursor-pointer hover:opacity-[0.5] transition-all duration-75 ease-in-out"
          onClick={handleSync}
        >
          <IoSync />
        </div>
      </div>
      <div
        style={{
          opacity: inventory.length === 0 ? 0 : 1,
          border:
            currentUser.theme === "light"
              ? "0.6px solid #AAA"
              : "1px solid #333",
        }}
        className="overflow-auto max-w-full rounded-lg shadow"
      >
        <table
          style={{
            border:
              currentUser.theme === "light"
                ? "0.6px solid #AAA"
                : "1px solid #333",
          }}
          className="min-w-[1200px] table-fixed w-full"
        >
          <thead
            style={{
              backgroundColor: appTheme[currentUser.theme].background_1,
            }}
            className="sticky top-0 z-10"
          >
            <tr>
              {inventory[0]?.map((col: string, i: number) => (
                <th
                  key={i}
                  style={{
                    width: columnWidths[i] || DEFAULT_COLUMN_WIDTH,
                    border:
                      currentUser.theme === "light"
                        ? "0.6px solid #AAA"
                        : "1px solid #333",
                  }}
                  className="px-3 py-2 font-semibold text-sm text-left"
                >
                  {col}
                </th>
              ))}
              <th
                style={{
                  border:
                    currentUser.theme === "light"
                      ? "0.6px solid #AAA"
                      : "1px solid #333",
                }}
                className="px-3 py-2 font-semibold text-sm text-left"
              ></th>
            </tr>
          </thead>
          <tbody>
            {inventory.slice(2).map((row, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor:
                    index % 2 === 0
                      ? appTheme[currentUser.theme].table_bg_1
                      : appTheme[currentUser.theme].table_bg_2,
                  color:
                    editIndex === index + 1
                      ? appTheme[currentUser.theme].text_1
                      : "inherit",
                }}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {row.map((cell: string, i: number) => (
                  <td
                    style={{
                      width: columnWidths[i] || DEFAULT_COLUMN_WIDTH,
                      border:
                        currentUser.theme === "light"
                          ? "0.6px solid #AAA"
                          : "1px solid #333",
                    }}
                    key={i}
                    className=" px-3 py-2 text-sm align-top"
                  >
                    {editIndex === index + 1 ? (
                      <input
                        style={{
                          border:
                            currentUser.theme === "light"
                              ? "0.6px solid #AAA"
                              : "1px solid #333",
                        }}
                        className="rounded px-2 py-1 w-full text-sm"
                        value={editedRow[i] || ""}
                        onChange={(e) => handleChange(e, i)}
                      />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
                <td
                  style={{
                    border:
                      currentUser.theme === "light"
                        ? "0.6px solid #AAA"
                        : "1px solid #333",
                  }}
                  className="px-3 py-2 text-sm align-top"
                >
                  {editIndex === index + 1 ? (
                    <button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                  ) : (
                    <></>
                    // <button
                    //   onClick={() => handleEdit(index + 1)}
                    //   className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    // >
                    //   Edit
                    // </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryDisplay;
