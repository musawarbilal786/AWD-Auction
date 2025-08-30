import { Modal } from "antd";
import React from "react";

interface ConfirmModalProps {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  title?: string;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
}

export default function ConfirmModal({ open, onOk, onCancel, title = "Confirm", content, okText = "Yes, Confirm it!", cancelText = "Cancel" }: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      title={title}
      okText={okText}
      cancelText={cancelText}
      centered
      footer={null}
    >
      <div className="flex flex-col items-center justify-center py-6">
        <div className="text-6xl text-orange-400 mb-4">&#9888;</div>
        <div className="text-lg text-center mb-6">{content}</div>
        <div className="flex gap-4 justify-center">
          <button onClick={onOk} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
            {okText}
          </button>
          <button onClick={onCancel} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded">
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
} 