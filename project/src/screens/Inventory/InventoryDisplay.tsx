// "use client";
// import React, { useContext, useEffect, useState } from "react";
// import { appTheme } from "../../util/appTheme";
// import { AuthContext } from "@/contexts/authContext";
// import { useAppContext } from "@/contexts/appContext";
// import { Product, useContextQueries } from "@/contexts/queryContext";
// import { formatSQLDate, parseDateString } from "@/util/functions/Data";
// import Link from "next/link";
// import Image from "next/image";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import ProductsHeader from "@/components/ProductsHeader/ProductsHeader";

// const InventoryDisplay = () => {
//   const { currentUser } = useContext(AuthContext);
//   const { productsData, updateProduct, deleteProducts } = useContextQueries();
//   const { editMode, setEditMode } = useAppContext();
//   const [editIndex, setEditIndex] = useState<number | null>(null);
//   const [editedRow, setEditedRow] = useState<any>({});

//   const handleEdit = (index: number) => {
//     setEditIndex(index);
//     setEditedRow({ ...productsData[index] });
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | Date,
//     key: keyof Product,
//     overrideValue?: string
//   ) => {
//     if (e instanceof Date) {
//       setEditedRow((prev: Product) => ({
//         ...prev,
//         [key]: e.toISOString(),
//       }));
//       return;
//     }
//     const value = overrideValue ?? e.target.value;
//     setEditedRow((prev: Product) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   const handleSave = async () => {
//     if (editIndex === null) return;
//     try {
//       const requiredDateFields = [
//         "date_entered",
//         "date_sold",
//       ] as (keyof Product)[];
//       for (const field of requiredDateFields) {
//         if (
//           editedRow[field] &&
//           !parseDateString(formatSQLDate(editedRow[field], true))
//         ) {
//           alert(`Invalid date format in ${field}. Please fix it.`);
//           return;
//         }
//       }
//       await updateProduct(editedRow);
//       setEditIndex(null);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleDeleteProduct = async (item: Product) => {
//     await deleteProducts([item.serial_number]);
//   };

//   const columnWidths: { [key: string]: string } = {
//     id: "60px",
//     name: "200px",
//     description: "200px",
//     note: "200px",
//     make: "140px",
//     model: "140px",
//     price: "100px",
//     serial_number: "180px",
//     type: "90px",
//     repair_status: "140px",
//     sale_status: "140px",
//     date_entered: "160px",
//     date_sold: "160px",
//     length: "80px",
//     width: "80px",
//     images: "130px",
//   };
//   const DEFAULT_COLUMN_WIDTH = "120px";

//   const repairStatusOptions = ["In Progress", "Complete"];
//   const saleStatusOptions = [
//     "Not Yet Posted",
//     "Awaiting Sale",
//     "Sold Awaiting Delivery",
//     "Delivered",
//   ];

//   if (!currentUser || productsData.length === 0) return null;

//   const columns = Object.keys(productsData[0]) as (keyof Product)[];

//   return (
//     <div className="">
//       <ProductsHeader title={"TSA Database"}/>
//       <div className="flex flex-row">
//         {editMode && (
//           <div className="mr-[15px] flex flex-col">
//             {productsData.map((item, index) => (
//               <div className="h-[40px] mt-[40px] items-center flex" key={index}>
//                 <div
//                   onClick={() => handleDeleteProduct(item)}
//                   className="dim hover:brightness-75 cursor-pointer bg-red-400 w-[20px] h-[20px] rounded-full flex items-center justify-center"
//                 >
//                   <div className="h-[2px] w-[10px] rounded-[3px] bg-white"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//         <div
//           style={{
//             opacity: productsData.length === 0 ? 0 : 1,
//             border:
//               currentUser.theme === "light"
//                 ? "0.6px solid #AAA"
//                 : "1px solid #333",
//           }}
//           className="overflow-auto max-w-full"
//         >
//           <table
//             style={{
//               border:
//                 currentUser.theme === "light"
//                   ? "0.6px solid #AAA"
//                   : "1px solid #333",
//             }}
//             className="min-w-[1200px] table-fixed w-full"
//           >
//             <thead
//               style={{
//                 backgroundColor: appTheme[currentUser.theme].background_1_2,
//               }}
//               className="sticky top-0 z-10"
//             >
//               <tr>
//                 {columns.map((key) => (
//                   <th
//                     key={key}
//                     style={{
//                       width: columnWidths[key] || DEFAULT_COLUMN_WIDTH,
//                       border:
//                         currentUser.theme === "light"
//                           ? "0.6px solid #AAA"
//                           : "1px solid #333",
//                     }}
//                     className="px-3 py-2 font-semibold text-sm text-left capitalize"
//                   >
//                     {key.replace(/_/g, " ")}
//                   </th>
//                 ))}
//                 <th
//                   style={{
//                     border:
//                       currentUser.theme === "light"
//                         ? "0.6px solid #AAA"
//                         : "1px solid #333",
//                   }}
//                   className="px-3 py-2 font-semibold text-sm text-left"
//                 ></th>
//               </tr>
//             </thead>

