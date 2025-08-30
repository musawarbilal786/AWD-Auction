import { useState } from "react";
import { Button, Form, Input } from "antd";

export default function Reset() {
  const [form] = Form.useForm();
  const [fields, setFields] = useState({
    password: "",
  });
  const handleChange = (changed: any, all: typeof fields) => setFields(all);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-10">Reset</h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={fields}
        onValuesChange={handleChange}
        className="w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6 items-start">
          <div></div>
          <div>
            <Form.Item label="Password:" name="password" className="mb-4">
              <Input.Password />
            </Form.Item>
            <div className="mb-4 text-gray-700">
              Are you sure you want to reset the whole database? Please note that this action is <span className="font-bold text-red-600">NOT</span> recoverable and require super admin password. It is highly recommended to take a final backup before you proceed to application reset.
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-2 rounded-md" danger>
              I agree to reset my application database
            </Button>
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