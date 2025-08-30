import { JobStatus } from "@/hooks/useTransportationJobs";

interface JobsPageWrapperProps {
  children: React.ReactNode;
  status: JobStatus;
  loading: boolean;
}

const JobsPageWrapper = ({ children, status, loading }: JobsPageWrapperProps) => {
  const getTitle = () => {
    switch (status) {
      case 'UnPicked':
        return 'Un-Picked Jobs';
      case 'Accepted':
        return 'Accepted Jobs';
      case 'Ended':
        return 'Completed Jobs';
      default:
        return 'Jobs';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-sky-700 mb-4">{getTitle()} <span className="text-black font-normal">/ List</span></h2>
        <div className="text-center py-8 text-gray-500">Loading {status.toLowerCase()} jobs...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default JobsPageWrapper; 