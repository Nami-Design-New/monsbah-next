"use client";

import { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import useGetCountries from "@/hooks/queries/settings/useGetCountries";

export default function PhoneInput({
  label,
  selectedCountry,
  setSelectedCountry,
  error,
  onCountryChange,
  ...props
}) {
  const dropdownRef = useRef(null);
  const [showDropDownMenu, setShowDropDownMenu] = useState(false);

  const { data: countries } = useGetCountries();

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    onCountryChange?.(country);
    setShowDropDownMenu(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropDownMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="w-100 ">
      <div className="phone_field">
        <div className="input-field">
          {label && <label htmlFor={props?.id}>{label}</label>}
          <Form.Control className="form-control" {...props} />
        </div>

        <div className="dropdown">
          <button
            aria-label="Country code"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowDropDownMenu(!showDropDownMenu);
            }}
          >
            {selectedCountry && (
              <>
                <span>+{selectedCountry.country_code}</span>
                <img
                  src={selectedCountry?.image}
                  alt={selectedCountry.name}
                  loading="lazy"
                />
              </>
            )}
          </button>

          <div
            ref={dropdownRef}
            className={`countriesMenu ${showDropDownMenu ? "active" : ""}`}
          >
            {countries?.map((country) => {
              return (
                <div
                  key={country.id}
                  className="country"
                  onClick={() => handleSelectCountry(country)}
                >
                  <div className="text">
                    <img
                      src={country?.image}
                      alt={country.name}
                      loading="lazy"
                    />
                    <h6>{country.name}</h6>
                  </div>
                  <p>+{country.country_code}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {error && (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      )}
    </div>
  );
}
