import { useState } from "react";
import { Button, Form, Input } from "antd";

export default function FedExInfo() {
  const [form] = Form.useForm();
  const [fields, setFields] = useState({
    recipientName: "Zumar",
    recipientPhone: "1234567890",
    recipientCompany: "Car dealers",
    recipientStreet: "240 Mercer St, New York, NY 10012",
    recipientCity: "New York",
    recipientState: "NY",
    recipientPostal: "10001",
    recipientCountry: "US",
    accountNumber: "740561073",
  });
  const handleChange = (changed: any, all: typeof fields) => setFields(all);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-10">FedEx Information</h2>
      <div className="font-bold text-lg mb-4">Recipient Details</div>
      <Form
        form={form}
        layout="vertical"
        initialValues={fields}
        onValuesChange={handleChange}
        className="w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Recipient Name :" name="recipientName" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Recipient Phone :" name="recipientPhone" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Recipient Company :" name="recipientCompany" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Recipient Street Line :" name="recipientStreet" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Recipient City :" name="recipientCity" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Recipient State/Provice (Ex. NY) :" name="recipientState" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Recipient Postal Code :" name="recipientPostal" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Recipient Country (Ex : US) :" name="recipientCountry" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Account Number :" name="accountNumber" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
        </div>
        <div className="flex justify-end mt-10">
          <Button type="primary" htmlType="submit" className="bg-sky-600 hover:bg-sky-700 rounded-md px-8 py-2">
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
} 