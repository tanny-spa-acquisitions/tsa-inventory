"use client";
import React, { createContext, ReactNode, useContext, useMemo } from "react";
import {
  useQuery,
  useMutation,
  QueryClient,
  QueryObserverResult,
  useQueryClient,
} from "@tanstack/react-query";
import { makeRequest } from "@/util/axios";
import { AuthContext } from "./authContext";
import { showToast } from "@/components/CustomToast";

export type VideoCollection = {
  collection_id: string;
  collection_name: string;
};

export type QueryContextType = {};

const QueryContext = createContext<QueryContextType | undefined>(undefined);

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <QueryContext.Provider value={{}}>{children}</QueryContext.Provider>;
};

export const useContextQueries = () => {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("useQueries must be used within a QueryProvider");
  }
  return context;
};
