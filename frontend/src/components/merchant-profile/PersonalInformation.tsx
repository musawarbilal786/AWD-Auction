import { Form, Input, Button } from 'antd';

export default function PersonalInformation() {
  const [form] = Form.useForm();

  return (
    <div className="w-full">
      <Form
        form={form}
        layout="vertical"
        className="w-full"
      >
        <h2 className="text-2xl font-bold mb-8">Personal Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="First Name" name="firstName" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Last Name" name="lastName" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Mobile No" name="mobileNo" className="mb-0 md:col-span-2">
            <Input addonBefore={'+92'} />
          </Form.Item>
          <Form.Item label="Personal Email" name="personalEmail" className="mb-0 md:col-span-2">
            <Input type="email" />
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