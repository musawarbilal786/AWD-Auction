import { useState } from "react";
import { Button, Form, Input, Select } from "antd";

export default function APIs() {
  const [form] = Form.useForm();
  const [fields, setFields] = useState({
    countryCode: "+93",
    smsApi: "None",
    smsApiUsername: "eleon4t1@example.com",
    smsApiPassword: "1234",
    mask: "",
    pusherAppId: "",
    pusherAppKey: "",
    pusherAppSecret: "",
    pusherAppCluster: "",
    googleMapApiKey: "",
    googleDriveClientId: "",
    googleDriveClientSecret: "",
    googleAnalyticsCode: "",
    trackLocation: "No",
    shareThisCode: "",
    enableShareThis: "No",
    tawkToCode: "",
    enableTawkTo: "No",
    mailchimpCode: "",
    googleApiKey: "",
    googleApiSecret: "",
  });
  const handleChange = (changed: any, all: typeof fields) => setFields(all);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-10">APIs</h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={fields}
        onValuesChange={handleChange}
        className="w-full"
      >
        {/* SMS APIs */}
        <div className="font-bold text-xl mb-2 mt-8">SMS APIs</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Country Code:" name="countryCode" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="SMS API:" name="smsApi" className="mb-0">
            <Select options={[{ value: "None" }]} />
          </Form.Item>
          <Form.Item label="SMS API Username/Key:" name="smsApiUsername" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="SMS API Password/Secret:" name="smsApiPassword" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Mask:" name="mask" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
        </div>
        {/* Pusher Notification */}
        <div className="font-bold text-xl mb-2 mt-8">Pusher Notification</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Pusher App ID:" name="pusherAppId" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Pusher App Key:" name="pusherAppKey" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Pusher App Secret:" name="pusherAppSecret" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Pusher App Cluster:" name="pusherAppCluster" className="mb-0">
            <Input />
          </Form.Item>
        </div>
        {/* Google Maps */}
        <div className="font-bold text-xl mb-2 mt-8">Google Maps</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Google Map API Key:" name="googleMapApiKey" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
        </div>
        {/* Google Drive */}
        <div className="font-bold text-xl mb-2 mt-8">Google Drive</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Google Drive Client ID:" name="googleDriveClientId" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Client Secret:" name="googleDriveClientSecret" className="mb-0">
            <Input />
          </Form.Item>
        </div>
        {/* Google Analytics */}
        <div className="font-bold text-xl mb-2 mt-8">Google Analytics</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Google Analytics Code:" name="googleAnalyticsCode" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Track Location:" name="trackLocation" className="mb-0">
            <Select options={[{ value: "No" }, { value: "Yes" }]} />
          </Form.Item>
        </div>
        {/* ShareThis */}
        <div className="font-bold text-xl mb-2 mt-8">ShareThis</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="ShareThis Code:" name="shareThisCode" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="Enable ShareThis:" name="enableShareThis" className="mb-0 md:col-span-2">
            <Select options={[{ value: "No" }, { value: "Yes" }]} />
          </Form.Item>
        </div>
        {/* Tawk.to */}
        <div className="font-bold text-xl mb-2 mt-8">Tawk.to</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Tawk.to Code:" name="tawkToCode" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="Enable Tawk.to:" name="enableTawkTo" className="mb-0 md:col-span-2">
            <Select options={[{ value: "No" }, { value: "Yes" }]} />
          </Form.Item>
        </div>
        {/* Mailchimp */}
        <div className="font-bold text-xl mb-2 mt-8">Mailchimp</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Mailchimp Code:" name="mailchimpCode" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
        </div>
        {/* Google API */}
        <div className="font-bold text-xl mb-2 mt-8">Google API</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Google API Key:" name="googleApiKey" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label="Google API Secret:" name="googleApiSecret" className="mb-0">
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