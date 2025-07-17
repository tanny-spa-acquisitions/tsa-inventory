"use client";
import React, { createContext, useContext, useMemo } from "react";
import {
  useQuery,
  useMutation,
  QueryObserverResult,
  useQueryClient,
} from "@tanstack/react-query";
import { makeRequest } from "@/util/axios";
import { AuthContext } from "./authContext";

export type Product = {
  serial_number: string;
  name: string;
  description: string;
  make: string;
  model: string;
  price: number;
  date_sold: Date;
  repair_status: "In Progress" | "Complete";
  sale_status:
    | "Not Yet Posted"
    | "Awaiting Sale"
    | "Sold Awaiting Delivery"
    | "Delivered";
  length: number;
  width: number;
  note: string;
  images: string[];
};

export type QueryContextType = {
  productsData: Product[];
  isLoadingProductsData: boolean;
  refetchProductsData: () => Promise<QueryObserverResult<Product[], Error>>;
  updateProduct: (newProduct: Product) => void;
  deleteProduct: (serial_number: string) => void;
};

const QueryContext = createContext<QueryContextType | undefined>(undefined);

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { currentUser } = useContext(AuthContext);
  const isLoggedIn = useMemo(
    () => !!currentUser?.user_id,
    [currentUser?.user_id]
  );

  const {
    data: productsData,
    isLoading: isLoadingProductsData,
    refetch: refetchProductsData,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await makeRequest.get("/api/products/get", {});
      console.log(res.data.products);
      return res.data.products || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: true,
    enabled: isLoggedIn,
  });

  const updateProductsMutation = useMutation({
    mutationFn: async (product: Product) => {
      await makeRequest.post("/api/products/update", {
        product,
      });
    },
    onMutate: async (updatedProduct: Product) => {
      const queryKey = ["products"];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<any[]>(queryKey);
      if (!previousData) return { previousData, queryKey };
      const newData = previousData.map((product) =>
        product.serial_number === updatedProduct.serial_number
          ? updatedProduct
          : product
      );
      queryClient.setQueryData(queryKey, newData);
      return { previousData, queryKey };
    },
    onError: (_err, _newData, context) => {
      if (context?.queryKey && context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    onSettled: (_data, _err, _variables, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (serial_number: string) => {
      await makeRequest.delete("/api/products/delete", {
        data: { serial_number },
      });
    },
    onMutate: async (serial_number: string) => {
      const queryKey = ["products"];
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<any[]>(queryKey);
      if (!previousData) return { previousData, queryKey };

      const newData = previousData.filter(
        (product) => product.serial_number !== serial_number
      );

      queryClient.setQueryData(queryKey, newData);
      return { previousData, queryKey };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });

  const updateProduct = async (product: Product) => {
    await updateProductsMutation.mutateAsync(product);
  };

  const deleteProduct = async (serial_number: string) => {
    await deleteProductMutation.mutateAsync(serial_number);
  };

  return (
    <QueryContext.Provider
      value={{
        productsData: productsData ?? [],
        isLoadingProductsData,
        refetchProductsData,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
};

export const useContextQueries = () => {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("useQueries must be used within a QueryProvider");
  }
  return context;
};
