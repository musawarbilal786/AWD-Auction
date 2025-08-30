import { Modal, Form, Input, Row, Col, Button } from "antd";
import { FormInstance } from "antd/es/form";
import React from "react";

interface CreateSellerLabelModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (values: any) => void;
  initialValues?: Record<string, any>;
  vin?: string;
}

const CreateSellerLabelModal: React.FC<CreateSellerLabelModalProps> = ({
  open,
  onCancel,
  onConfirm,
  initialValues = {},
  vin = "",
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={`Create Seller Label Return Shipment (${vin})`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Form layout="vertical" form={form} initialValues={initialValues}>
        <Row gutter={16}>
          <Col span={12}><Form.Item label="Shipping Date" name="shippingDate"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item label="Shipper Phone" name="shipperPhone"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item label="Shipper Name" name="shipperName"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item label="Shipper Street Line" name="shipperStreet"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item label="Shipper Company" name="shipperCompany"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item label="Shipper State/Provice (Ex. NY)" name="shipperState"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item label="Shipper City" name="shipperCity"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item label="Shipper Country" name="shipperCountry"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item label="Shipper Postal Code" name="shipperPostalCode"><Input /></Form.Item></Col>
        </Row>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Close</Button>
          <Button type="primary" onClick={() => onConfirm(form.getFieldsValue())}>Confirm Now</Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateSellerLabelModal; 