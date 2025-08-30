import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function PaymentsPage() {
  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Payments", href: "/payments" }, { label: "List" }]} />
      <div>Payments Page</div>
    </div>
  );
} 