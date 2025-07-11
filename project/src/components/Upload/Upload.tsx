import { AuthContext } from "@/contexts/authContext";
import { appTheme } from "@/util/appTheme";
import React, { useContext, useState } from "react";

interface UploadProps {
  handleFiles: (files: File[]) => void;
}

const Upload: React.FC<UploadProps> = ({ handleFiles }) => {
  const { currentUser } = useContext(AuthContext);
  const [dragging, setDragging] = useState(false);
  const handleDragOver = (e: any) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  if (!currentUser) return;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: appTheme[currentUser.theme].background_stark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.3s",
        border: currentUser.theme === "light" ? dragging ? "3px dashed blue" : "none" : "1px solid #333",
        borderRadius: "25px"
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p
        className="absolute font-[300]"
        style={{ fontSize: "1.2rem", color: currentUser.theme === "light" ? dragging ? "blue" : "black" : "#fff" }}
      >
        Drag and drop images here
      </p>

      <div className="relative w-[100%] h-[100%] flex justify-center">
        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          id="fileInput"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleFiles(files);
          }}
        />
        <label
          className="absolute bottom-[20px]"
          htmlFor="fileInput"
          style={{
            marginTop: "20px",
            cursor: "pointer",
            textDecoration: "underline",
            color: currentUser.theme === "dark" ? "#eee" : "blue",
          }}
        >
          Open Finder
        </label>
      </div>
    </div>
  );
};

export default Upload;
