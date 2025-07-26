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
import { useRouter } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import UploadModal from "../Upload/Upload";

const ProductSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  serial_number: z
    .string()
    .min(14, "14 Characters Required")
    .transform((val) => val.toUpperCase())
    .refine((val) => /^[A-Z0-9]+$/.test(val), {
      message: "Only uppercase letters and numbers allowed",
    }),
  make: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  price: z
    .number()
    .min(0, "Must be a positive number")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(String(val)), {
      message: "Max 2 decimal places",
    }),
  date_sold: z.date().optional(),
  date_entered: z.date().optional(),
  repair_status: z.enum(["In Progress", "Complete"]),
  sale_status: z.enum([
    "Not Yet Posted",
    "Awaiting Sale",
    "Sold Awaiting Delivery",
    "Delivered",
  ]),
  length: z
    .number()
    .min(0, "Must be a positive number")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(String(val)), {
      message: "Max 2 decimal places",
    }),
  width: z
    .number()
    .min(0, "Must be a positive number")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(String(val)), {
      message: "Max 2 decimal places",
    }),
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
  const { setUploadPopup, editingLock, setAddProductPage } = useAppContext();
  const { updateProduct, productsData } = useContextQueries();
  const modal1 = useModal1Store((state: any) => state.modal1);
  const setModal1 = useModal1Store((state: any) => state.setModal1);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty },
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
      date_entered: undefined,
      repair_status: "In Progress",
      sale_status: "Not Yet Posted",
      length: 0,
      width: 0,
      note: "",
      images: [],
    },
  });

  const dateSold = watch("date_sold");
  const dateEntered = watch("date_entered");
  const images = watch("images");

  useEffect(() => {
    if (!newProduct && serialNumber && productsData?.length) {
      const matchedProduct = productsData.find(
        (product) => product.serial_number === serialNumber
      );

      if (!matchedProduct) {
        console.warn("No product found for serial number:", serialNumber);
        return;
      }

      const formDefaults: Partial<ProductFormData> = {
        ...matchedProduct,
        date_sold: matchedProduct.date_sold
          ? new Date(matchedProduct.date_sold)
          : undefined,
        date_entered: matchedProduct.date_entered
          ? new Date(matchedProduct.date_entered)
          : undefined,
        price: matchedProduct.price ? Number(matchedProduct.price) : 0,
        length: matchedProduct.length ? Number(matchedProduct.length) : 0,
        width: matchedProduct.width ? Number(matchedProduct.width) : 0,
      };

      reset(formDefaults);
    }
  }, [newProduct, serialNumber, productsData, reset]);

  const resetForm = async () => {
    await setModal1({
      ...modal1,
      open: false,
    });
    reset();
  };

  const onSubmit = async (data: ProductFormData) => {
    const normalizedData: Product = {
      ...data,
      note: data.note ?? "",
      images: Array.isArray(data.images) ? data.images : [],
    };
    await updateProduct(normalizedData);
    resetForm();
    handleBackButton();
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

  const handleBackButton = () => {
    if (newProduct) {
      setAddProductPage(false);
    } else {
      router.push("/products");
    }
  };

  return (
    <div>
      <UploadModal setValue={setValue} getValues={getValues} />
      <div
        className={`max-w-4xl mx-auto px-10 ${
          newProduct ? "pt-[60px]" : "pt-[22px]"
        } pb-[60px] rounded-2xl overflow-scroll`}
      >
        <div className="flex flex-row gap-[13px] mb-[10px]">
          <div
            onClick={handleBackButton}
            style={{
              backgroundColor: appTheme[currentUser.theme].background_2,
            }}
            className="w-[40px] h-[40px] rounded-[20px] flex items-center justify-center pr-[2px] pb-[1px] dim hover:brightness-75 cursor-pointer"
          >
            <FaChevronLeft
              size={21}
              color={appTheme[currentUser.theme].text_1}
            />
          </div>

          {newProduct && (
            <div className="">
              <h1 className="text-3xl font-[500] mb-[24px]">Add Product</h1>
            </div>
          )}

          {!newProduct && (
            <div
              className="ml-[2px] flex flex-row gap-[10px] text-[25px] font-[400] mb-[20px] opacity-[0.5]"
              style={{ color: currentUser.theme === "dark" ? "#bbb" : "black" }}
            >
              <Link
                href="/products"
                className="cursor-pointer dim hover:brightness-75"
              >
                Products
              </Link>

              <h1>/</h1>

              <div className="cursor-pointer dim hover:brightness-75 text-[23px] mt-[1px]">
                {serialNumber}
              </div>
            </div>
          )}
        </div>

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

        <ProductImages
          images={images ?? []}
          setValue={setValue}
          getValues={getValues}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="gap-[10px] mt-[10px]"
        >
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
                disabled={!newProduct}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");
                }}
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
                type="text"
                inputMode="decimal"
                pattern="^\d+(\.\d{0,2})?$"
                {...register("price", {
                  required: "Price is required",
                  validate: (value) =>
                    /^\d+(\.\d{1,2})?$/.test(String(value)) ||
                    "Max 2 decimal places",
                  setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
                })}
                onInput={(e) => {
                  let value = e.currentTarget.value;
                  value = value.replace(/[^0-9.]/g, "");
                  const parts = value.split(".");
                  if (parts.length > 2) {
                    value = parts[0] + "." + parts[1];
                  }
                  if (parts[1]?.length > 2) {
                    parts[1] = parts[1].slice(0, 2);
                    value = parts[0] + "." + parts[1];
                  }
                  e.currentTarget.value = value;
                }}
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
                type="text"
                inputMode="decimal"
                pattern="^\d+(\.\d{0,2})?$"
                {...register("length", {
                  required: "Length is required",
                  validate: (value) =>
                    /^\d+(\.\d{1,2})?$/.test(String(value)) ||
                    "Max 2 decimal places",
                  setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
                })}
                onInput={(e) => {
                  let value = e.currentTarget.value;
                  value = value.replace(/[^0-9.]/g, "");
                  const parts = value.split(".");
                  if (parts.length > 2) {
                    value = parts[0] + "." + parts[1];
                  }
                  if (parts[1]?.length > 2) {
                    parts[1] = parts[1].slice(0, 2);
                    value = parts[0] + "." + parts[1];
                  }
                  e.currentTarget.value = value;
                }}
                className="input rounded-[7px] w-full mt-[6px] px-[6px] py-[4px]"
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
                type="text"
                inputMode="decimal"
                pattern="^\d+(\.\d{0,2})?$"
                {...register("width", {
                  required: "Width is required",
                  validate: (value) =>
                    /^\d+(\.\d{1,2})?$/.test(String(value)) ||
                    "Max 2 decimal places",
                  setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
                })}
                onInput={(e) => {
                  let value = e.currentTarget.value;
                  value = value.replace(/[^0-9.]/g, "");
                  const parts = value.split(".");
                  if (parts.length > 2) {
                    value = parts[0] + "." + parts[1];
                  }
                  if (parts[1]?.length > 2) {
                    parts[1] = parts[1].slice(0, 2);
                    value = parts[0] + "." + parts[1];
                  }
                  e.currentTarget.value = value;
                }}
                className="input rounded-[7px] w-full mt-[6px] px-[6px] py-[4px]"
                style={{
                  border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
                }}
              />
              <p className="text-red-500 text-sm mt-[10px]">
                {errors.width?.message}
              </p>
            </div>
          </div>

          <div className="flex flex-row">
            {!newProduct && (
              <div className="mr-[25px] pointer-events-none">
                <label className="block font-[400]">Date Entered</label>
                <div
                  className="rounded-[8px] mt-[6px] w-fit"
                  style={{
                    border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
                  }}
                >
                  <DatePicker
                    selected={dateEntered}
                    onChange={(date: Date | null) =>
                      setValue("date_entered", date ?? undefined, {
                        shouldDirty: true,
                      })
                    }
                    className="input w-[100%] h-[100%] px-[8px] py-[7px] opacity-[0.5]"
                    placeholderText="Select Date"
                  />
                </div>
              </div>
            )}

            <div className="">
              <label className="block font-[400]">Date Sold</label>
              <div className="flex flex-row gap-[10px] mt-[6px]">
                <div
                  className="rounded-[8px] w-fit"
                  style={{
                    border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
                  }}
                >
                  <DatePicker
                    selected={dateSold}
                    onChange={(date: Date | null) =>
                      setValue("date_sold", date ?? undefined, {
                        shouldDirty: true,
                      })
                    }
                    className="input w-[100%] h-[100%] px-[8px] py-[7px]"
                    placeholderText="Select Date"
                  />
                </div>

                {dateSold && (
                  <div
                    onClick={() =>
                      setValue("date_sold", undefined, { shouldDirty: true })
                    }
                    style={{
                      backgroundColor: appTheme[currentUser.theme].background_3,
                    }}
                    className="flex items-center justify-center w-[34.5px] h-[34px] pb-[0.5px] pr-[0.5px] rounded-[6px] cursor-pointer dim hover:brightness-75"
                  >
                    <IoClose
                      color={appTheme[currentUser.theme].background_1}
                      size={29}
                    />
                  </div>
                )}
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
            {isDirty && (
              <button
                type="submit"
                className="cursor-pointer dim hover:brightness-75 mt-[20px] w-[200px] h-[40px] rounded-[8px] text-white font-semibold"
                style={{
                  backgroundColor: appTheme[currentUser.theme].app_color_1,
                }}
              >
                <div className="flex items-center justify-center">Submit</div>
              </button>
            )}

            <div
              onClick={() => {
                handleBackButton();
                // resetForm();
                reset();
              }}
              className="cursor-pointer dim hover:brightness-75 mt-[20px] w-[200px] h-[40px] rounded-[8px] text-white font-semibold flex items-center justify-center"
              style={{
                backgroundColor: currentUser.theme === "dark" ? "#999" : "#bbb",
              }}
            >
              Cancel
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export type { ProductFormData };
export default ProductPage;
