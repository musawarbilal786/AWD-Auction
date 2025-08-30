import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function Page() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Pages", href: "/app/pages" }, { label: "Trust Safety" }]} />
      <main><h1>Trust Safety</h1></main>
    </div>
  );
} 