import { Form, Input, Button, Upload } from 'antd';
import { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';

export default function SiteLogos() {
  const [form] = Form.useForm();
  const [brandLogo, setBrandLogo] = useState<any>(null);
  const [reportLogo, setReportLogo] = useState<any>(null);
  const [favicon, setFavicon] = useState<any>(null);

  const handlePreview = (file: any, setter: any) => {
    const reader = new FileReader();
    reader.onload = e => setter(e.target?.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <Form
        form={form}
        layout="vertical"
        className="w-full"
      >
        <h2 className="text-2xl font-bold mb-8">Site Logos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mb-6 items-center">
          <Form.Item label="Brand Logo" name="brandLogo" className="mb-0">
            <Upload
              beforeUpload={file => {
                handlePreview(file, setBrandLogo);
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Choose file</Button>
            </Upload>
            {brandLogo && <img src={brandLogo} alt="Brand Logo" className="mt-2 max-h-16" />}
          </Form.Item>
          <div />
          <Form.Item label="Report Logo" name="reportLogo" className="mb-0">
            <Upload
              beforeUpload={file => {
                handlePreview(file, setReportLogo);
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Choose file</Button>
            </Upload>
            {reportLogo && <img src={reportLogo} alt="Report Logo" className="mt-2 max-h-16" />}
          </Form.Item>
          <div />
          <Form.Item label="Favicon" name="favicon" className="mb-0">
            <Upload
              beforeUpload={file => {
                handlePreview(file, setFavicon);
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Choose file</Button>
            </Upload>
            {favicon && <img src={favicon} alt="Favicon" className="mt-2 max-h-10" />}
          </Form.Item>
          <div />
          <Form.Item label="Slogan" name="slogan" className="mb-0 md:col-span-2">
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