import { Form, Input, Button } from 'antd';

export default function EmailAddresses() {
  const [form] = Form.useForm();

  return (
    <div className="w-full">
      <Form
        form={form}
        layout="vertical"
        className="w-full"
      >
        <h2 className="text-2xl font-bold mb-8">Email Addresses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Sales Email" name="salesEmail" className="mb-0 md:col-span-2">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Inquiry Email" name="inquiryEmail" className="mb-0 md:col-span-2">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Support Email" name="supportEmail" className="mb-0 md:col-span-2">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Super Admin Email" name="superAdminEmail" className="mb-0 md:col-span-2">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Webmaster Email" name="webmasterEmail" className="mb-0 md:col-span-2">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Backup Primary Email" name="backupPrimaryEmail" className="mb-0 md:col-span-2">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Backup Secondary Email" name="backupSecondaryEmail" className="mb-0 md:col-span-2">
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