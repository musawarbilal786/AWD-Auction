import { useState } from "react";
import { Button, Form, Input, Select } from "antd";

export default function EmailSettings() {
  const [form] = Form.useForm();
  const [fields, setFields] = useState({
    emailProtocol: "SMTP",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    emailAddress: "",
  });
  const handleChange = (changed: any, all: typeof fields) => setFields(all);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-10">Email SMTP <span className="inline-block align-middle text-base text-sky-700">?</span></h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={fields}
        onValuesChange={handleChange}
        className="w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Email Protocol:" name="emailProtocol" className="mb-0">
            <Select options={[{ value: "SMTP" }]} />
          </Form.Item>
          <div></div>
          <Form.Item label="SMTP Host:" name="smtpHost" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="SMTP Port:" name="smtpPort" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="SMTP User:" name="smtpUser" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="SMTP Password:" name="smtpPassword" className="mb-0 md:col-span-2">
            <Input.Password />
          </Form.Item>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6 items-end">
          <Form.Item label={<span>Email Address: <span className='inline-block align-middle text-base text-sky-700'>?</span></span>} name="emailAddress" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <div className="md:col-span-2 flex justify-end">
            <Button className="border border-sky-700 text-sky-700 hover:bg-sky-50">Send Test Email</Button>
          </div>
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