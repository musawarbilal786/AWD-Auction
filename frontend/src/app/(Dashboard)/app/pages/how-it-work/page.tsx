import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function Page() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Pages", href: "/app/pages" }, { label: "How It Work" }]} />
      <main><h1>How It Work</h1></main>
    </div>
  );
} 