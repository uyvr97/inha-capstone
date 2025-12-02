import {
  useState,
  useMemo,
  useCallback,
  memo,
  useRef,
  useEffect,
} from "react";
import { ArrowLeft } from "lucide-react";
import MenuGrid from "./MenuGrid";
import Cart from "./Cart";
import type { CartItem, MenuItemType, OrderType } from "../types";
import { MENU_DATA, CATEGORIES } from "../constants/menu";
import { addItemToCart, calculateTotalPrice } from "../utils/cart";
import { markInteractionStart, markInteractionEnd } from "../utils/perf";

interface MenuScreenProps {
  orderType: OrderType;
  onBack: () => void;
  onCheckout: (items: CartItem[], totalPrice: number) => void;
}

function MenuScreen({
  orderType,
  onBack,
  onCheckout,
}: MenuScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const pendingCategoryRef = useRef<string | null>(null);
  const pendingCartRef = useRef<string | null>(null);
  const cartUpdateRaf = useRef<number | null>(null);

  const filteredMenu = useMemo(
    () =>
      selectedCategory === "all"
        ? MENU_DATA
        : MENU_DATA.filter((item) => item.category === selectedCategory),
    [selectedCategory]
  );

  const scheduleCartUpdate = useCallback(
    (updater: (prev: CartItem[]) => CartItem[]) => {
      if (
        typeof window === "undefined" ||
        typeof window.requestAnimationFrame === "undefined"
      ) {
        setCartItems(updater);
        return;
      }
      if (cartUpdateRaf.current) {
        window.cancelAnimationFrame(cartUpdateRaf.current);
      }
      cartUpdateRaf.current = window.requestAnimationFrame(() => {
        setCartItems(updater);
        cartUpdateRaf.current = null;
      });
    },
    []
  );

  const handleAddToCart = useCallback(
    (item: MenuItemType) => {
      const label = `interaction:add-item:${item.id}`;
      pendingCartRef.current = label;
      markInteractionStart(label, { itemId: item.id });
      scheduleCartUpdate((prev) => addItemToCart(prev, item));
    },
    [scheduleCartUpdate]
  );

  const handleSelectCategory = useCallback((categoryId: string) => {
    const label = `interaction:category:${categoryId}`;
    pendingCategoryRef.current = label;
    markInteractionStart(label);
    setSelectedCategory(categoryId);
  }, []);

  const handleUpdateQuantity = useCallback(
    (id: string, quantity: number) => {
      scheduleCartUpdate((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    },
    [scheduleCartUpdate]
  );

  const handleRemoveItem = useCallback(
    (id: string) => {
      scheduleCartUpdate((prev) => prev.filter((item) => item.id !== id));
    },
    [scheduleCartUpdate]
  );

  const cartTotalPrice = useMemo(
    () => calculateTotalPrice(cartItems),
    [cartItems]
  );

  const handleCheckout = useCallback(() => {
    onCheckout(cartItems, cartTotalPrice);
  }, [cartItems, cartTotalPrice, onCheckout]);

  useEffect(() => {
    return () => {
      if (
        cartUpdateRaf.current &&
        typeof window !== "undefined" &&
        typeof window.cancelAnimationFrame !== "undefined"
      ) {
        window.cancelAnimationFrame(cartUpdateRaf.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pendingCategoryRef.current) {
      return;
    }
    markInteractionEnd(pendingCategoryRef.current, {
      selectedCategory,
      itemCount: filteredMenu.length,
    });
    pendingCategoryRef.current = null;
  }, [selectedCategory, filteredMenu.length]);

  useEffect(() => {
    if (!pendingCartRef.current) {
      return;
    }
    markInteractionEnd(pendingCartRef.current, {
      cartSize: cartItems.length,
      totalPrice: cartTotalPrice,
    });
    pendingCartRef.current = null;
  }, [cartItems, cartTotalPrice]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4 kiosk-fade-down">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-lg text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>처음으로</span>
          </button>
        </div>

        {/* 카테고리 */}
        <div className="flex gap-2 mb-4 kiosk-fade-up" style={{ animationDelay: "0.1s" }}>
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSelectCategory(category.id)}
              className={`px-4 py-2 rounded-xl transition-all duration-300 text-sm font-semibold ${
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-xl transition-all duration-300 text-lg font-semibold ${
                selectedCategory === category.id
                  ? "bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* 메뉴판 */}
        <div className="flex-1 overflow-y-auto pr-2">
          <MenuGrid items={filteredMenu} onAdd={handleAddToCart} />
        </div>
      </div>

      {/* 장바구니 */}
      <div className="h-[480px] border-t-2 border-slate-200 kiosk-fade-up" style={{ animationDelay: "0.15s" }}>
        <Cart
          items={cartItems}
          orderType={orderType}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemoveItem}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}

export default memo(MenuScreen);
