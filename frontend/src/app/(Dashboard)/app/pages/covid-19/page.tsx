import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function Page() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Pages", href: "/app/pages" }, { label: "Covid 19" }]} />
      <main><h1>Covid 19</h1></main>
    </div>
  );
} 