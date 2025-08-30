import { useState } from "react";
import { Button, Form, Input, Select } from "antd";

export default function AuctionSetting() {
  const [form] = Form.useForm();
  const [fields, setFields] = useState({
    auctionRunTime: "600",
    bidFee: "10.00",
    proxyBidFeeType: "fixed",
    proxyBidFee: "100",
  });
  const handleChange = (changed: any, all: typeof fields) => setFields(all);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-10">Auction Setting</h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={fields}
        onValuesChange={handleChange}
        className="w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <Form.Item label="Auction Run Time (sec):" name="auctionRunTime" className="mb-0">
            <Input />
          </Form.Item>
          <Form.Item label={<span className="font-bold">Bid Fee</span>} className="mb-0">
            <div>
              <Input name="bidFee" value={fields.bidFee} onChange={e => setFields(f => ({ ...f, bidFee: e.target.value }))} />
              <span className="text-xs text-gray-600 block mt-1">(This will be added to the highest bid and make that amount for proxy won)</span>
            </div>
          </Form.Item>
          <Form.Item label="Proxy Bid Fee Type:" name="proxyBidFeeType" className="mb-0">
            <Select options={[{ value: "fixed" }]} />
          </Form.Item>
          <Form.Item label="Proxy Bid Fee:" name="proxyBidFee" className="mb-0">
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