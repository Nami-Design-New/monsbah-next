"use client";

import { createContext, useContext, useState } from "react";

const CategoryTabContext = createContext({
  activeTab: "main",
  setActiveTab: () => {},
});

export function CategoryTabProvider({ children }) {
  const [activeTab, setActiveTab] = useState("main");

  return (
    <CategoryTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </CategoryTabContext.Provider>
  );
}

export function useCategoryTab() {
  return useContext(CategoryTabContext);
}
