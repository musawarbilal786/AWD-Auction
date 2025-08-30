import { useState, useEffect } from 'react';
import axios from 'axios';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';

export type JobStatus = 'UnPicked' | 'Accepted' | 'Ended';

export interface JobData {
  key: string | number;
  vin: string;
  auctionId: string;
  vehicle: string;
  pickupTime: string;
  dropTime?: string;
  transportFee: number;
  transportRate: number;
  image: string;
  pickup: {
    name: string;
    address: string;
    gateKey?: string;
  };
  dropoff: {
    name: string;
    address: string;
    gateKey?: string;
  };
  distance: number;
  transporter?: {
    name: string;
    email: string;
    cell: string;
    phone: string;
  };
  jobStatus?: string;
  job?: {
    title: string;
    jobId: string;
    vin: string;
    status: string;
    earned: number;
  };
  tracking?: Array<{
    time: string;
    event: string;
  }>;
  deliveredIn?: string;
}

export const useTransportationJobs = (status: JobStatus) => {
  const [data, setData] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);

  const mapJobData = (job: any, index: number): JobData => {
    const baseJob = {
      key: job.id || index + 1,
      vin: job.vin ? job.vin.slice(-6) : 'N/A',
      auctionId: job.auction_id || job.id || 'N/A',
      vehicle: job.vehicle || `${job.year || ''} ${job.make || ''} ${job.model || ''}`.trim() || 'N/A',
      pickupTime: job.pickup_time || "Not decided",
      transportFee: job.transport_fee || 0,
      transportRate: job.transport_rate || 0,
      image: job.image || "/images/car1.jpg",
      pickup: {
        name: job.pickup?.name || "Pickup Name",
        address: job.pickup?.address || "Pickup Address",
        gateKey: job.pickup?.gate_key || "N/A"
      },
      dropoff: {
        name: job.dropoff?.name || "Dropoff Name",
        address: job.dropoff?.address || "Dropoff Address",
        gateKey: job.dropoff?.gate_key || "N/A"
      },
      distance: job.distance || 0
    };

    // Add status-specific data
    if (status === 'Accepted') {
      return {
        ...baseJob,
        transporter: {
          name: job.transporter?.name || "N/A",
          email: job.transporter?.email || "N/A",
          cell: job.transporter?.cell || "N/A",
          phone: job.transporter?.phone || ""
        },
        jobStatus: job.job_status || "Job not started"
      };
    }

    if (status === 'Ended') {
      return {
        ...baseJob,
        dropTime: job.drop_time || "Not decided",
        transporter: {
          name: job.transporter?.name || "N/A",
          email: job.transporter?.email || "N/A",
          cell: job.transporter?.cell || "N/A",
          phone: job.transporter?.phone || ""
        },
        job: {
          title: job.vehicle || `${job.year || ''} ${job.make || ''} ${job.model || ''}`.trim() || 'N/A',
          jobId: job.job_id || job.id || 'N/A',
          vin: job.vin || 'N/A',
          status: job.status || "Completed",
          earned: job.transport_fee || 0
        },
        tracking: job.tracking || [
          { time: "Not available", event: "No tracking data" }
        ],
        deliveredIn: job.delivered_in || "Not available"
      };
    }

    return baseJob;
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Try without status parameter first
      const response = await axios.get(`${apiUrl}/transportation/api/v1/jobs/`, { headers });
      
      // Filter data based on status on client side
      let filteredData = response.data || [];
      
      // If the API returns all jobs, filter by status
      if (Array.isArray(filteredData)) {
        filteredData = filteredData.filter((job: any) => {
          const jobStatus = job.status || job.job_status || 'UnPicked';
          return jobStatus.toLowerCase() === status.toLowerCase();
        });
      }
      
      const mappedData = filteredData.map(mapJobData);
      setData(mappedData);
      showSuccessToast(`${status} jobs fetched successfully!`, 'Jobs');
    } catch (err: any) {
      showErrorToast(err, `${status} jobs`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [status]);

  return {
    data,
    loading,
    refetch: fetchJobs
  };
}; 