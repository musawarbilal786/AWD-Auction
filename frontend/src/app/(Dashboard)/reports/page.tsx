import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function ReportsPage() {
  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Reports", href: "/reports" }, { label: "List" }]} />
      <div>Reports Page</div>
    </div>
  );
} 