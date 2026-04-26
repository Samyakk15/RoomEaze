"use client";

import React from "react";

export interface SearchValues {
  city: string;
  budget: string;
  stayType: string;
}

interface SearchBarProps {
  values: SearchValues;
  onChange: (values: SearchValues) => void;
  onSearch: () => void;
}

const stayTypes = ["Apartment", "PG", "Room", "Studio", "Shared Room"];

const SearchBar: React.FC<SearchBarProps> = ({ values, onChange, onSearch }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg shadow-gray-200/50 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        {/* City / Location */}
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Location
          </label>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            <input
              id="search-city"
              type="text"
              placeholder="Enter city or area"
              value={values.city}
              onChange={(e) => onChange({ ...values, city: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 transition-colors focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Max Budget
          </label>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <input
              id="search-budget"
              type="number"
              placeholder="e.g. 20000"
              value={values.budget}
              onChange={(e) => onChange({ ...values, budget: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 transition-colors focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>

        {/* Stay Type */}
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Stay Type
          </label>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            <select
              id="search-stay-type"
              value={values.stayType}
              onChange={(e) => onChange({ ...values, stayType: e.target.value })}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-9 text-sm text-gray-700 transition-colors focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
            >
              <option value="">All types</option>
              {stayTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        </div>

        {/* Search Button */}
        <button
          id="search-submit"
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:from-rose-600 hover:to-rose-700 hover:shadow-rose-500/40 active:scale-[0.97]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
