"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

export function SearchBar({ initialValue = "", compact = false, locality }: { initialValue?: string; compact?: boolean; locality?: string }) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();
  function submit(event: FormEvent) {
    event.preventDefault();
    const query = value.trim();
    if (!query) return;
    const params = new URLSearchParams({ q: query });
    if (locality) params.set("location", locality.toLowerCase().replaceAll(" ", "-"));
    router.push(`/search?${params}`);
  }
  return <form className={`public-search${compact ? " public-search--compact" : ""}`} role="search" onSubmit={submit}>
    <Icon name="search" size={19}/><label className="sr-only" htmlFor={compact ? "header-search" : "page-search"}>Search CONFLUMIX</label>
    <input id={compact ? "header-search" : "page-search"} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search products, reuse, tasks, or donations" />
    {value && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setValue("")}><Icon name="close" size={17}/></button>}
    <button className="search-submit" type="submit">Search</button>
  </form>;
}

