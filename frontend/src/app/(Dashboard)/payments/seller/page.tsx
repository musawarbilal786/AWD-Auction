"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataTable from "@/components/common/DataTable";
import { Button, Dropdown, Tag } from "antd";
import { SettingOutlined, DownOutlined, EditOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import ConfirmModal from "@/components/modals/ConfirmModal";
import TransferDetailsModal from "@/components/modals/TransferDetailsModal";
import React, { useState } from "react";

export default function SellerPaymentPage() {
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
      title: "Dealer",
      dataIndex: "dealer",
      key: "dealer",
      render: (val: any, record: any) => (
        <div>
          <div className="font-bold">{record.dealerName}</div>
          <div>{record.dealerContact}</div>
          <div>{record.dealerEmail}</div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: any, record: any) => (
        <div className="text-sm">
          <div>Sold Price : <b>${record.soldPrice ?? 'NaN'}</b></div>
          <div>Inspection Fee : <b>-${record.inspectionFee ?? 'NaN'}</b></div>
          <div>Selling Fee : <b>-${record.sellingFee ?? 'NaN'}</b></div>
          {record.credits !== undefined && <div>Credits : <b>+ ${record.credits}</b></div>}
          <div className="text-green-600 font-bold">Total : ${record.total ?? 'NaN'}</div>
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
      auctionId: '302403212',
      vin: '2025',
      makeModelYear: 'Toyata 2025 2025',
      miles: '40,000',
      dealerName: 'Gage Carr',
      dealerContact: 'Alana Cantu',
      dealerEmail: 'buyer@gmail.com',
      soldPrice: 'NaN',
      inspectionFee: 'NaN',
      sellingFee: 'NaN',
      total: 'NaN',
      status: 'Un-Paid',
    },
    {
      key: 2,
      auctionId: '562511253',
      vin: 'JN8AS5MV5CW392335',
      makeModelYear: '2 2 2',
      miles: '74,275',
      dealerName: 'Archienoah',
      dealerContact: 'Archie Noah',
      dealerEmail: 'Archienoah2345@gmail.com',
      soldPrice: 300,
      inspectionFee: 150,
      sellingFee: 10,
      total: 140,
      status: 'Un-Paid',
    },
    {
      key: 3,
      auctionId: '1984188628',
      vin: 'JA4J4UA86NZ065825',
      makeModelYear: 'for testing 1010 2024',
      miles: '22,461',
      dealerName: 'Archienoah',
      dealerContact: 'Archie Noah',
      dealerEmail: 'Archienoah2345@gmail.com',
      soldPrice: 100,
      inspectionFee: 50,
      sellingFee: 10,
      total: 40,
      status: 'Paid',
      amountPaid: 40,
      datePaid: 'Nov 04, 2024, 13:12 pm',
      transferId: 'tr_1QHLOpEaPimPlhig8NqyRqdP',
      transferGroup: 'AUC1984188628',
      destinationId: 'acct_1Q2AbelHNUMhoyy0',
      sourceType: 'Card',
      transactionBy: 'Super Admin',
    },
    {
      key: 4,
      auctionId: '2478293148',
      vin: '23456',
      makeModelYear: 'othermake testmodel2 887',
      miles: '22',
      dealerName: 'Speed Car',
      dealerContact: 'Henry Dox',
      dealerEmail: 'dealer2@gmail.com',
      soldPrice: 500,
      inspectionFee: 250,
      sellingFee: 5,
      total: 245,
      status: 'Un-Paid',
    },
    {
      key: 5,
      auctionId: '3107157482',
      vin: 'JM3TB3DV4C0352508',
      makeModelYear: 'Mazda CX-9 2012',
      miles: '94,465',
      dealerName: 'Aladdin Harmon',
      dealerContact: 'Aladdin Harmon',
      dealerEmail: 'qykv@mailinator.com',
      soldPrice: 400,
      inspectionFee: 200,
      sellingFee: 10,
      total: 190,
      status: 'Paid',
      amountPaid: 190,
      datePaid: 'Nov 01, 2024, 10:00 am',
      transferId: 'tr_1QHLOpEaPimPlhig8NqyRxxX',
      transferGroup: 'AUC3107157482',
      destinationId: 'acct_1Q2AbelHNUMhoyy1',
      sourceType: 'Card',
      transactionBy: 'Super Admin',
    },
    {
      key: 6,
      auctionId: '47124828',
      vin: 'WMWZC3C53CWL85138',
      makeModelYear: 'Mini Cooper 2012',
      miles: '93,446',
      dealerName: 'Aladdin Harmon',
      dealerContact: 'Aladdin Harmon',
      dealerEmail: 'qykv@mailinator.com',
      soldPrice: 1700,
      inspectionFee: 850,
      sellingFee: 10,
      credits: 0,
      total: 840,
      status: 'Un-Paid',
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Payments", href: "/payments" }, { label: "Seller Payment" }]} />
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
            <div className="text-center">${confirmModal.record.total}.00 will transfer to seller account.</div>
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