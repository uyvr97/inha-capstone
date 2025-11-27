import { memo } from "react";
import { ImageWithFallback } from "./ui/ImageWithFallback";
import type { MenuItemType } from "../types";

interface MenuItemProps {
  item: MenuItemType;
  onAdd: (item: MenuItemType) => void;
}

function MenuItem({ item, onAdd }: MenuItemProps) {
  return (
    <button
      onClick={() => onAdd(item)}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-150 overflow-hidden flex flex-col"
    >
      <div className="aspect-square overflow-hidden bg-slate-100">
        <picture className="block w-full h-full">
          {item.imagejpg && (
            <source
              srcSet={`${item.imagejpg} 1x`}
              type="image/jpg"
              sizes="(max-width: 720px) 25vw, 180px"
            />
          )}
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-opacity duration-200"
            sizes="(max-width: 720px) 25vw, 180px"
          />
        </picture>
      </div>

      <div className="p-2 flex-1 flex flex-col justify-between">
        <h3 className="text-base font-semibold text-slate-800 mb-1 leading-tight">
          {item.name}
        </h3>
        <p className="text-base font-bold text-blue-600">
          {item.price.toLocaleString()}원
        </p>
      </div>
    </button>
  );
}

export default memo(MenuItem);
