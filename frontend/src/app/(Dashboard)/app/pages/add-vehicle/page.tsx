import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function Page() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Pages", href: "/app/pages" }, { label: "Add Vehicle" }]} />
      <main><h1>Add Vehicle</h1></main>
    </div>
  );
} 