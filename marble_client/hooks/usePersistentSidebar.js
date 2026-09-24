import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Same behavior as HRM: persists sidebar open/closed in localStorage under `sidebar-open`.
 * @param {(isOpen: boolean) => void} [addHamclass] Optional sync callback (e.g. layout state); called once on hydrate with stored value.
 */
export default function usePersistentSidebar(addHamclass) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const hasToggledRef = useRef(false);

  useEffect(() => {
    const storedState = localStorage.getItem("sidebar-open");
    const parsed = storedState === "true";
    setIsOpen(parsed);
    addHamclass?.(parsed);
  }, []);

  useEffect(() => {
    if (hasToggledRef.current) {
      localStorage.setItem("sidebar-open", isOpen.toString());
      setShouldAnimate(true);
    }
  }, [isOpen]);

  const setSidebarOpen = useCallback((nextOpen) => {
    hasToggledRef.current = true;
    setIsOpen(nextOpen);
  }, []);

  const toggleSidebar = useCallback(() => {
    hasToggledRef.current = true;
    setIsOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);

  return {
    isOpen,
    toggleSidebar,
    closeSidebar,
    shouldAnimate,
  };
}
