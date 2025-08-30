import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function Page() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Pages", href: "/app/pages" }, { label: "Against Discrimination" }]} />
      <main><h1>Against Discrimination</h1></main>
    </div>
  );
} 