"use client";

import { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import SwissMap from "../map/SwissMap";
import { GuideFilters } from "@/types/GuideFilters";

export default function AppLayout() {

  const [filters, setFilters] = useState<GuideFilters>({
    water: true,
    hazard: true,
    hut: true,
    cafe: true,
    information: true,
    sections: true,
  });

  return (
    <div className="flex h-screen">

      <Sidebar
        filters={filters}
        setFilters={setFilters}
      />

      <main className="flex-1">
        <SwissMap filters={filters} />
      </main>

    </div>
  );
}