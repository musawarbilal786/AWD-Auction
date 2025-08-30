import { useState } from "react";
import { Button, Form, Input, Select } from "antd";

export default function FeesAndCharges() {
  const [form] = Form.useForm();
  const [fields, setFields] = useState({
    inspectionFeeType: "Percentage",
    inspectionFee: "50",
    basicArbFeeType: "fixed",
    basicArbFee: "0",
    basicArbDays: "7",
    extArbFeeType: "fixed",
    extArbFee: "10",
    extArbDays: "30",
  });

  const handleChange = (changed: any, all: typeof fields) => setFields(all);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-10">Fees & Charges</h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={fields}
        onValuesChange={handleChange}
        className="w-full"
      >
        {/* Inspection Fee (Seller) */}
        <div className="font-bold text-lg mb-2 mt-6">Inspection Fee (Seller)</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Per Inspection Fee Type:" name="inspectionFeeType" className="mb-0">
            <Select options={[{ value: "Percentage" }, { value: "Fixed" }]} />
          </Form.Item>
          <Form.Item label="Per Inspection Fee:" name="inspectionFee" className="mb-0">
            <Input />
          </Form.Item>
        </div>
        {/* Basic Arbitration Fee */}
        <div className="font-bold text-lg mb-2 mt-6">Basic Arbitration Fee</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Basic Arbitration Fee Type:" name="basicArbFeeType" className="mb-0">
            <Select options={[{ value: "fixed" }]} />
          </Form.Item>
          <Form.Item label="Basic Arbitration Fee:" name="basicArbFee" className="mb-0">
            <Input />
          </Form.Item>
          <div></div>
          <Form.Item label="Basic Arbitration Days:" name="basicArbDays" className="mb-0">
            <Input />
          </Form.Item>
        </div>
        {/* Extended Arbitration Fee */}
        <div className="font-bold text-lg mb-2 mt-6">Extended Arbitration Fee</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Extended Arbitration Fee Type:" name="extArbFeeType" className="mb-0">
            <Select options={[{ value: "fixed" }]} />
          </Form.Item>
          <Form.Item label="Extended Arbitration Fee:" name="extArbFee" className="mb-0">
            <Input />
          </Form.Item>
          <div></div>
          <Form.Item label="Extended Arbitration Days:" name="extArbDays" className="mb-0">
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