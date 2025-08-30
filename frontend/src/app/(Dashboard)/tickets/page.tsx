import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function TicketsPage() {
  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "List" }]} />
      <div>Tickets Page</div>
    </div>
  );
} 