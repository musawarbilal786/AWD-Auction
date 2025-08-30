import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function AuctionsPage() {
  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Auctions", href: "/auctions" }, { label: "List" }]} />
      <div>Auctions Page</div>
    </div>
  );
} 