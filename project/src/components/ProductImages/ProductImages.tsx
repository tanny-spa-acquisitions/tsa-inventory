"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useVideo } from "@/contexts/videoContext";
import { appTheme } from "@/util/appTheme";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "@/contexts/authContext";

function SortableImage({
  id,
  url,
  setImageView,
}: {
  id: string;
  url: string;
  setImageView: React.Dispatch<React.SetStateAction<string>>;
}) {
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
    borderRadius: "10px",
    overflow: "hidden",
    cursor: "grab",
    opacity: isDragging ? 0.5 : 1,
  };

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const wiggleThreshold = 5; 

  const handleMouseDown = (e: React.MouseEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!startPos.current) return;

    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < wiggleThreshold) {
      setImageView(url);
    }

    startPos.current = null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...attributes}
      {...listeners}
      className="w-full aspect-square"
    >
      <Image
        src={url}
        alt="image"
        width={200}
        height={200}
        className="object-cover w-full h-full"
      />
    </div>
  );
}

export default function DraggableImageGrid() {
  const { currentUser } = useContext(AuthContext);
  const { productImages, setProductImages } = useVideo();
  const sensors = useSensors(useSensor(PointerSensor));
  const [imageView, setImageView] = useState<string>("");

  const items = productImages.map((url, index) => ({
    id: url,
    url,
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(productImages, oldIndex, newIndex);
    setProductImages(reordered);
  };

  if (!currentUser) return;

  return (
    <>
      {imageView !== "" && (
        <div
          className="fixed top-0 left-0 w-[100vw] h-[100vh] flex items-center justify-center"
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
          <div className="grid grid-cols-6 gap-[10px] p-4">
            {items.map((item) => (
              <SortableImage
                key={item.id}
                id={item.id}
                url={item.url}
                setImageView={setImageView}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
