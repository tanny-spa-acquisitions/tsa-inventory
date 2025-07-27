"use client";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/authContext";
import React from "react";
import { useAppContext } from "@/contexts/appContext";
import { appTheme } from "@/util/appTheme";
import { useModal1Store } from "@/store/useModalStore";
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
import { ProductFormData } from "@/util/schemas/productSchema";
import { useProductForm } from "@/hooks/useProductForm";
import ProductInputField from "../Forms/ProductInputField";
import { toast } from "react-toastify";

const ProductPage = ({
  newProduct,
  serialNumber,
}: {
  newProduct: boolean;
  serialNumber?: string;
}) => {
  const { currentUser } = useContext(AuthContext);
  const { setUploadPopup, setAddProductPage } = useAppContext();
  const { updateProducts, productsData } = useContextQueries();
  const modal1 = useModal1Store((state: any) => state.modal1);
  const setModal1 = useModal1Store((state: any) => state.setModal1);
  const router = useRouter();

  const form = useProductForm();
  const dateSold = form.watch("date_sold");
  const dateEntered = form.watch("date_entered");
  const images = form.watch("images");
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
      form.reset(formDefaults);
    }
  }, [newProduct, serialNumber, productsData, form.reset]);

  const resetForm = async () => {
    await setModal1({
      ...modal1,
      open: false,
    });
    form.reset();
  };

  const onSubmit = async (data: ProductFormData) => {
    if (
      newProduct &&
      productsData.filter((item) => item.serial_number === data.serial_number)
        .length > 0
    ) {
      toast.error("Serial # is already used on another product");
      return;
    }
    const normalizedData: Product = {
      ...data,
      note: data.note ?? "",
      images: Array.isArray(data.images) ? data.images : [],
    };
    await updateProducts([normalizedData]);
    resetForm();
    handleBackButton();
  };

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

  if (!currentUser) return null;

  return (
    <div>
      <UploadModal setValue={form.setValue} getValues={form.getValues} />
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
          setValue={form.setValue}
          getValues={form.getValues}
        />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="gap-[10px] mt-[10px]"
        >
          <ProductInputField
            label="Name"
            name="name"
            register={form.register}
            error={form.formState.errors.name?.message}
            disabled={false}
            className="w-[100%] mb-[10px]"
            inputType={"input"}
          />

          <ProductInputField
            label="Description"
            name="description"
            register={form.register}
            error={form.formState.errors.description?.message}
            disabled={false}
            className="w-[100%] mb-[10px]"
            inputType={"textarea"}
            rows={3}
          />

          <div className="grid grid-cols-2 gap-[10px] gap-x-[5vw]">
            <ProductInputField
              label="Serial Number"
              name="serial_number"
              register={form.register}
              error={form.formState.errors.serial_number?.message}
              disabled={!newProduct}
              className="col-span-2 sm:col-span-1"
              inputType={"input"}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "");
              }}
            />

            <ProductInputField
              label="Price ($)"
              name="price"
              inputMode="decimal"
              pattern="^\d+(\.\d{0,2})?$"
              inputType={"input"}
              onInput={(e) => {
                let value = e.currentTarget.value;
                value = value.replace(/[^0-9.]/g, "");
                const parts = value.split(".");
                if (parts.length > 2) value = parts[0] + "." + parts[1];
                if (parts[1]?.length > 2) {
                  parts[1] = parts[1].slice(0, 2);
                  value = parts[0] + "." + parts[1];
                }
                e.currentTarget.value = value;
              }}
              register={form.register}
              registerOptions={{
                required: "Price is required",
                validate: (value) =>
                  /^\d+(\.\d{1,2})?$/.test(String(value)) ||
                  "Max 2 decimal places",
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              }}
              error={form.formState.errors.price?.message}
              className="col-span-2 sm:col-span-1"
            />

            <ProductInputField
              label="Make"
              name="make"
              register={form.register}
              error={form.formState.errors.make?.message}
              className="col-span-2 sm:col-span-1"
              inputType={"input"}
            />

            <ProductInputField
              label="Model"
              name="model"
              register={form.register}
              error={form.formState.errors.model?.message}
              className="col-span-2 sm:col-span-1"
              inputType={"input"}
            />

            <ProductInputField
              label="Repair Status"
              name="repair_status"
              register={form.register}
              className="col-span-2 sm:col-span-1"
              inputType={"dropdown"}
              options={["In Progress", "Complete"]}
            />

            <ProductInputField
              label="Sale Status"
              name="sale_status"
              register={form.register}
              className="col-span-2 sm:col-span-1"
              inputType={"dropdown"}
              options={[
                "Not Yet Posted",
                "Awaiting Sale",
                "Sold Awaiting Delivery",
                "Delivered",
              ]}
            />

            <ProductInputField
              label="Length (in)"
              name="length"
              inputMode="decimal"
              pattern="^\d+(\.\d{0,2})?$"
              inputType={"input"}
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
              register={form.register}
              registerOptions={{
                required: "Length is required",
                validate: (value) =>
                  /^\d+(\.\d{1,2})?$/.test(String(value)) ||
                  "Max 2 decimal places",
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              }}
              error={form.formState.errors.length?.message}
              className="col-span-2 sm:col-span-1"
            />

            <ProductInputField
              label="Width (in)"
              name="width"
              inputMode="decimal"
              pattern="^\d+(\.\d{0,2})?$"
              inputType={"input"}
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
              register={form.register}
              registerOptions={{
                required: "Width is required",
                validate: (value) =>
                  /^\d+(\.\d{1,2})?$/.test(String(value)) ||
                  "Max 2 decimal places",
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              }}
              error={form.formState.errors.width?.message}
              className="col-span-2 sm:col-span-1"
            />
          </div>

          <div className="flex flex-row">
            {!newProduct && (
              <div className="mr-[25px] pointer-events-none">
                <ProductInputField
                  label="Date Entered"
                  name="date_entered"
                  register={form.register}
                  className="mt-[12px] opacity-[0.5]"
                  inputType={"date"}
                  selected={dateEntered}
                  disabled={true}
                  onChange={(date: Date | null) =>
                    form.setValue("date_entered", date ?? undefined, {
                      shouldDirty: true,
                    })
                  }
                />
              </div>
            )}

            <ProductInputField
              label="Date Sold"
              name="date_sold"
              register={form.register}
              className="mt-[12px]"
              inputType={"date"}
              selected={dateSold}
              disabled={false}
              onChange={(date: Date | null) =>
                form.setValue("date_sold", date ?? undefined, {
                  shouldDirty: true,
                })
              }
              onCancel={() => {
                form.setValue("date_sold", undefined, {
                  shouldDirty: true,
                });
              }}
            />
          </div>

          <ProductInputField
            label="Note"
            name="note"
            register={form.register}
            error={form.formState.errors.note?.message}
            disabled={false}
            className="w-[100%] mt-[10px] mb-[10px]"
            inputType={"textarea"}
            rows={2}
          />

          <div className="flex flex-row gap-[16px]">
            {form.formState.isDirty && (
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
                form.reset();
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
