"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Filters, { FilterValues } from "./Filters";

export default function FilterWrapper({ initialValues }: { initialValues: FilterValues }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (values: FilterValues) => {
    const params = new URLSearchParams(searchParams.toString());

    if (values.locations.length > 0) {
      params.set("locality", values.locations.join(","));
    } else {
      params.delete("locality");
    }

    if (values.stayTypes.length > 0) {
      params.set("type", values.stayTypes.join(","));
    } else {
      params.delete("type");
    }

    if (values.priceMin) {
      params.set("min_price", values.priceMin);
    } else {
      params.delete("min_price");
    }

    if (values.priceMax) {
      params.set("max_price", values.priceMax);
    } else {
      params.delete("max_price");
    }

    // Reset pagination when filters change
    params.delete("page");

    router.push(`/search?${params.toString()}`);
  };

  return <Filters values={initialValues} onChange={handleFilterChange} />;
}
