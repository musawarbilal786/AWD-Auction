import { Form, Input, Button } from 'antd';

export default function CompanyDetails() {
  const [form] = Form.useForm();

  return (
    <div className="w-full">
      <Form
        form={form}
        layout="vertical"
        className="w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Business Name" name="businessName" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Short Name" name="shortName" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Address Line 1" name="address1" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Address Line 2" name="address2" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Town / City" name="city" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Country / State" name="state" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Postal Code / Zip" name="postalCode" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Country" name="country" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Telephone" name="telephone" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Fax" name="fax" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="SMS No" name="smsNo" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Primary Email" name="primaryEmail" className="mb-0">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Secondary Email" name="secondaryEmail" className="mb-0">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Web" name="web" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Google Map (Embed iframe)" name="googleMap" className="mb-0 md:col-span-2">
            <Input.TextArea rows={4} />
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