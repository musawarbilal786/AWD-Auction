import { useState } from "react";
import { Button, Form, Input, Switch } from "antd";

export default function Security() {
  const [form] = Form.useForm();
  const [fields, setFields] = useState({
    enableHttps: false,
    cookiesMessage: false,
    disableUserLogins: false,
    disableAdminLogins: true,
    loginAuditing: false,
    blackListedIps: "192.168.11",
  });
  const handleChange = (changed: any, all: typeof fields) => setFields(all);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-10">Security</h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={fields}
        onValuesChange={handleChange}
        className="w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Enable HTTPS:" name="enableHttps" className="mb-0" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="COOKIES Message:" name="cookiesMessage" className="mb-0" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Disable User Logins:" name="disableUserLogins" className="mb-0" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Disable Admin Logins:" name="disableAdminLogins" className="mb-0" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Login Auditing:" name="loginAuditing" className="mb-0" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label={<span>Black Listed IPs <span className="text-red-500">*</span></span>} name="blackListedIps" className="mb-0 md:col-span-2">
            <Input.TextArea autoSize />
            <div className="text-xs text-gray-600 mt-1">(Enter comma separated IPs)</div>
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