//             <tbody>
//               {productsData.map((product, index) => (
//                 <tr
//                   key={index}
//                   style={{
//                     backgroundColor:
//                       index % 2 === 0
//                         ? appTheme[currentUser.theme].table_bg_1
//                         : appTheme[currentUser.theme].table_bg_2,
//                     color:
//                       editIndex === index
//                         ? appTheme[currentUser.theme].text_1
//                         : "inherit",
//                   }}
//                 >
//                   {columns.map((key, columnIndex) => (
//                     <td
//                       key={key}
//                       style={{
//                         width: columnWidths[key] || DEFAULT_COLUMN_WIDTH,
//                         border:
//                           currentUser.theme === "light"
//                             ? "0.6px solid #AAA"
//                             : "1px solid #333",
//                       }}
//                       className="px-3 h-[40px] text-sm align-center"
//                     >
//                       {editIndex === index &&
//                       (key as String) !== "id" &&
//                       (key as String) !== "serial_number" &&
//                       (key as String) !== "date_entered" &&
//                       (key as String) !== "images" ? (
//                         key === "repair_status" ? (
//                           <select
//                             className="rounded px-2 py-1 w-full text-sm"
//                             style={{
//                               border:
//                                 currentUser.theme === "light"
//                                   ? "0.6px solid #AAA"
//                                   : "1px solid #333",
//                             }}
//                             value={editedRow[key] ?? ""}
//                             onChange={(e) => handleChange(e, key)}
//                           >
//                             {repairStatusOptions.map((option) => (
//                               <option key={option} value={option}>
//                                 {option}
//                               </option>
//                             ))}
//                           </select>
//                         ) : key === "sale_status" ? (
//                           <select
//                             className="rounded px-2 py-1 w-full text-sm"
//                             style={{
//                               border:
//                                 currentUser.theme === "light"
//                                   ? "0.6px solid #AAA"
//                                   : "1px solid #333",
//                             }}
//                             value={editedRow[key] ?? ""}
//                             onChange={(e) => handleChange(e, key)}
//                           >
//                             {saleStatusOptions.map((option) => (
//                               <option key={option} value={option}>
//                                 {option}
//                               </option>
//                             ))}
//                           </select>
//                         ) : (
//                           <>
//                             {(key as String) === "date_entered" ||
//                             (key as String) === "date_sold" ? (
//                               <DatePicker
//                                 selected={
//                                   editedRow[key]
//                                     ? new Date(editedRow[key])
//                                     : null
//                                 }
//                                 onChange={(date) =>
//                                   handleChange(date as Date, key)
//                                 }
//                                 dateFormat="MM-dd-yyyy"
//                                 className="rounded px-2 py-1 w-full text-sm"
//                                 placeholderText="Select Date"
//                               />
//                             ) : (
//                               <input
//                                 className="rounded px-2 py-1 w-full text-sm"
//                                 style={{
//                                   border:
//                                     currentUser.theme === "light"
//                                       ? "0.6px solid #AAA"
//                                       : "1px solid #333",
//                                 }}
//                                 value={editedRow[key] ?? ""}
//                                 onChange={(e) => {
//                                   const rawValue = e.target.value;
//                                   const shouldFilter = [
//                                     "price",
//                                     "width",
//                                     "length",
//                                   ].includes(key);
//                                   const filteredValue = shouldFilter
//                                     ? rawValue.replace(/[^0-9.]/g, "")
//                                     : rawValue;
//                                   handleChange(e, key, filteredValue);
//                                 }}
//                               />
//                             )}
//                           </>
//                         )
//                       ) : Array.isArray(product[key]) ? (
//                         <Link
//                           href={`/products/${product["serial_number"]}`}
//                           className="dim hover:brightness-75 flex flex-row gap-[5px]"
//                         >
//                           {product[key].length > 0 && (
//                             <Image
//                               src={product[key][0]}
//                               alt="product image 1"
//                               width={28}
//                               height={28}
//                               className="object-cover rounded-[5px] w-[28px] h-[28px]"
//                             />
//                           )}
//                           {product[key].length > 1 && (
//                             <Image
//                               src={product[key][1]}
//                               alt="product image 2"
//                               width={28}
//                               height={28}
//                               className="object-cover rounded-[5px] w-[28px] h-[28px]"
//                             />
//                           )}
//                           {product[key].length > 2 && (
//                             <Image
//                               src={product[key][2]}
//                               alt="product image 3"
//                               width={28}
//                               height={28}
//                               className="object-cover rounded-[5px] w-[28px] h-[28px]"
//                             />
//                           )}
//                         </Link>
//                       ) : (key as string) === "id" ? (
//                         index + 1
//                       ) : key === "price" ? (
//                         "$" + String(product[key])
//                       ) : (key as string) === "date_entered" ||
//                         (key as string) === "date_sold" ? (
//                         formatSQLDate(String(product[key]))
//                       ) : key === "serial_number" ? (
//                         <Link
//                           href={`/products/${product["serial_number"]}`}
//                           className="dim hover:brightness-75 flex flex-row gap-[5px]"
//                         >
//                           {String(product[key])}
//                         </Link>
//                       ) : (
//                         String(product[key])
//                       )}
//                     </td>
//                   ))}
//                   <td
//                     style={{
//                       border:
//                         currentUser.theme === "light"
//                           ? "0.6px solid #AAA"
//                           : "1px solid #333",
//                     }}
//                     className="px-3 py-2 text-sm align-top"
//                   >
//                     {editIndex === index ? (
//                       <button
//                         onClick={handleSave}
//                         className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
//                       >
//                         Save
//                       </button>
//                     ) : (
//                       <button
//                         onClick={() => handleEdit(index)}
//                         className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
//                       >
//                         Edit
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InventoryDisplay;

import React from 'react'

const InventoryDisplay = () => {
  return (
    <div>InventoryDisplay</div>
  )
}

export default InventoryDisplay
