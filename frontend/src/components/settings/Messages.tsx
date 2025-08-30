import { useState } from "react";
import { Button, Form } from "antd";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function Messages() {
  const [form] = Form.useForm();
  const [fields, setFields] = useState({
    referToFriend: "Refer To Friend112",
    passwordChanged: "Password changed:1",
    profileUpdated: "Profile updated:1",
    forgotPassword: "Forgot password:1",
    registrationCompleted: "Registration completed:132323",
    checkoutTerms: "Checkout Terms:1",
  });
  const handleChange = (changed: any, all: typeof fields) => setFields(all);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-10">Messages</h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={fields}
        onValuesChange={handleChange}
        className="w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mb-6">
          <Form.Item label="Refer To Friend:" name="referToFriend" className="mb-0">
            <ReactQuill theme="snow" value={fields.referToFriend} onChange={val => setFields(f => ({ ...f, referToFriend: val }))} />
          </Form.Item>
          <Form.Item label="Password changed:" name="passwordChanged" className="mb-0">
            <ReactQuill theme="snow" value={fields.passwordChanged} onChange={val => setFields(f => ({ ...f, passwordChanged: val }))} />
          </Form.Item>
          <Form.Item label="Profile updated:" name="profileUpdated" className="mb-0">
            <ReactQuill theme="snow" value={fields.profileUpdated} onChange={val => setFields(f => ({ ...f, profileUpdated: val }))} />
          </Form.Item>
          <Form.Item label="Forgot password:" name="forgotPassword" className="mb-0">
            <ReactQuill theme="snow" value={fields.forgotPassword} onChange={val => setFields(f => ({ ...f, forgotPassword: val }))} />
          </Form.Item>
          <Form.Item label="Registration completed:" name="registrationCompleted" className="mb-0">
            <ReactQuill theme="snow" value={fields.registrationCompleted} onChange={val => setFields(f => ({ ...f, registrationCompleted: val }))} />
          </Form.Item>
          <Form.Item label="Checkout Terms:" name="checkoutTerms" className="mb-0">
            <ReactQuill theme="snow" value={fields.checkoutTerms} onChange={val => setFields(f => ({ ...f, checkoutTerms: val }))} />
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