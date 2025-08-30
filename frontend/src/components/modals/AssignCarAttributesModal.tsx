"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Select, Input, Button, Spin } from "antd";
import axios from "axios";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";

interface AssignCarAttributesModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: number | null;
}

const AssignCarAttributesModal = ({ isOpen, onClose, requestId }: AssignCarAttributesModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (isOpen && requestId) {
        setLoading(true);
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const response = await axios.get(`${apiUrl}/inspections/api/v1/requests/${requestId}/`, { headers });
          const details = response.data;
          
          const initialValues: { [key: string]: any } = {};
          attributeFields.forEach(field => {
            if (details[field.name]) {
              initialValues[`${field.name}_manual`] = details[field.name];
            }
          });
          form.setFieldsValue(initialValues);

        } catch (error) {
          showErrorToast(error, "Car attributes");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCarDetails();
  }, [isOpen, requestId, form]);


  const handleSubmit = async (values: any) => {
    setSaving(true);
    const payload: { [key: string]: any } = {};
    attributeFields.forEach(field => {
      const manualValue = values[`${field.name}_manual`];
      const selectValue = values[`${field.name}_select`];
      if (manualValue) {
        payload[field.name] = manualValue;
      } else if (selectValue) {
        payload[field.name] = selectValue;
      }
    });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.patch(`${apiUrl}/inspections/api/v1/assign-car-attributes/${requestId}/`, payload, { headers });
      showSuccessToast(COMMON_SUCCESS_MESSAGES.SAVED, "Car attributes");
      onClose();
    } catch (err: any) {
      showErrorToast(err, "Car attributes submission");
    } finally {
      setSaving(false);
    }
  };

  const attributeFields = [
    { name: "year", label: "Year" },
    { name: "make", label: "Make" },
    { name: "model", label: "Model" },
    { name: "trim", label: "Trim" },
    { name: "series", label: "Series" },
    { name: "cylinders", label: "Cylinders" },
    { name: "transmission", label: "Transmission" },
    { name: "drivetrain", label: "Drivetrain" },
    { name: "rough", label: "Rough" },
    { name: "average", label: "Average" },
    { name: "clean", label: "Clean" },
  ];

  return (
    <Modal
      title={<h2 className="text-2xl font-bold text-gray-800">Assign Car Attributes</h2>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSubmit}
          className="mt-6"
          labelCol={{ xs: 24, sm: 6, md: 5, lg: 4 }}
          wrapperCol={{ xs: 24, sm: 18, md: 19, lg: 20 }}
          labelAlign="left"
        >
          <div className="max-h-[60vh] overflow-y-auto pr-4 -mr-4">
            {attributeFields.map((field) => (
              <Form.Item key={field.name} label={field.label} className="mb-4 ">
                <Input.Group compact className="gap-2">
                  <Form.Item name={`${field.name}_select`} noStyle>
                    <Select placeholder={`Select ${field.label}`} style={{ width: "50%" }} options={[]} />
                  </Form.Item>
                  <Form.Item name={`${field.name}_manual`} noStyle>
                    <Input placeholder={`Enter Manual ${field.label}`} style={{ width: "50%" }} />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            ))}
          </div>

          <div className="flex justify-end gap-3 border-t pt-6 mt-6">
            <Button onClick={onClose} style={{ minWidth: 100 }}>
              Close
            </Button>
            <Button type="primary" htmlType="submit" loading={saving} style={{ minWidth: 200 }}>
              Submit Car Attributes
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default AssignCarAttributesModal; 