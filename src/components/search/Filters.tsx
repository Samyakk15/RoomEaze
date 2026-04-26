"use client";

import React, { useState } from "react";

export interface FilterValues {
  priceMin: string;
  priceMax: string;
  locations: string[];
  stayTypes: string[];
}

interface FiltersProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}

const locationOptions = [
  "Mumbai",
  "Bangalore",
  "Delhi",
  "Pune",
  "Hyderabad",
  "Chennai",
];

const stayTypeOptions = ["Apartment", "PG", "Room", "Studio", "Shared Room"];

const Filters: React.FC<FiltersProps> = ({ values, onChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleLocation = (loc: string) => {
    const next = values.locations.includes(loc)
      ? values.locations.filter((l) => l !== loc)
      : [...values.locations, loc];
    onChange({ ...values, locations: next });
  };

  const toggleStayType = (type: string) => {
    const next = values.stayTypes.includes(type)
      ? values.stayTypes.filter((t) => t !== type)
      : [...values.stayTypes, type];
    onChange({ ...values, stayTypes: next });
  };

  const clearAll = () => {
    onChange({ priceMin: "", priceMax: "", locations: [], stayTypes: [] });
  };

  const activeCount =
    (values.priceMin ? 1 : 0) +
    (values.priceMax ? 1 : 0) +
    values.locations.length +
    values.stayTypes.length;

  const filterContent = (
    <div className="space-y-6">
      {/* ── Price Range ── */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              ₹
            </span>
            <input
              id="filter-price-min"
              type="number"
              placeholder="Min"
              value={values.priceMin}
              onChange={(e) =>
                onChange({ ...values, priceMin: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-7 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
          <span className="text-xs text-gray-400">–</span>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              ₹
            </span>
            <input
              id="filter-price-max"
              type="number"
              placeholder="Max"
              value={values.priceMax}
              onChange={(e) =>
                onChange({ ...values, priceMax: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-7 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>
      </div>

      {/* ── Location ── */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Location</h4>
        <div className="space-y-2">
          {locationOptions.map((loc) => (
            <label
              key={loc}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={values.locations.includes(loc)}
                onChange={() => toggleLocation(loc)}
                className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
              />
              {loc}
            </label>
          ))}
        </div>
      </div>

      {/* ── Stay Type ── */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Stay Type</h4>
        <div className="space-y-2">
          {stayTypeOptions.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={values.stayTypes.includes(type)}
                onChange={() => toggleStayType(type)}
                className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* ── Clear All ── */}
      {activeCount > 0 && (
        <button
          id="filter-clear"
          onClick={clearAll}
          className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── Mobile Toggle ── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 lg:hidden"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
          />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">
            {activeCount}
          </span>
        )}
      </button>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:hidden">
          {filterContent}
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Filters</h3>
            {activeCount > 0 && (
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
                {activeCount} active
              </span>
            )}
          </div>
          {filterContent}
        </div>
      </aside>
    </>
  );
};

export default Filters;
