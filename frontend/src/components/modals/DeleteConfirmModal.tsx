import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = (
    <div className="flex items-center gap-2">
      <ExclamationCircleFilled className="text-red-500 text-xl" />
      <span>Delete</span>
    </div>
  ),
  description = "Are you sure you want to delete this item? This action cannot be undone.",
}: DeleteConfirmModalProps) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      onOk={onConfirm}
      okText="Yes, Delete"
      cancelText="No, Cancel"
      okButtonProps={{
        danger: true,
        loading: loading,
        className: 'bg-red-500 hover:bg-red-600'
      }}
      cancelButtonProps={{
        className: 'hover:bg-gray-100'
      }}
    >
      <div className="py-4">
        <p className="text-gray-700">{description}</p>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal; 