"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataTable from "@/components/common/DataTable";
import { Button, Dropdown, Tag } from "antd";
import { SettingOutlined, DownOutlined, SwapOutlined } from '@ant-design/icons';
import ConfirmModal from "@/components/modals/ConfirmModal";
import TransferDetailsModal from "@/components/modals/TransferDetailsModal";
import React from "react";

export default function TransporterPaymentPage() {
  const [confirmModal, setConfirmModal] = React.useState<{ open: boolean; record: any | null }>({ open: false, record: null });
  const [detailsModal, setDetailsModal] = React.useState<{ open: boolean; record: any | null }>({ open: false, record: null });

  const columns = [
    {
      title: "Auction Details",
      dataIndex: "auctionDetails",
      key: "auctionDetails",
      render: (val: any, record: any) => (
        <div>
          <div className="font-bold">Auction #{record.auctionId}</div>
          <div className="font-semibold">VIN {record.vin}</div>
          <div>{record.makeModelYear}</div>
          <div>{record.miles} Miles</div>
        </div>
      ),
    },
    {
      title: "Transporter",
      dataIndex: "transporter",
      key: "transporter",
      render: (val: any, record: any) => (
        <div>
          <div className="font-bold">{record.transporterCompany}</div>
          <div>{record.transporterName}</div>
          <div>{record.transporterEmail}</div>
        </div>
      ),
    },
    {
      title: "Locations",
      dataIndex: "locations",
      key: "locations",
      render: (val: any, record: any) => (
        <div className="text-sm">
          <div><b>Pickup</b></div>
          <div>{record.pickupLocation}</div>
          <div>zip : {record.pickupZip}</div>
          <div className="mt-1"><b>Dropoff</b></div>
          <div>{record.dropoffLocation}</div>
          <div>zip : {record.dropoffZip}</div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: any, record: any) => (
        <div className="text-sm">
          <div>Distance : {record.distance} Miles</div>
          <div>Slab : {record.slab}</div>
          <div>Charges : ${record.charges} / mile</div>
          <div className="text-green-600 font-bold">Total : ${record.total}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val: any) => (
        val === 'Paid' ? <Tag color="green">Paid</Tag> : <Tag color="default">Un-Paid</Tag>
      ),
      width: 90,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const items = record.status === 'Un-Paid'
          ? [
              {
                key: 'transfer',
                label: (
                  <span className="flex items-center gap-2"><SwapOutlined /> Transfer</span>
                ),
                onClick: () => {
                  setConfirmModal({ open: true, record });
                },
              },
            ]
          : [
              {
                key: 'view-details',
                label: (
                  <span className="flex items-center gap-2"><SwapOutlined /> View transfer details</span>
                ),
                onClick: () => {
                  setDetailsModal({ open: true, record });
                },
              },
            ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<span className="flex items-center gap-1"><SettingOutlined /><DownOutlined /></span>} />
          </Dropdown>
        );
      },
      width: 80,
    },
  ];

  const data = [
    {
      key: 1,
      auctionId: '3107157482',
      vin: 'JM3TB3DV4C0352508',
      makeModelYear: 'Mazda CX-9 2012',
      miles: '94,465',
      transporterCompany: 'Marten Digitals',
      transporterName: 'Daniel Mark',
      transporterEmail: 'Danielmark2323@gmail.com',
      pickupLocation: 'Aladdin Harmon RUSSELLVILLE 15046 Hwy 43 Ste C',
      pickupZip: '35653',
      dropoffLocation: 'Marten Lobo Lake Buena Vista 1520 E Buena Vista Drive #A',
      dropoffZip: 'FL 32830',
      distance: 1127.932,
      slab: 'Under 5000',
      charges: 0.25,
      total: 281.98,
      status: 'Paid',
      amountPaid: 281.98,
      datePaid: 'Feb 28, 2024, 08:53 am',
      transferId: 'tr_1Oona5EaPimPlhjg4yXRuyNh',
      transferGroup: 'AUC3719587407',
      destinationId: 'acct_1Ooj7QIITFNvdP1A',
      sourceType: 'Card',
      transactionBy: 'Super Admin',
    },
    {
      key: 2,
      auctionId: '47124828',
      vin: 'WMWZC3C53CWL85138',
      makeModelYear: 'Mini Cooper 2012',
      miles: '93,446',
      transporterCompany: 'Marten Digitals',
      transporterName: 'Daniel Mark',
      transporterEmail: 'Danielmark2323@gmail.com',
      pickupLocation: 'Aladdin Harmon RUSSELLVILLE 15046 Hwy 43 Ste C',
      pickupZip: '35653',
      dropoffLocation: 'Marten Lobo Lake Buena Vista 1520 E Buena Vista Drive #A',
      dropoffZip: 'FL 32830',
      distance: 1127.932,
      slab: 'Under 5000',
      charges: 0.25,
      total: 281.98,
      status: 'Un-Paid',
    },
    {
      key: 3,
      auctionId: '3719587407',
      vin: '1G2MB35B16Y118676',
      makeModelYear: 'Pontiac Solstice 2006',
      miles: '74,362',
      transporterCompany: 'Marten Digitals',
      transporterName: 'Daniel Mark',
      transporterEmail: 'Danielmark2323@gmail.com',
      pickupLocation: 'Aladdin Harmon RUSSELLVILLE 15046 Hwy 43 Ste C',
      pickupZip: '35653',
      dropoffLocation: 'Marten Lobo Lake Buena Vista 1520 E Buena Vista Drive #A',
      dropoffZip: 'FL 32830',
      distance: 1127.932,
      slab: 'Under 5000',
      charges: 0.25,
      total: 281.98,
      status: 'Paid',
      amountPaid: 281.98,
      datePaid: 'Feb 28, 2024, 08:53 am',
      transferId: 'tr_1Oona5EaPimPlhjg4yXRuyNh',
      transferGroup: 'AUC3719587407',
      destinationId: 'acct_1Ooj7QIITFNvdP1A',
      sourceType: 'Card',
      transactionBy: 'Super Admin',
    },
    {
      key: 4,
      auctionId: '1434816304',
      vin: 'JN8AS5BX9YW444982',
      makeModelYear: 'Nissan Rogue 2009',
      miles: '32,323',
      transporterCompany: 'Oleg Hewitt',
      transporterName: 'Kai Dalton',
      transporterEmail: 'transporter2@gmail.com',
      pickupLocation: 'South Dakota 34021 N US-45, Grayslake, IL 60030,',
      pickupZip: '57102',
      dropoffLocation: 'Broadway 838 Broadway, New York, NY 10003, USA',
      dropoffZip: '10001',
      distance: 1348.332,
      slab: 'Under 5000',
      charges: 0.25,
      total: 337.08,
      status: 'Paid',
      amountPaid: 337.08,
      datePaid: 'Feb 28, 2024, 08:53 am',
      transferId: 'tr_1Oona5EaPimPlhjg4yXRuyNh',
      transferGroup: 'AUC1434816304',
      destinationId: 'acct_1Ooj7QIITFNvdP1A',
      sourceType: 'Card',
      transactionBy: 'Super Admin',
    },
    {
      key: 5,
      auctionId: '2408459329',
      vin: '5TFTB541X7X02142',
      makeModelYear: 'Toyota Tundra 2007',
      miles: '16,300',
      transporterCompany: 'Oleg Hewitt',
      transporterName: 'Kai Dalton',
      transporterEmail: 'transporter2@gmail.com',
      pickupLocation: 'Granville Lane 4034 Granville Lane',
      pickupZip: '0000',
      dropoffLocation: 'South Dakota 34021 N US-45, Grayslake, IL 60030,',
      dropoffZip: '57102',
      distance: 551.184,
      slab: 'Under 5000',
      charges: 0.25,
      total: 137.80,
      status: 'Paid',
      amountPaid: 137.80,
      datePaid: 'Feb 28, 2024, 08:53 am',
      transferId: 'tr_1Oona5EaPimPlhjg4yXRuyNh',
      transferGroup: 'AUC2408459329',
      destinationId: 'acct_1Ooj7QIITFNvdP1A',
      sourceType: 'Card',
      transactionBy: 'Super Admin',
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Payments", href: "/payments" }, { label: "Transporter Payment" }]} />
      <div className="bg-white rounded-xl shadow-md p-6">
        <DataTable
          columns={columns}
          data={data}
          tableData={{
            isEnableFilterInput: true,
            selectableRows: true,
          }}
        />
      </div>
      <ConfirmModal
        open={confirmModal.open}
        onOk={() => {
          // Implement transfer logic here
          setConfirmModal({ open: false, record: null });
        }}
        onCancel={() => setConfirmModal({ open: false, record: null })}
        title="Are you sure?"
        content={confirmModal.record ? (
          <>
            <div className="font-bold text-lg text-center mb-2">Are you sure you want to transfer?</div>
            <div className="text-center">${confirmModal.record.total}.00 will transfer to transporter account.</div>
          </>
        ) : null}
        okText="Yes, Confirm it!"
        cancelText="Cancel"
      />
      <TransferDetailsModal
        open={detailsModal.open}
        onCancel={() => setDetailsModal({ open: false, record: null })}
        record={detailsModal.record}
      />
    </div>
  );
} 