"use client";
import { Product, useContextQueries } from "@/contexts/queryContext";
import { useProductForm } from "@/hooks/useProductForm";
import { appTheme } from "@/util/appTheme";
import ProductInputCell from "@/components/Forms/ProductInputCell";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/authContext";
import { ProductFormData } from "@/util/schemas/productSchema";
import { InventoryDataItem } from "./InventoryGrid";
import Link from "next/link";
import Image from "next/image";
import app_details from "@/util/appDetails.json";
import { UseFormReturn } from "react-hook-form";
import { FaPlus } from "react-icons/fa6";

type InventoryRowFormProps = {
  product: Product;
  inventoryDataLayout: InventoryDataItem[];
  registerFormRef: (
    serial: string,
    form: UseFormReturn<ProductFormData>
  ) => void;
};

const InventoryRowForm = ({
  product,
  inventoryDataLayout,
  registerFormRef,
}: InventoryRowFormProps) => {
  const { currentUser } = useContext(AuthContext);
  const { productsData } = useContextQueries();
  const form = useProductForm();

  useEffect(() => {
    if (product.serial_number) {
      registerFormRef(product.serial_number, form);
    }
  }, [product.serial_number, form]);

  let newProduct = false;

  const dateSold = form.watch("date_sold");
  const dateEntered = form.watch("date_entered");

  useEffect(() => {
    if (!newProduct && product.serial_number) {
      const formDefaults: Partial<ProductFormData> = {
        ...product,
        date_sold: product.date_sold ? new Date(product.date_sold) : undefined,
        date_entered: product.date_entered
          ? new Date(product.date_entered)
          : undefined,
        price: product.price ? Number(product.price) : 0,
        length: product.length ? Number(product.length) : 0,
        width: product.width ? Number(product.width) : 0,
      };
      form.reset(formDefaults);
    }
  }, [newProduct, product.serial_number, form.reset]);

  if (!currentUser) return null;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="select-none w-full flex flex-row h-[60px] items-center"
    >
      <div
        style={{
          borderRight: `0.5px solid ${
            appTheme[currentUser.theme].background_3
          }`,
        }}
        className={`pl-[10.5px] h-[100%] flex items-center ${inventoryDataLayout[0].className}`}
      >
        <Link
          href={
            productsData?.some((p) => p.serial_number === product.serial_number)
              ? `/products/${product.serial_number}`
              : "/"
          }
          className="dim hover:brightness-75"
        >
          <div className="relative w-[42px] h-[42px]">
            {product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt="product image 2"
                fill
                sizes="42px"
                className="object-cover rounded-[5px]"
              />
            ) : (
              <div
                style={{
                  backgroundColor: appTheme[currentUser.theme].background_1_2,
                }}
                className="w-[100%] h-[100%] rounded-[5px] flex items-center justify-center pb-[2px] pr-[2px]"
              >
                <FaPlus color={appTheme[currentUser.theme].text_1} size={20} />
              </div>
            )}
          </div>
        </Link>
      </div>

      <ProductInputCell
        name="serial_number"
        register={form.register}
        error={form.formState.errors.serial_number?.message}
        disabled={!newProduct}
        inputType={"input"}
        className={`h-[100%] ${inventoryDataLayout[1].className}`}
        onInput={(e) => {
          const value = (e.currentTarget.value = e.currentTarget.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, ""));
          form.setValue("serial_number", value, { shouldDirty: true });
        }}
      />

      <ProductInputCell
        name="name"
        register={form.register}
        error={form.formState.errors.name?.message}
        inputType="input"
        onInput={(e) => {
          form.setValue("name", e.currentTarget.value, { shouldDirty: true });
        }}
        className={`h-[100%] ${inventoryDataLayout[2].className}`}
      />

      <ProductInputCell
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
          form.setValue("price", parseFloat(value), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
        register={form.register}
        registerOptions={{
          required: "Price is required",
          validate: (value) =>
            /^\d+(\.\d{1,2})?$/.test(String(value)) || "Max 2 decimal places",
          setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
        }}
        error={form.formState.errors.price?.message}
        className={`h-[100%] ${inventoryDataLayout[3].className}`}
      />

      <ProductInputCell
        name="make"
        register={form.register}
        error={form.formState.errors.make?.message}
        className={`h-[100%] ${inventoryDataLayout[4].className}`}
        inputType={"input"}
        onInput={(e) => {
          form.setValue("make", e.currentTarget.value, { shouldDirty: true });
        }}
      />

      <ProductInputCell
        name="model"
        register={form.register}
        error={form.formState.errors.model?.message}
        className={`h-[100%] ${inventoryDataLayout[5].className}`}
        inputType={"input"}
        onInput={(e) => {
          form.setValue("model", e.currentTarget.value, { shouldDirty: true });
        }}
      />

      <ProductInputCell
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
          form.setValue("length", parseFloat(value), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
        register={form.register}
        registerOptions={{
          required: "Length is required",
          validate: (value) =>
            /^\d+(\.\d{1,2})?$/.test(String(value)) || "Max 2 decimal places",
          setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
        }}
        error={form.formState.errors.length?.message}
        className={`h-[100%] ${inventoryDataLayout[6].className}`}
      />

      <ProductInputCell
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
          form.setValue("width", parseFloat(value), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
        register={form.register}
        registerOptions={{
          required: "Width is required",
          validate: (value) =>
            /^\d+(\.\d{1,2})?$/.test(String(value)) || "Max 2 decimal places",
          setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
        }}
        error={form.formState.errors.width?.message}
        className={`h-[100%] ${inventoryDataLayout[7].className}`}
      />

      <ProductInputCell
        name="repair_status"
        register={form.register}
        className={`h-[100%] ${inventoryDataLayout[8].className}`}
        inputType={"dropdown"}
        options={["In Progress", "Complete"]}
        onInput={(e) => {
          form.setValue(
            "repair_status",
            e.currentTarget.value as "In Progress" | "Complete",
            {
              shouldDirty: true,
            }
          );
        }}
      />

      <ProductInputCell
        name="sale_status"
        register={form.register}
        className={`h-[100%] ${inventoryDataLayout[9].className}`}
        inputType={"dropdown"}
        options={[
          "Not Yet Posted",
          "Awaiting Sale",
          "Sold Awaiting Delivery",
          "Delivered",
        ]}
        onInput={(e) => {
          form.setValue(
            "sale_status",
            e.currentTarget.value as
              | "Not Yet Posted"
              | "Awaiting Sale"
              | "Sold Awaiting Delivery"
              | "Delivered",
            {
              shouldDirty: true,
            }
          );
        }}
      />

      {!newProduct && (
        <ProductInputCell
          name="date_entered"
          register={form.register}
          className={`opacity-[0.5] pointer-events-none h-[100%] ${inventoryDataLayout[10].className}`}
          inputType={"date"}
          selected={dateEntered}
          disabled={true}
          onChange={(date: Date | null) =>
            form.setValue("date_entered", date ?? undefined, {
              shouldDirty: true,
            })
          }
        />
      )}

      <ProductInputCell
        name="date_sold"
        register={form.register}
        className={`h-[100%] ${inventoryDataLayout[11].className}`}
        inputType={"date"}
        selected={dateSold}
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

      <ProductInputCell
        name="description"
        register={form.register}
        error={form.formState.errors.description?.message}
        inputType={"textarea"}
        rows={1}
        className={`h-[100%] ${inventoryDataLayout[12].className}`}
      />

      <ProductInputCell
        name="note"
        register={form.register}
        error={form.formState.errors.note?.message}
        disabled={false}
        className={`h-[100%] ${inventoryDataLayout[13].className}`}
        inputType={"textarea"}
        rows={1}
      />
    </form>
  );
};

export default InventoryRowForm;
