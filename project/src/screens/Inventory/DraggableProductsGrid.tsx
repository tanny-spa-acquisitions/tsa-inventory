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
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "@/contexts/authContext";
import { Product, useContextQueries } from "@/contexts/queryContext";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToFirstScrollableAncestor,
} from "@dnd-kit/modifiers";
import { useAppContext } from "@/contexts/appContext";
import InventoryRow from "./InventoryRow";
import { makeRequest } from "@/util/axios";
import { toast } from "react-toastify";
import CustomInventoryFrame from "@/components/CustomInventoryFrame/CustomInventoryFrame";
import { appTheme } from "@/util/appTheme";
import { IoCloseOutline } from "react-icons/io5";

function SortableItem({
  id,
  setImageView,
  product,
  index,
  sheet,
}: {
  id: string;
  setImageView: React.Dispatch<React.SetStateAction<string>>;
  product: Product;
  index: number;
  sheet: boolean;
}) {
  const { currentUser } = useContext(AuthContext);
  const { editMode } = useAppContext();

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

  if (!currentUser) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative w-full h-full"
    >
      {editMode && (
        <div
          {...listeners}
          className="absolute inset-0 z-[999] w-[100%] h-[100%] cursor-grab"
        />
      )}
      {sheet ? (
        <InventoryRow index={index} product={product} />
      ) : (
        <div key={product.serial_number} className="relative">
          <CustomInventoryFrame item={product} index={index} />
        </div>
      )}
    </div>
  );
}

const DraggableProductsGrid = ({
  data,
  sheet,
}: {
  data: Product[];
  sheet: boolean;
}) => {
  const { currentUser } = useContext(AuthContext);
  const sensors = useSensors(useSensor(PointerSensor));
  const [imageView, setImageView] = useState<string>("");
  const { localData, setLocalData, localDataRef, productsData } =
    useContextQueries();
  const { filteredProducts, saveProducts } = useAppContext();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localData.findIndex(
      (item) => item.serial_number === active.id
    );
    const newIndex = localData.findIndex(
      (item) => item.serial_number === over.id
    );

    const reordered = arrayMove(localData, oldIndex, newIndex).map(
      (product, i) => ({
        ...product,
        ordinal: i,
      })
    );

    const sorted = reordered.sort(
      (a: Product, b: Product) => (a.ordinal ?? 0) - (b.ordinal ?? 0)
    );

    setLocalData(sorted);
    localDataRef.current = sorted;
    await saveProducts();
  };

  if (!currentUser) return null;

  if (!sheet) {
    // Display only products (no DnD)
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToFirstScrollableAncestor]}
      >
        <SortableContext
          items={localDataRef.current.map((p) => p.serial_number)}
          strategy={rectSortingStrategy}
        >
          <div className=" flex-col max-h-full pb-[46px] mb-[46px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px] md:gap-[30px]">
            {filteredProducts(localDataRef.current).map((product, index) => (
              <SortableItem
                key={product.serial_number}
                id={product.serial_number}
                setImageView={setImageView}
                product={product}
                index={index}
                sheet={sheet}
              />
            ))}
          </div>
          <div className="h-[61px] w-[100%]" />
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToFirstScrollableAncestor]}
    >
      <SortableContext
        items={localData.map((p) => p.serial_number)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col max-h-full pb-[46px] mb-[46px]">
          {filteredProducts(localDataRef.current).map((product, index) => (
            <SortableItem
              key={product.serial_number}
              id={product.serial_number}
              setImageView={setImageView}
              product={product}
              index={index}
              sheet={sheet}
            />
          ))}
        </div>
        <div className="h-[61px] w-[100%]" />
      </SortableContext>
    </DndContext>
  );
};

export default DraggableProductsGrid;
