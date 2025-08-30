"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useTransportationJobs } from "@/hooks/useTransportationJobs";
import JobsTable from "@/components/transportation/JobsTable";

export default function JobsAcceptedPage() {
  const { data, loading } = useTransportationJobs('Accepted');

  if (loading) {
    return (
      <div>
        <Breadcrumbs items={[{ label: "Transportation", href: "/transportation" }, { label: "Jobs", href: "/transportation/jobs" }, { label: "Accepted" }]} />
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-sky-700 mb-4">Accepted Jobs <span className="text-black font-normal">/ List</span></h2>
          <div className="text-center py-8 text-gray-500">Loading accepted jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Transportation", href: "/transportation" }, { label: "Jobs", href: "/transportation/jobs" }, { label: "Accepted" }]} />
      <JobsTable 
        data={data} 
        loading={loading} 
        status="Accepted" 
        title="Accepted Jobs" 
      />
    </div>
  );
} 