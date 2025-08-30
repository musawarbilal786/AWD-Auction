"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function CareerCareerPage() {
  const role = useSelector((state: RootState) => state.user.role);
  if (role === "ds") return <div>Career Career Page</div>;
  return (
    <div>
      <Breadcrumbs items={[{ label: "Career", href: "/app/career" }, { label: "Career" }]} />
      <div>Career Career Page</div>
    </div>
  );
} 