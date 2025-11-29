"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "react-bootstrap";
import { useLocale } from "next-intl";
import Image from "next/image";

const COUNTRY_SELECTED_KEY = "countrySelected";
const SESSION_SKIP_KEY = "countryModalSkipSession";
const REMEMBER_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export default function CountrySelectorModal() {
  const locale = useLocale();
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const countries = [
    { 
      code: "sa", 
      name: "السعودية", 
      nameEn: "Saudi Arabia", 
      image: "/countries/saudia-1.webp" 
    },
    { 
      code: "kw", 
      name: "الكويت", 
      nameEn: "Kuwait", 
      image: "/countries/kewit.webp" 
    },
    { 
      code: "ae", 
      name: "الإمارات", 
      nameEn: "UAE", 
      image: "/countries/uae-1.webp" 
    },
    { 
      code: "qa", 
      name: "قطر", 
      nameEn: "Qatar", 
      image: "/countries/qatar-1.webp" 
    },
    { 
      code: "bh", 
      name: "البحرين", 
      nameEn: "Bahrain", 
      image: "/countries/behrin.webp" 
    },
    { 
      code: "om", 
      name: "عمان", 
      nameEn: "Oman", 
      image: "/countries/oman.webp" 
    },
  ];

  const rememberSelectionForWeek = useCallback((countryCode) => {
    const expiresAt = Date.now() + REMEMBER_DURATION_MS;
    const payload = {
      value: true,
      expiresAt,
      countryCode,
    };
    localStorage.setItem(COUNTRY_SELECTED_KEY, JSON.stringify(payload));
  }, []);

  useEffect(() => {
    const storedSelection = localStorage.getItem(COUNTRY_SELECTED_KEY);
    const isRedirecting = sessionStorage.getItem("isRedirecting");
    const skippedThisSession = sessionStorage.getItem(SESSION_SKIP_KEY);

    let hasValidRemember = false;

    if (storedSelection) {
      try {
        const parsedSelection = JSON.parse(storedSelection);
        const expiresAt = parsedSelection?.expiresAt;

        if (expiresAt && expiresAt > Date.now()) {
          hasValidRemember = true;
        } else if (parsedSelection === true) {
          rememberSelectionForWeek();
          hasValidRemember = true;
        } else {
          localStorage.removeItem(COUNTRY_SELECTED_KEY);
        }
      } catch {
        localStorage.removeItem(COUNTRY_SELECTED_KEY);
      }
    }
    
    if (isRedirecting) {
      sessionStorage.removeItem("isRedirecting");
      return;
    }

    if (!hasValidRemember && !skippedThisSession) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setShow(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [rememberSelectionForWeek]);

  const handleCountrySelect = (countryCode) => {
    const lang = locale.split("-")[1] || "ar";
    const newLocale = `${countryCode}-${lang}`;
    
    // Set loading state and selected country
    setIsLoading(true);
    setSelectedCountry(countryCode);
    
    // Save the country selection for 1 week
    rememberSelectionForWeek(countryCode);
    // Set redirecting flag to prevent modal from showing during redirect
    sessionStorage.setItem("isRedirecting", "true");
    
    // Get the current URL and construct the new URL with the selected country
    const currentUrl = window.location.href;
    const urlObj = new URL(currentUrl);
    const newPath = `/${newLocale}`;
    
    // Use replace to navigate (prevents back button issues)
    window.location.replace(`${urlObj.origin}${newPath}`);
  };

  const handleRememberForWeek = () => {
    rememberSelectionForWeek();
    setShow(false);
  };

  const handleSkip = () => {
    sessionStorage.setItem(SESSION_SKIP_KEY, "true");
    setShow(false);
  };

  const isArabic = locale.includes("ar");

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="country-loading-overlay">
          <div className="loading-content">
            <div className="loader">
              <span></span>
            </div>
            <p className="loading-text">
              {isArabic ? "جاري التحميل..." : "Loading..."}
            </p>
            {selectedCountry && (
              <p className="selected-country-text">
                {isArabic 
                  ? `التوجه إلى ${countries.find(c => c.code === selectedCountry)?.name}`
                  : `Redirecting to ${countries.find(c => c.code === selectedCountry)?.nameEn}`
                }
              </p>
            )}
          </div>
        </div>
      )}
      
      <Modal 
        show={show} 
        onHide={() => {}} 
        centered 
        size="lg"
        backdrop="static"
        keyboard={false}
        className="country-selector-modal"
        aria-labelledby="country-selector-title"
        aria-describedby="country-selector-description"
      >
      <Modal.Header className="border-0 pb-2">
        <Modal.Title className="w-100 text-center">
          <h2 id="country-selector-title" className="fw-bold mb-2" style={{ fontSize: '26px', color: '#0d0d0d' }}>
            {isArabic ? "اختر دولتك" : "Select Your Country"}
          </h2>
          <p id="country-selector-description" className="text-muted mb-0" style={{ fontSize: '16px', fontWeight: 'normal' }}>
            {isArabic ? "لعرض الإعلانات المتاحة في منطقتك" : "To view available ads in your region"}
          </p>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3 pb-4">
        <div className="countries-grid">
          {countries.map((country) => (
            <button
              key={country.code}
              className="country-card"
              onClick={() => handleCountrySelect(country.code)}
            >
              <div className="country-image-wrapper">
                <Image
                  src={country.image}
                  alt={isArabic ? country.name : country.nameEn}
                  width={90}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: '8px', width: '100%' }}
                />
              </div>
              <h3 className="mb-0 mt-2">{isArabic ? country.name : country.nameEn}</h3>
            </button>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <div className="w-100 text-center mt-2">
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <button
              className="btn remember-btn px-4 py-2"
              onClick={handleRememberForWeek}
            >
              {isArabic ? "تذكرني لأسبوع" : "Remember for 1 week"}
            </button>
            <button 
              className="btn btn-outline-secondary px-4 py-2" 
              onClick={handleSkip}
            >
              {isArabic ? "تخطي لهذه الجلسة" : "Skip this session"}
            </button>
          </div>
          <p className="text-muted mt-3 mb-0" style={{ fontSize: '13px' }}>
            {isArabic 
              ? "سنعيد إظهار الاختيار بعد أسبوع أو عند بدء جلسة جديدة في حال التخطي."
              : "We'll ask again after a week when remembered, or next session if you skip."}
          </p>
        </div>
      </Modal.Footer>
    </Modal>
    </>
  );
}
