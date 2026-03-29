"use client";

import { LogoConcept } from "@/lib/types";
import LogoCard from "./logo-card";

interface LogoGridProps {
  logos: LogoConcept[];
  onFavorite?: (id: string) => void;
  favorites?: Set<string>;
  columns?: 3 | 4;
}

export default function LogoGrid({ logos, onFavorite, favorites = new Set(), columns = 4 }: LogoGridProps) {
  if (logos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">No logos generated yet</h3>
        <p className="text-gray-400 text-sm">Enter your business name to get started</p>
      </div>
    );
  }

  const gridClass = columns === 3
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

  return (
    <div className={gridClass}>
      {logos.map((logo) => (
        <LogoCard
          key={logo.id}
          logo={logo}
          onFavorite={onFavorite}
          isFavorited={favorites.has(logo.id)}
        />
      ))}
    </div>
  );
}
