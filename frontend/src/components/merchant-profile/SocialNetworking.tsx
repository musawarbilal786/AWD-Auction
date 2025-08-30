import { Form, Input, Button } from 'antd';

export default function SocialNetworking() {
  const [form] = Form.useForm();

  return (
    <div className="w-full">
      <Form
        form={form}
        layout="vertical"
        className="w-full"
      >
        <h2 className="text-2xl font-bold mb-8">Social Networking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Skype" name="skype" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="Facebook" name="facebook" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="Twitter" name="twitter" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="Tumblr" name="tumblr" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="Pinterest" name="pinterest" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="YouTube" name="youtube" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="Google Plus" name="googleplus" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="Linkedin" name="linkedin" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="Instagram" name="instagram" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="IMO" name="imo" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="WhatsApp" name="whatsapp" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="WeChat" name="wechat" className="mb-0 md:col-span-2">
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