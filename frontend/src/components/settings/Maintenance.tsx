import { useState } from "react";
import { Button, Form, Input, Select } from "antd";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function Maintenance() {
  const [form] = Form.useForm();
  const [fields, setFields] = useState({
    websiteStatus: "LIVE",
    siteDownMessage: "SORRYY! We are DOWN for scheduled maintenance.Do not worry. Be right back!",
    siteDownUrl: "",
    excludeIp: "127.0.0.1",
  });
  const handleChange = (changed: any, all: typeof fields) => setFields(all);

  // Static info for now
  const yourIp = "182.182.154.51";
  const lastOnline = "";
  const lastOffline = "";
  const totalTables = 81;
  const latestBackup = "";

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-10">Maintenance</h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={fields}
        onValuesChange={handleChange}
        className="w-full"
      >
        {/* Maintenance Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-10">
          <Form.Item label="Website Status:" name="websiteStatus" className="mb-0">
            <Select options={[{ value: "LIVE" }, { value: "DOWN" }]} />
          </Form.Item>
          <div></div>
          <Form.Item label="Site Down Message:" name="siteDownMessage" className="mb-0 md:col-span-2">
            <ReactQuill theme="snow" value={fields.siteDownMessage} onChange={val => setFields(f => ({ ...f, siteDownMessage: val }))} />
          </Form.Item>
          <Form.Item label="Site Down URL:" name="siteDownUrl" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <Form.Item label="Exclude IP (Comma sep. IPs):" name="excludeIp" className="mb-0 md:col-span-2">
            <Input />
          </Form.Item>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2">
            <div className="flex flex-col">
              <span className="font-semibold">Your IP:</span>
              <span>{yourIp}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Last online:</span>
              <span>{lastOnline}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Last offline:</span>
              <span>{lastOffline}</span>
            </div>
          </div>
        </div>
        {/* Database Section */}
        <div className="font-bold text-3xl mb-4 mt-12">Database</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-10">
          <div className="flex flex-col">
            <span className="font-semibold">Total Number of Tables:</span>
            <span>{totalTables}</span>
          </div>
          <div></div>
          <div className="flex flex-col">
            <span className="font-semibold">Database Backup:</span>
            <Button className="bg-blue-700 text-white font-semibold px-8 py-2 rounded hover:bg-blue-800 w-fit mt-2">Create</Button>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Latest Backup:</span>
            <Button className="bg-blue-700 text-white font-semibold px-8 py-2 rounded hover:bg-blue-800 w-fit mt-2">Download</Button>
          </div>
        </div>
        {/* Other Section */}
        <div className="font-bold text-3xl mb-4 mt-12">Other</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-10">
          <div className="flex flex-col">
            <span className="font-semibold">Cache:</span>
            <Button className="bg-blue-700 text-white font-semibold px-8 py-2 rounded hover:bg-blue-800 w-fit mt-2">Clear Cache <span className='inline-block align-middle text-base text-sky-100'>?</span></Button>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">PHP Info:</span>
            <Button className="bg-blue-700 text-white font-semibold px-8 py-2 rounded hover:bg-blue-800 w-fit mt-2">View</Button>
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