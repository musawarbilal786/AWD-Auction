import { useState } from 'react';
import { Button, Tabs, Timeline, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import DataTable from '@/components/common/DataTable';
import ExpandableRowContent from '@/components/common/ExpandableRowContent';
import { JobData, JobStatus } from '@/hooks/useTransportationJobs';

interface JobsTableProps {
  data: JobData[];
  loading: boolean;
  status: JobStatus;
  title: string;
}

const JobsTable = ({ data, loading, status, title }: JobsTableProps) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<any[]>([]);
  const [activeTabs, setActiveTabs] = useState<{ [key: string]: string }>({});

  const getColumns = () => {
    const baseColumns = [
      {
        title: "",
        dataIndex: "image",
        key: "image",
        render: (img: any) => (
          <Image src={img || "/images/dummy-profile-logo.jpg"} alt="car" width={70} height={50} className="rounded" />
        ),
      },
      { title: "VIN(last six)", dataIndex: "vin", key: "vin" },
      { title: "Vehicle", dataIndex: "vehicle", key: "vehicle" },
      { title: "Pickup Time", dataIndex: "pickupTime", key: "pickupTime" },
      {
        title: "Transport Fee",
        dataIndex: "transportFee",
        key: "transportFee",
        render: (fee: any, record: any) => (
          <span className="text-green-600 font-bold">
            ${fee || 0} <br />
            <span className="text-xs text-blue-900">@ ${record.transportRate || 0}/km</span>
          </span>
        ),
      },
    ];

    // Add Auction ID for UnPicked and Accepted jobs
    if (status !== 'Ended') {
      baseColumns.splice(2, 0, { title: "Auction ID", dataIndex: "auctionId", key: "auctionId" });
    }

    // Add Drop Time for Ended jobs
    if (status === 'Ended') {
      baseColumns.splice(4, 0, { title: "Drop Time", dataIndex: "dropTime", key: "dropTime" });
    }

    // Add Action column for Accepted jobs
    if (status === 'Accepted') {
      baseColumns.push({
        title: "Action",
        key: "action",
        dataIndex: "action",
        render: (_: any, record: JobData) => (
          <Space>
            <Link href={`/transporter-accepted-jobs/${record.key}`}>
              <Button type="primary" icon={<EyeOutlined />} size="small">
                View Details
              </Button>
            </Link>
          </Space>
        ),
      });
    }

    return baseColumns;
  };

  const renderUnpickedExpandedContent = (record: JobData) => (
    <ExpandableRowContent expanded={expandedRowKeys.includes(record.key)}>
      <Button type="primary" className="mb-4">Details</Button>
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div className="font-bold text-blue-900">Pickup Location</div>
          <div>{record.pickup.name}</div>
          <div>{record.pickup.address}</div>
        </div>
        <div className="flex flex-col items-center">
          <Image src="/icons/distance.svg" alt="distance" width={60} height={60} />
          <div className="font-bold text-blue-900">Distance</div>
          <div>{record.distance} Km</div>
        </div>
        <div>
          <div className="font-bold text-blue-900">Dropoff Location</div>
          <div>{record.dropoff.name}</div>
          <div>{record.dropoff.address}</div>
        </div>
      </div>
    </ExpandableRowContent>
  );

  const renderAcceptedExpandedContent = (record: JobData) => (
    <ExpandableRowContent expanded={expandedRowKeys.includes(record.key)}>
      {/* Transporter Info */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="font-bold text-lg text-blue-900">Transporter</div>
        <div className="flex flex-wrap gap-6 text-gray-800">
          <span>Name : <span className="font-semibold">{record.transporter?.name}</span></span>
          <span>Email : <span className="font-semibold">{record.transporter?.email}</span></span>
          <span>Cell : <span className="font-semibold">{record.transporter?.cell}</span></span>
          <span>Phone : <span className="font-semibold">{record.transporter?.phone || '-'} </span></span>
        </div>
      </div>
      {/* Pickup/Dropoff/Distance Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Pickup Location */}
        <div>
          <div className="font-bold text-lg text-blue-900 mb-1">Pickup Location</div>
          <div className="font-semibold">{record.pickup.name}</div>
          <div className="text-gray-700">{record.pickup.address}</div>
          <div className="mt-4 text-blue-900 font-semibold">Seller Gate Key</div>
          <div className="text-2xl font-bold text-green-600 tracking-widest">{record.pickup.gateKey}</div>
        </div>
        {/* Distance */}
        <div className="flex flex-col items-center justify-center">
          <Image src="/icons/distance.svg" alt="distance" width={80} height={80} />
          <div className="font-bold text-blue-900 mt-2">Distance</div>
          <div className="text-lg font-semibold">{record.distance} Km</div>
          <Button className="mt-4 bg-blue-100 text-blue-900 font-semibold border-none cursor-default" size="large">{record.jobStatus}</Button>
        </div>
        {/* Dropoff Location */}
        <div>
          <div className="font-bold text-lg text-blue-900 mb-1">Dropoff Location</div>
          <div className="font-semibold">{record.dropoff.name}</div>
          <div className="text-gray-700">{record.dropoff.address}</div>
          <div className="mt-4 text-blue-900 font-semibold">Buyer Gate Key</div>
          <div className="text-2xl font-bold text-green-600 tracking-widest">{record.dropoff.gateKey}</div>
        </div>
      </div>
    </ExpandableRowContent>
  );

  const renderEndedExpandedContent = (record: JobData) => (
    <ExpandableRowContent expanded={expandedRowKeys.includes(record.key)}>
      <Tabs
        activeKey={activeTabs[record.key] || "details"}
        onChange={key => setActiveTabs(tabs => ({ ...tabs, [record.key]: key }))}
        items={[
          {
            key: "details",
            label: <Button type={activeTabs[record.key] === "details" || !activeTabs[record.key] ? "primary" : "default"} className="!rounded-none !px-8">Details</Button>,
            children: (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="font-bold text-lg text-blue-900">{record.job?.title}</div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <span className="text-gray-700">Job ID <span className="font-semibold">{record.job?.jobId}</span></span>
                    <span className="text-gray-700">VIN <span className="font-semibold">{record.job?.vin}</span></span>
                    <span className="text-green-600 font-bold">{record.job?.status}</span>
                    <span className="text-blue-900 font-semibold">You Earned <span className="text-green-600">${record.job?.earned}</span></span>
                  </div>
                </div>
                {/* Transporter Info */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                  <div className="font-bold text-lg text-blue-900">Transporter</div>
                  <div className="flex flex-wrap gap-6 text-gray-800">
                    <span>Name : <span className="font-semibold">{record.transporter?.name}</span></span>
                    <span>Email : <span className="font-semibold">{record.transporter?.email}</span></span>
                    <span>Cell : <span className="font-semibold">{record.transporter?.cell}</span></span>
                    <span>Phone : <span className="font-semibold">{record.transporter?.phone || '-'} </span></span>
                  </div>
                </div>
                {/* Pickup/Dropoff/Distance Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Pickup Location */}
                  <div>
                    <div className="font-bold text-lg text-blue-900 mb-1">Pickup Location</div>
                    <div className="font-semibold">{record.pickup.name}</div>
                    <div className="text-gray-700">{record.pickup.address}</div>
                    <div className="mt-4 text-blue-900 font-semibold">Seller Gate Key</div>
                    <div className="text-2xl font-bold text-green-600 tracking-widest">{record.pickup.gateKey}</div>
                  </div>
                  {/* Distance */}
                  <div className="flex flex-col items-center justify-center">
                    <Image src="/icons/distance.svg" alt="distance" width={80} height={80} />
                    <div className="font-bold text-blue-900 mt-2">Distance</div>
                    <div className="text-lg font-semibold">{record.distance} Km</div>
                  </div>
                  {/* Dropoff Location */}
                  <div>
                    <div className="font-bold text-lg text-blue-900 mb-1">Dropoff Location</div>
                    <div className="font-semibold">{record.dropoff.name}</div>
                    <div className="text-gray-700">{record.dropoff.address}</div>
                    <div className="mt-4 text-blue-900 font-semibold">Buyer Gate Key</div>
                    <div className="text-2xl font-bold text-green-600 tracking-widest">{record.dropoff.gateKey}</div>
                  </div>
                </div>
              </div>
            )
          },
          {
            key: "tracking",
            label: <Button type={activeTabs[record.key] === "tracking" ? "primary" : "default"} className="!rounded-none !px-8">Tracking</Button>,
            children: (
              <div className="flex flex-col md:flex-row gap-8">
                {/* Timeline */}
                <div className="flex-1">
                  <Timeline mode="left">
                    {record.tracking?.map((item: any, idx: number) => (
                      <Timeline.Item key={idx} color={idx === (record.tracking?.length || 0) - 1 ? "blue" : "gray"}>
                        <div className={idx === (record.tracking?.length || 0) - 1 ? "font-bold" : ""}>{item.event}</div>
                        <div className="text-xs text-gray-500">{item.time}</div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>
                {/* Delivery Summary */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-xl font-bold text-blue-900 mb-2">You marked as completed</div>
                  <div className="mb-2">
                    <div className="font-semibold text-gray-700">Seller Location</div>
                    <div>{record.pickup.address}</div>
                  </div>
                  <div className="mb-2">
                    <div className="font-semibold text-gray-700">Buyer Location</div>
                    <div>{record.dropoff.address}</div>
                  </div>
                  <div className="text-lg font-bold text-blue-900 mt-4">Delivered In</div>
                  <div className="text-2xl font-bold mt-1">{record.deliveredIn}</div>
                </div>
              </div>
            )
          }
        ]}
      />
    </ExpandableRowContent>
  );

  const getExpandedRowRender = (record: JobData) => {
    switch (status) {
      case 'UnPicked':
        return renderUnpickedExpandedContent(record);
      case 'Accepted':
        return renderAcceptedExpandedContent(record);
      case 'Ended':
        return renderEndedExpandedContent(record);
      default:
        return null;
    }
  };

  const expandableConfig = {
    expandedRowRender: getExpandedRowRender,
    expandedRowKeys,
    onExpand: (expanded: boolean, record: JobData) => {
      setExpandedRowKeys(expanded ? [record.key] : []);
    },
    rowExpandable: (record: JobData) => true,
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <DataTable
        columns={getColumns()}
        data={data}
        tableData={{}}
        loading={loading}
        expandable={expandableConfig}
      />
    </div>
  );
};

export default JobsTable; 