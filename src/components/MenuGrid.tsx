import { useMemo, memo } from "react";
import MenuItem from "./MenuItem";
import type { MenuItemType } from "../types";

interface MenuGridProps {
  items: MenuItemType[];
  onAdd: (item: MenuItemType) => void;
}

function MenuGridComponent({ items, onAdd }: MenuGridProps) {
  const renderedItems = useMemo(
    () => items.map((item) => <MenuItem key={item.id} item={item} onAdd={onAdd} />),
    [items, onAdd]
  );

  return <div className="grid grid-cols-4 gap-3 pb-4">{renderedItems}</div>;
}

const areEqual = (prev: MenuGridProps, next: MenuGridProps) => {
  if (prev.items.length !== next.items.length) {
    return false;
  }
  for (let i = 0; i < prev.items.length; i += 1) {
    if (prev.items[i].id !== next.items[i].id) {
      return false;
    }
  }
  return prev.onAdd === next.onAdd;
};

const MenuGrid = memo(MenuGridComponent, areEqual);

export default MenuGrid;

