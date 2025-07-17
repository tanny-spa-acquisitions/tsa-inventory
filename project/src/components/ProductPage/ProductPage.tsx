"use client";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/authContext";
import React from "react";
import { useAppContext } from "@/contexts/appContext";
import { appTheme } from "@/util/appTheme";
import { useModal1Store } from "@/store/useModalStore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Product, useContextQueries } from "@/contexts/queryContext";
import { IoIosAddCircleOutline } from "react-icons/io";
import ProductImages from "@/components/ProductPage/ProductImages";
import Link from "next/link";

const ProductSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  serial_number: z.string().min(1, "Required"),
  make: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  price: z.number().min(0, "Must be a positive number"),
  date_sold: z.date().optional(),
  repair_status: z.enum(["In Progress", "Complete"]),
  sale_status: z.enum([
    "Not Yet Posted",
    "Awaiting Sale",
    "Sold Awaiting Delivery",
    "Delivered",
  ]),
  length: z.number().min(0, "Must be positive"),
  width: z.number().min(0, "Must be positive"),
  note: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

type ProductFormData = z.infer<typeof ProductSchema>;

const ProductPage = ({
  newProduct,
  serialNumber,
}: {
  newProduct: boolean;
  serialNumber?: string;
}) => {
  const { currentUser } = useContext(AuthContext);
  const { setUploadPopup, editingLock, productImages, setProductImages } =
    useAppContext();
  const { updateProduct, productsData } = useContextQueries();
  const modal1 = useModal1Store((state: any) => state.modal1);
  const setModal1 = useModal1Store((state: any) => state.setModal1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      serial_number: "",
      name: "",
      description: "",
      make: "",
      model: "",
      price: 0,
      date_sold: undefined,
      repair_status: "In Progress",
      sale_status: "Not Yet Posted",
      length: 0,
      width: 0,
      note: "",
      images: [],
    },
  });

  const dateSold = watch("date_sold");

  useEffect(() => {
    if (!newProduct && serialNumber && productsData?.length) {
      const matchedProduct = productsData.find(
        (product) => product.serial_number === serialNumber
      );

      if (!matchedProduct) {
        console.warn("No product found for serial number:", serialNumber);
        return;
      }

      Object.entries(matchedProduct).forEach(([key, value]) => {
        if (key === "date_sold" && value) {
          const parsedDate =
            typeof value === "string" || typeof value === "number"
              ? new Date(value)
              : value instanceof Date
              ? value
              : undefined;

          if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
            setValue(key as keyof ProductFormData, parsedDate);
          }
        } else if (key === "price" || key === "length" || key === "width") {
          setValue(key as keyof ProductFormData, Number(value));
        } else if (key === "images" && Array.isArray(value)) {
          setProductImages(value);
        } else {
          setValue(key as keyof ProductFormData, value as any);
        }
      });
    }
  }, [newProduct, serialNumber, productsData, setValue, setProductImages]);

  const resetForm = async () => {
    await setModal1({
      ...modal1,
      open: false,
    });
    reset();
    setProductImages([]);
  };

  const onSubmit = async (data: ProductFormData) => {
    const normalizedData: Product = {
      ...data,
      date_sold: data.date_sold ?? new Date(),
      note: data.note ?? "",
      images: productImages,
    };
    await updateProduct(normalizedData);
    resetForm();
  };

  if (!currentUser) return null;

  if (!newProduct && serialNumber && productsData?.length) {
    const productExists = productsData.some(
      (p) => p.serial_number === serialNumber
    );
    if (!productExists) {
      return (
        <div className="text-center text-xl text-red-500 py-20">
          No product found for serial number: <strong>{serialNumber}</strong>
        </div>
      );
    }
  }

  return (
    <div
      className={`max-w-4xl mx-auto px-10 ${
        newProduct ? "pt-[60px]" : "pt-[22px]"
      } pb-[60px] rounded-2xl overflow-scroll`}
    >
      <div className="absolute flex items-center justify-center right-[63px] top-[7px] w-[40px] h-[40px]">
        {editingLock && (
          <div
            style={{
              border:
                currentUser.theme === "light"
                  ? "3px solid rgba(0, 0, 0, 0.1)"
                  : "3px solid #333",
              borderTop:
                currentUser.theme === "light"
                  ? "3px solid #98d5fd"
                  : "3px solid #dddddd",
            }}
            className="w-[30px] h-[30px] simple-spinner"
          ></div>
        )}
      </div>

      <div
        className="flex flex-row gap-[10px] text-[20px] font-[400] mb-[20px] opacity-[0.5]"
        style={{ color: currentUser.theme === "dark" ? "#bbb" : "black" }}
      >
        {!newProduct && (
          <Link
            href="/products"
            className="cursor-pointer dim hover:brightness-75"
          >
            Products
          </Link>
        )}
        <h1>/</h1>
        {!newProduct && (
          <div className="cursor-pointer dim hover:brightness-75 text-[19px] mt-[1px]">
            {serialNumber}
          </div>
        )}
      </div>

      {newProduct && (
        <h1 className="text-3xl font-[500] mb-[24px]">Add Product</h1>
      )}

      <button
        onClick={() => {
          setUploadPopup(true);
        }}
        className="dim hover:brightness-75 cursor-pointer w-[170px] h-[35px] mb-[13px] gap-[6px] rounded-[6px] text-[15px] flex items-center justify-center font-[500]"
        style={{
          border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
        }}
      >
        <IoIosAddCircleOutline
          className="w-[19px] h-[19px] mt-[1px]"
          color={appTheme[currentUser.theme].text_1}
        />
        Images
      </button>

      <ProductImages />

      <form onSubmit={handleSubmit(onSubmit)} className="gap-[10px] mt-[10px]">
        <div className="w-[100%]">
          <label className="block font-[400]">Name</label>
          <input
            {...register("name")}
            className="input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
            style={{
              border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
            }}
          />
          <p className="text-red-500 text-sm mt-[10px]">
            {errors.name?.message}
          </p>
        </div>
        <div className="w-[100%]">
          <label className="block font-[400]">Description</label>
          <textarea
            {...register("description")}
            className="resize-none input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
            style={{
              border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
            }}
            rows={3}
          />
          <p className="text-red-500 text-sm mt-[10px]">
            {errors.description?.message}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-[10px] gap-x-[5vw]">
          <div className="col-span-2 sm:col-span-1 w-[100%]">
            <label className="block font-[400]">Serial Number</label>
            <input
              {...register("serial_number")}
              className="input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
              style={{
                border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
              }}
            />
            <p className="text-red-500 text-sm mt-[10px]">
              {errors.serial_number?.message}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 w-[100%]">
            <label className="block font-[400]">Price ($)</label>
            <input
              type="number"
              step="1"
              min="0"
              {...register("price", {
                valueAsNumber: true,
                validate: (value) =>
                  /^\d+(\.\d{1,2})?$/.test(value.toString()) ||
                  "Max 2 decimal places",
              })}
              className="input rounded-[7px] w-full mt-[6px] px-[6px] py-[4px]"
              style={{
                border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
              }}
            />
            <p className="text-red-500 text-sm mt-[10px]">
              {errors.price?.message}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 w-[100%]">
            <label className="block font-[400]">Make</label>
            <input
              {...register("make")}
              className="input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
              style={{
                border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
              }}
            />
            <p className="text-red-500 text-sm mt-[10px]">
              {errors.make?.message}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 w-[100%]">
            <label className="block font-[400]">Model</label>
            <input
              {...register("model")}
              className="input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
              style={{
                border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
              }}
            />
            <p className="text-red-500 text-sm mt-[10px]">
              {errors.model?.message}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 w-[100%]">
            <label className="block font-[400]">Repair Status</label>
            <select
              {...register("repair_status")}
              className="input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
              style={{
                border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
              }}
            >
              <option>In Progress</option>
              <option>Complete</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1 w-[100%] mt-[10px] sm:mt-0">
            <label className="block font-[400]">Sale Status</label>
            <select
              {...register("sale_status")}
              className="input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
              style={{
                border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
              }}
            >
              <option>Not Yet Posted</option>
              <option>Awaiting Sale</option>
              <option>Sold Awaiting Delivery</option>
              <option>Delivered</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1 w-[100%] mt-[10px]">
            <label className="block font-[400]">Length (in)</label>
            <input
              type="number"
              {...register("length", { valueAsNumber: true })}
              className="input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
              style={{
                border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
              }}
            />
            <p className="text-red-500 text-sm mt-[10px]">
              {errors.length?.message}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 w-[100%] sm:mt-[10px]">
            <label className="block font-[400]">Width (in)</label>
            <input
              type="number"
              {...register("width", { valueAsNumber: true })}
              className="input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
              style={{
                border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
              }}
            />
            <p className="text-red-500 text-sm mt-[10px]">
              {errors.width?.message}
            </p>
          </div>
          <div className="">
            <label className="block font-[400]">Date Sold</label>
            <div
              className="rounded-[8px] mt-[6px] w-fit"
              style={{
                border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
              }}
            >
              <DatePicker
                selected={dateSold}
                onChange={(date: Date | null) =>
                  setValue("date_sold", date ?? undefined)
                }
                className="input w-[100%] h-[100%] px-[8px] py-[7px]"
                placeholderText="Select Date"
              />
            </div>
          </div>
        </div>
        <div className="w-[100%] mt-[10px]">
          <label className="block font-[400]">Note</label>
          <textarea
            {...register("note")}
            className="resize-none input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
            style={{
              border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
            }}
            rows={2}
          />
        </div>

        <div className="flex flex-row gap-[16px]">
          <button
            type="submit"
            className="cursor-pointer dim hover:brightness-75 mt-[20px] w-[200px] h-[40px] rounded-[8px] text-white font-semibold"
            style={{
              backgroundColor: appTheme[currentUser.theme].app_color_1,
            }}
          >
            <div className="flex items-center justify-center">Submit</div>
          </button>

          {newProduct && (
            <div
              onClick={() => {
                resetForm();
              }}
              className="cursor-pointer dim hover:brightness-75 mt-[20px] w-[200px] h-[40px] rounded-[8px] text-white font-semibold flex items-center justify-center"
              style={{
                backgroundColor: currentUser.theme === "dark" ? "#999" : "#bbb",
              }}
            >
              Cancel
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductPage;
