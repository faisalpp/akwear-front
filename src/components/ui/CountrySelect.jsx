import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import countries from "../../constants/countries.json";

// Sort countries alphabetically by common name
const sortedCountries = [...countries].sort((a, b) =>
  a.name.common.localeCompare(b.name.common),
);

const CountrySelect = ({ value, onChange, placeholder = "Land wählen..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredCountries = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    return sortedCountries.filter(
      (c) =>
        c.name.common.toLowerCase().includes(term) ||
        c.name.official.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  const handleSelect = (country) => {
    onChange(country); // We pass the whole country object or just the part needed
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedCountry = sortedCountries.find(
    (c) => c.name.common === value?.label || c.name.common === value, // Handle object or string
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className="w-full p-3 bg-white border border-gray-300 rounded-xl flex items-center justify-between cursor-pointer hover:border-orange-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedCountry ? (
            <>
              <img
                src={selectedCountry.flags.png}
                alt={selectedCountry.name.common}
                className="w-6 h-4 object-cover rounded-sm shadow-sm"
              />
              <span className="font-medium text-gray-900 truncate">
                {selectedCountry.name.common}
              </span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 flex flex-col animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-gray-100 flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              autoFocus
              placeholder="Land suchen..."
              className="w-full text-sm outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = selectedCountry?.cca2 === country.cca2;
                return (
                  <button
                    key={country.cca2}
                    onClick={() => handleSelect(country)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-orange-50 transition-colors ${isSelected ? "bg-orange-50 text-orange-700" : "text-gray-700"}`}
                  >
                    <img
                      src={country.flags.png}
                      alt={country.name.common}
                      className="w-6 h-4 object-cover rounded-sm shadow-sm shrink-0"
                    />
                    <span className="truncate">{country.name.common}</span>
                    {isSelected && (
                      <Check size={16} className="ml-auto text-orange-600" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-sm text-gray-400">
                Keine Länder gefunden
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
