"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Card, Form, Input, Button, DatePicker, Select, Checkbox, TimePicker, message } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";

const { Option } = Select;

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function EditInspectorPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const inspectorId = params.id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    dob: null as any,
    cnic: "",
    phone_number: "",
    whatsapp_number: "",
    state: null as any,
    password: "",
    working_hrs: "08:00:00",
    shift_start: null as any,
    shift_end: null as any,
    days: [] as any
  });

  // Fetch inspector data on component mount
  useEffect(() => {
    const fetchInspector = async () => {
      try {
        setInitialLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/inspections/api/v1/inspector/${inspectorId}/`, { headers });
        
        const inspector = res.data;
        const formValues = {
          first_name: inspector.first_name || "",
          last_name: inspector.last_name || "",
          email: inspector.email || "",
          dob: inspector.dob ? dayjs(inspector.dob) : null,
          cnic: inspector.cnic || "",
          phone_number: inspector.phone_number || "",
          whatsapp_number: inspector.whatsapp_number || "",
          state: inspector.state || null,
          password: "", // Don't populate password for security
          working_hrs: inspector.working_hrs || "08:00:00",
          shift_start: inspector.shift_start ? dayjs(inspector.shift_start, "HH:mm:ss") : null,
          shift_end: inspector.shift_end ? dayjs(inspector.shift_end, "HH:mm:ss") : null,
          days: inspector.days || []
        };

        // Update both state and form
        setFormData(formValues);
        form.setFieldsValue(formValues);
      } catch (error) {
        showErrorToast(error, "Inspector data");
        router.push("/inspection/inspectors");
      } finally {
        setInitialLoading(false);
      }
    };

    if (inspectorId) {
      fetchInspector();
    }
  }, [inspectorId, router, form]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone_number) {
        message.error("Please fill in all required fields");
        return;
      }

      // Prepare payload
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        dob: formData.dob ? dayjs(formData.dob).format("YYYY-MM-DD") : undefined,
        cnic: formData.cnic || undefined,
        phone_number: formData.phone_number,
        whatsapp_number: formData.whatsapp_number || undefined,
        state: formData.state || undefined,
        working_hrs: formData.working_hrs,
        shift_start: formData.shift_start ? dayjs(formData.shift_start).format("HH:mm:ss") : undefined,
        shift_end: formData.shift_end ? dayjs(formData.shift_end).format("HH:mm:ss") : undefined,
        days: formData.days.length > 0 ? formData.days : undefined
      };

      // Only include password if it's not empty
      if (formData.password) {
        payload.password = formData.password;
      }

      // Remove undefined values
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== undefined)
      );

      const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      await axios.patch(`${apiUrl}/inspections/api/v1/inspector/${inspectorId}/`, cleanPayload, { headers });
      
      showSuccessToast("Inspector updated successfully!", "Inspector");
      router.push("/inspection/inspectors");
      
    } catch (error) {
      showErrorToast(error, "Inspector update");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading inspector data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Inspection", href: "/inspection" }, { label: "Inspectors", href: "/inspection/inspectors" }, { label: "Edit" }]} />
      <div className="p-6">
        <Card>
          <Form
            form={form}
            layout="vertical"
            className="w-full"
            onFinish={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
              <Form.Item label="First Name" name="first_name" className="mb-0" rules={[{ required: true, message: "First name is required" }]}>
                <Input 
                  value={formData.first_name}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Last Name" name="last_name" className="mb-0" rules={[{ required: true, message: "Last name is required" }]}>
                <Input 
                  value={formData.last_name}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Email" name="email" className="mb-0" rules={[{ required: true, message: "Email is required" }, { type: "email", message: "Please enter a valid email" }]}>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Date Of Birth" name="dob" className="mb-0">
                <DatePicker 
                  className="w-full" 
                  format="MM/DD/YYYY"
                  value={formData.dob}
                  onChange={(date) => handleInputChange("dob", date)}
                />
              </Form.Item>
              <Form.Item label="CNIC" name="cnic" className="mb-0">
                <Input 
                  value={formData.cnic}
                  onChange={(e) => handleInputChange("cnic", e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Phone Number" name="phone_number" className="mb-0" rules={[{ required: true, message: "Phone number is required" }]}>
                <Input 
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Whatsapp Number" name="whatsapp_number" className="mb-0">
                <Input 
                  value={formData.whatsapp_number}
                  onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
                />
              </Form.Item>
              <Form.Item label="State" name="state" className="mb-0">
                <Select 
                  placeholder="Select..."
                  value={formData.state}
                  onChange={(value) => handleInputChange("state", value)}
                >
                  <Option value={1}>Alaska</Option>
                  <Option value={2}>Alabama</Option>
                  <Option value={3}>Arizona</Option>
                  <Option value={4}>Illinois</Option>
                  <Option value={5}>Florida</Option>
                  <Option value={6}>Tennessee</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Password" name="password" className="mb-0">
                <Input.Password 
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Leave empty to keep current password"
                />
                <div className="text-xs text-gray-500">(Leave empty to keep current password)</div>
              </Form.Item>
              <Form.Item label="Working Hours" name="working_hrs" className="mb-0 md:col-span-2">
                <Input 
                  disabled 
                  value={formData.working_hrs}
                  onChange={(e) => handleInputChange("working_hrs", e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Shift Start" name="shift_start" className="mb-0">
                <TimePicker 
                  use12Hours 
                  format="h:mm A" 
                  className="w-full"
                  value={formData.shift_start}
                  onChange={(time) => handleInputChange("shift_start", time)}
                />
              </Form.Item>
              <Form.Item label="Shift End" name="shift_end" className="mb-0">
                <TimePicker 
                  use12Hours 
                  format="h:mm A" 
                  className="w-full"
                  value={formData.shift_end}
                  onChange={(time) => handleInputChange("shift_end", time)}
                />
              </Form.Item>
              <Form.Item label="Days" name="days" className="mb-0 md:col-span-2">
                <Checkbox.Group
                  value={formData.days}
                  onChange={(checkedValues) => handleInputChange("days", checkedValues)}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeek.map(day => (
                      <Checkbox key={day} value={day}>{day}</Checkbox>
                    ))}
                  </div>
                </Checkbox.Group>
              </Form.Item>
            </div>
            <div className="flex justify-end mt-10">
              <Button 
                type="primary" 
                htmlType="submit" 
                className="bg-sky-600 hover:bg-sky-700 rounded-md px-8 py-2"
                loading={loading}
              >
                Update
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
} 