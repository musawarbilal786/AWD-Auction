import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function Page() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Pages", href: "/app/pages" }, { label: "Resource Center" }]} />
      <main><h1>Resource Center</h1></main>
    </div>
  );
} 