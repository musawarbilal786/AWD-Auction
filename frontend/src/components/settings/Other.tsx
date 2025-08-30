import { useState } from "react";
import { Button, Form, Select, Switch } from "antd";

export default function Other() {
  const [form] = Form.useForm();
  const [fields, setFields] = useState({
    itemsPerPageBack: "20",
    itemsPerPageFront: "15",
    timeZone: "(GMT+05:00) Karachi",
    dateTimeFormat: "DD-MM-YYYY h:mm a (01-06-2025 6:53 pm)",
    defaultCurrency: "Dollar ($)",
    showIslamicDate: true,
    enableBlackBoxApi: false,
  });
  const handleChange = (changed: any, all: typeof fields) => setFields(all);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-10">Other Settings</h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={fields}
        onValuesChange={handleChange}
        className="w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="No. of Items Per Page: (Back End)" name="itemsPerPageBack" className="mb-0">
            <Select options={[{ value: "20" }, { value: "30" }, { value: "40" }]} />
          </Form.Item>
          <Form.Item label="No. of Items Per Page: (Front End)" name="itemsPerPageFront" className="mb-0">
            <Select options={[{ value: "15" }, { value: "25" }, { value: "35" }]} />
          </Form.Item>
          <Form.Item label="Time Zone:" name="timeZone" className="mb-0">
            <Select options={[{ value: "(GMT+05:00) Karachi" }, { value: "(GMT+00:00) UTC" }]} />
          </Form.Item>
          <Form.Item label="Date/Time Format" name="dateTimeFormat" className="mb-0">
            <Select options={[{ value: "DD-MM-YYYY h:mm a (01-06-2025 6:53 pm)" }]} />
          </Form.Item>
          <Form.Item label="Default Currency:" name="defaultCurrency" className="mb-0">
            <Select options={[{ value: "Dollar ($)" }, { value: "Euro (€)" }]} />
          </Form.Item>
          <Form.Item label="Show Islamic Date:" name="showIslamicDate" className="mb-0" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Enable BlackBox API" name="enableBlackBoxApi" className="mb-0" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div className="md:col-span-2 flex items-center mt-2">
            <Button className="bg-blue-700 text-white font-semibold px-8 py-2 rounded hover:bg-blue-800">Clear Logs</Button>
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