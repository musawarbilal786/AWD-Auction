import { Modal } from "antd";
import React from "react";

interface TransferDetailsModalProps {
  open: boolean;
  onCancel: () => void;
  record: any | null;
}

const TransferDetailsModal: React.FC<TransferDetailsModalProps> = ({ open, onCancel, record }) => {
  if (!record) return null;
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={<span className="text-xl font-semibold">Transfer details</span>}
      centered
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between font-bold text-base mb-2">
          <span>AMOUNT PAID</span>
          <span>DATE PAID</span>
        </div>
        <div className="flex justify-between mb-4">
          <span>${record.amountPaid ?? record.total ?? '--'}</span>
          <span>{record.datePaid ?? '--'}</span>
        </div>
        <div className="mb-2 text-sm">
          <div>Transfer ID : {record.transferId ?? '--'}</div>
          <div>Transfer Group : {record.transferGroup ?? '--'}</div>
          <div>Destination ID : {record.destinationId ?? '--'}</div>
          <div>Source Type : {record.sourceType ?? '--'}</div>
          <div>Transaction By : {record.transactionBy ?? '--'}</div>
        </div>
        <div className="flex justify-between items-center font-bold text-base border-t pt-3 mt-2">
          <span>Total Amount</span>
          <span>${record.amountPaid ?? record.total ?? '--'}</span>
        </div>
        <div className="mt-4 p-2 bg-gray-50 border rounded text-sm text-slate-700">
          The payment against auction ({record.auctionId ?? '--'}) has been received and credited your account successfully.
        </div>
      </div>
    </Modal>
  );
};

export default TransferDetailsModal; 