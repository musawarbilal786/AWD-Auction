import { Form, Input, Button } from 'antd';

export default function TaxInformation() {
  const [form] = Form.useForm();

  return (
    <div className="w-full">
      <Form
        form={form}
        layout="vertical"
        className="w-full"
      >
        <h2 className="text-2xl font-bold mb-8">Tax Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="NTN / TIN #" name="ntn" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="STRN #" name="strn" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="Provincial Tax #" name="provincialTax" className="mb-0 md:col-span-2">
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