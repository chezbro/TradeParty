import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import debounce from 'lodash/debounce';

interface SymbolSearchProps {
  value: string;
  onChange: (symbol: string) => void;
  className?: string;
}

export const SymbolSearch: React.FC<SymbolSearchProps> = ({ value, onChange, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSymbols = async (term: string) => {
    if (!term) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search-symbols?q=${term}`);
      const data = await response.json();
      setSuggestions(data.symbols || []);
    } catch (error) {
      console.error('Error searching symbols:', error);
      setSuggestions([]);
    }
    setIsLoading(false);
  };

  // Debounce the search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      searchSymbols(term);
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toUpperCase();
    setSearchTerm(term);
    setShowSuggestions(true);
    debouncedSearch(term);
  };

  const handleSelectSymbol = (symbol: string) => {
    setSearchTerm(symbol);
    onChange(symbol);
    setShowSuggestions(false);
  };

  // Update searchTerm when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Symbol"
          className={`pl-8 ${className}`}
        />
        
      </div>

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-white/10 rounded-md shadow-lg">
          {isLoading ? (
            <div className="p-2 text-sm text-gray-400">Loading...</div>
          ) : (
            <ul className="max-h-48 overflow-auto">
              {suggestions.map((symbol) => (
                <li
                  key={symbol}
                  onClick={() => handleSelectSymbol(symbol)}
                  className="px-3 py-2 text-sm text-white/90 hover:bg-gray-800 cursor-pointer"
                >
                  {symbol}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}; 