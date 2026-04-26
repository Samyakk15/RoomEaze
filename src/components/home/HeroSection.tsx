"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/layout/Container";

const stayTypes = ["Apartment", "PG", "Room", "Studio", "Shared Room"];

const HeroSection: React.FC = () => {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [stayType, setStayType] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set("city", city.trim());
    if (budget.trim()) params.set("budget", budget.trim());
    if (stayType) params.set("type", stayType);
    const query = params.toString();
    router.push(query ? `/search?${query}` : "/search");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-orange-50">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />

      <Container className="relative z-10 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-rose-600">
            Trusted by 10,000+ tenants
          </span>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Find Your{" "}
            <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
              Perfect Stay
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
            Browse thousands of verified rooms, PGs, and apartments across India.
            Your next home is just a search away.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-10 flex max-w-4xl flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl shadow-gray-200/60 sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:p-2"
        >
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <input
              type="text"
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border-0 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 sm:rounded-full"
            />
          </div>

          <div className="hidden h-8 w-px bg-gray-200 sm:block" />

          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <input
              type="text"
              placeholder="Max budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-xl border-0 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 sm:rounded-full"
            />
          </div>

          <div className="hidden h-8 w-px bg-gray-200 sm:block" />

          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <select
              value={stayType}
              onChange={(e) => setStayType(e.target.value)}
              className="w-full appearance-none rounded-xl border-0 bg-gray-50 py-3 pl-10 pr-8 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 sm:rounded-full"
            >
              <option value="">Stay type</option>
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
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:from-rose-600 hover:to-rose-700 hover:shadow-rose-500/40 active:scale-[0.97] sm:rounded-full"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            Search
          </button>
        </form>

        <div className="mx-auto mt-12 flex max-w-lg flex-wrap items-center justify-center gap-8 text-center text-sm text-gray-500">
          <div>
            <span className="block text-2xl font-bold text-gray-900">50K+</span>
            Listings
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <span className="block text-2xl font-bold text-gray-900">120+</span>
            Cities
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <span className="block text-2xl font-bold text-gray-900">98%</span>
            Happy Tenants
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
