import Breadcrumbs from "@/components/common/Breadcrumbs";

export default function Page() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Forms", href: "/app/forms" }, { label: "Form1" }]} />
      <main><h1>/dashboard/app/forms/form1</h1></main>
    </div>
  );
} 