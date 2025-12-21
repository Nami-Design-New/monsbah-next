"use client";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import styles from "./NavDropdown.module.css";

const NavDropdown = ({ 
  title, 
  href, 
  isActive, 
  items = [], 
  isLoading = false,
  linkPrefix = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);
  const t = useTranslations("header");

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Calculate dropdown position
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + rect.width / 2 + window.scrollX
      });
    }
    
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Ensure items is always an array
  const itemsArray = Array.isArray(items) ? items : [];
  
  // Debug log
  useEffect(() => {
    if (itemsArray.length > 0) {
      console.log(`${title} dropdown has ${itemsArray.length} items`);
    }
  }, [itemsArray.length, title]);

  return (
    <div 
      className={styles.navDropdownWrapper}
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        ref={triggerRef}
        className={`navLink ${isActive ? "active" : ""} ${styles.navLink}`}
        style={{ cursor: 'pointer' }}
      >
        {title}
        <svg 
          className={`${styles.dropdownArrow} ${isOpen ? styles.open : ""}`}
          width="10" 
          height="6" 
          viewBox="0 0 10 6" 
          fill="none"
        >
          <path 
            d="M1 1L5 5L9 1" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </span>
      
      {(isLoading || itemsArray.length > 0) && (
        <div 
          className={`${styles.navDropdownMenu} ${isOpen ? styles.open : ""}`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <div className={styles.dropdownContent}>
            {isLoading ? (
              <div className={styles.dropdownLoading}>
                <div className={styles.loadingSpinner}></div>
                <span>{t("loading")}</span>
              </div>
            ) : (
              <>
                <div className={styles.dropdownGrid}>
                  {itemsArray.slice(0, 12).map((item) => (
                    <Link
                      key={item.id}
                      href={`${linkPrefix}${item.slug}`}
                      className={styles.dropdownItem}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.image && (
                        <div className={styles.itemIcon}>
                          <Image
                            src={item.image}
                            width={48}
                            height={48}
                            alt={item.name || ""}
                            unoptimized
                          />
                        </div>
                      )}
                      <span className={styles.itemName}>{item.name}</span>
                    </Link>
                  ))}
                </div>
                
                {/* {itemsArray.length > 0 && (
                  <Link href={href} className={styles.viewAllLink} onClick={() => setIsOpen(false)}>
                    {t("viewAll")}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path 
                        d="M6 12L10 8L6 4" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                )} */}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavDropdown;
