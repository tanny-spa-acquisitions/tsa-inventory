"use client";
import { IoCloseOutline } from "react-icons/io5";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { appTheme } from "@/util/appTheme";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "@/contexts/authContext";
import { UseFormSetValue, UseFormGetValues } from "react-hook-form";
import { ProductFormData } from "./ProductPage";

function SortableImage({
  id,
  url,
  setImageView,
  images,
  setValue,
}: {
  id: string;
  url: string;
  setImageView: React.Dispatch<React.SetStateAction<string>>;
  images: string[];
  setValue: UseFormSetValue<ProductFormData>;
}) {
  const { currentUser } = useContext(AuthContext);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    zIndex: isDragging ? 999 : 1,
    position: "relative",
  };

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const wiggleThreshold = 5;

  const handleMouseDown = (e: React.MouseEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".ignore-click")) return;

    if (!startPos.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < wiggleThreshold) {
      setImageView(url);
    }
    startPos.current = null;
  };

  const handleDeleteImage = (url: string) => {
    const updated = images.filter((link) => link !== url);
    setValue("images", updated, { shouldDirty: true });
  };

  if (!currentUser) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative w-full aspect-square"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className=" cursor-pointer hover:brightness-75 dim w-[100%] h-[100%] inset-0">
        <div {...listeners} className="absolute inset-0 z-10 cursor-grab" />
        <Image
          src={url}
          alt="image"
          width={200}
          height={200}
          className="object-cover w-full h-full rounded-[10px]"
        />
        <div
          style={{
            border: `1px solid ${appTheme[currentUser.theme].text_4}`,
            backgroundColor: appTheme[currentUser.theme].background_1,
          }}
          className="ignore-click w-[20px] h-[20px] flex items-center justify-center dim hover:brightness-75 cursor-pointer rounded-[10px] absolute top-[-8px] right-[-9px] z-20"
          onClick={() => {
            handleDeleteImage(url);
          }}
        >
          <IoCloseOutline color={appTheme[currentUser.theme].text_2} />
        </div>
      </div>
    </div>
  );
}

export default function DraggableImageGrid({
  images,
  setValue,
  getValues,
}: {
  images: string[];
  setValue: UseFormSetValue<ProductFormData>;
  getValues: UseFormGetValues<ProductFormData>;
}) {
  const { currentUser } = useContext(AuthContext);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );
  const [imageView, setImageView] = useState<string>("");

  const items = images.map((url, index) => ({
    id: `${url}-${index}`,
    url,
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(images, oldIndex, newIndex);
    setValue("images", reordered, { shouldDirty: true });
  };

  if (!currentUser) return null;

  return (
    <>
      {imageView !== "" && (
        <div
          className="fixed z-[990] top-0 left-0 w-[100vw] display-height flex items-center justify-center"
          style={{
            backgroundColor: appTheme[currentUser.theme].background_1,
          }}
          onClick={() => setImageView("")}
        >
          <img
            src={imageView}
            className="object-cover max-w-[100%] max-h-[100%]"
          />
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-[10px] p-1 sm:p-2 md:p-4 touch-none">
              {items.map((item) => (
                <SortableImage
                  key={item.id}
                  id={item.id}
                  url={item.url}
                  setImageView={setImageView}
                  images={images}
                  setValue={setValue}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>
    </>
  );
}
