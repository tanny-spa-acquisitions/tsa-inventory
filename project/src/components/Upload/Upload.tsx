import React, { useState } from "react";

interface UploadProps {
  handleFiles: (files: File[]) => void;
}

const Upload: React.FC<UploadProps> = ({ handleFiles }) => {

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

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: dragging ? "rgba(0, 0, 0, 0.2)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.3s",
        border: dragging ? "3px dashed blue" : "none",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p className="absolute font-[300]" style={{ fontSize: "1.2rem", color: dragging ? "blue" : "black" }}>
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
            color: "blue",
          }}
        >
          Open Finder
        </label>
      </div>
    </div>
  );
};

export default Upload;
