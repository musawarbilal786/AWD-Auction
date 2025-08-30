"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function TransportationPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Transportation", href: "/transportation" }]} />
      <div className="p-6">
        <div>Transportation Page</div>
      </div>
    </div>
  );
} 