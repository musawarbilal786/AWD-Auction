import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function InspectionPage() {
  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Inspection", href: "/inspection" }, { label: "List" }]} />
      <div>Inspection Page</div>
    </div>
  );
} 