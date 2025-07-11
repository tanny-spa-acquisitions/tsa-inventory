"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { makeRequest } from "@/util/axios";
import { useRouter } from "next/navigation";
import { fetchInventory } from "../util/functions/Inventory";

type VideoContextType = {
  inventory: any[];
  setInventory: React.Dispatch<React.SetStateAction<any[]>>;
};

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [inventory, setInventory] = useState<any[]>([]);
  useEffect(() => {
    fetchInventory().then((data) => {
      setInventory(data);
    });
  }, []);

  return (
    <VideoContext.Provider
      value={{
        inventory,
        setInventory,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};
