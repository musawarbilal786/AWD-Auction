import { Form, Input, Button } from 'antd';

export default function ProfileInformation() {
  const [form] = Form.useForm();

  return (
    <div className="w-full">
      <Form
        form={form}
        layout="vertical"
        className="w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="First Name" name="firstName" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Last Name" name="lastName" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" className="mb-0">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Phone Number" name="phone" className="mb-0">
            <Input />
          </Form.Item>
        </div>
        <div className="flex justify-end mt-10">
          <Button type="primary" htmlType="submit" className="bg-sky-600 hover:bg-sky-700 rounded-md px-8 py-2">
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  );
} 