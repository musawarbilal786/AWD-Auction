import { Form, Input, Select, Radio, Upload, Button, Checkbox, message } from "antd"
import { PaperClipOutlined } from "@ant-design/icons"
import type { FormItemProps } from "antd"
import type { UploadFile } from "antd/es/upload/interface"
import { ReactNode, useState } from "react"

interface FormFieldProps extends Omit<FormItemProps, "children"> {
  type?: "text" | "password" | "email" | "select" | "radio" | "upload" | "checkbox" | "textarea" | "link" | "button-group"
  options?: { label: string; value: any }[]
  uploadProps?: {
    maxCount?: number
    listType?: "text" | "picture" | "picture-card"
    maxSize?: number // in KB
  }
  prefix?: ReactNode
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  inputClassName?: string
  labelClassName?: string
}

export function FormField({
  type = "text",
  options = [],
  uploadProps = { maxCount: 1, listType: "picture" },
  prefix,
  placeholder,
  disabled,
  loading,
  inputClassName = "",
  labelClassName = "",
  label,
  required,
  value,
  onChange,
  fileList,
  name,
  ...props
}: FormFieldProps & { value?: any; onChange?: any; fileList?: any; name?: string }) {
  const [fileSizeError, setFileSizeError] = useState<string>("");
  
  // File size validation function
  const validateFileSize = (file: File): boolean => {
    if (!uploadProps.maxSize) {
      // No size limit set, allow any size
      setFileSizeError("");
      return true;
    }
    
    const maxSizeInBytes = uploadProps.maxSize * 1024; // Convert KB to bytes
    if (file.size > maxSizeInBytes) {
      setFileSizeError(`File size must be less than ${uploadProps.maxSize} KB`);
      return false;
    }
    
    setFileSizeError("");
    return true;
  };
  
  // Handle file change with validation
  const handleFileChange = (info: any) => {
    if (type === "upload" && uploadProps.maxSize) {
      const { fileList } = info;
      const lastFile = fileList[fileList.length - 1];
      
      if (lastFile && lastFile.originFileObj) {
        const isValidSize = validateFileSize(lastFile.originFileObj);
        if (!isValidSize) {
          // Remove the invalid file from the list
          const validFileList = fileList.slice(0, -1);
          const modifiedInfo = { ...info, fileList: validFileList };
          onChange && onChange(modifiedInfo);
          return;
        }
      }
    }
    
    // Clear any previous errors and proceed with normal onChange
    setFileSizeError("");
    onChange && onChange(info);
  };
  const renderField = () => {
    switch (type) {
      case "password":
        return <Input.Password name={name} size="large" prefix={prefix} placeholder={placeholder} disabled={disabled} className={inputClassName} value={value} onChange={onChange} />
      case "email":
        return <Input name={name} type="email" size="large" prefix={prefix} placeholder={placeholder} disabled={disabled} className={inputClassName} value={value} onChange={onChange} />
      case "textarea":
        return <Input.TextArea name={name} size="large" placeholder={placeholder} disabled={disabled} className={inputClassName} value={value} onChange={onChange} />
      case "select":
        return (
          <Select
            size="large"
            placeholder={placeholder}
            disabled={disabled}
            loading={loading}
            className={inputClassName}
            value={value}
            onChange={onChange}
          >
            {options.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        )
      case "radio":
        return (
          <Radio.Group
            name={name}
            className={inputClassName}
            disabled={disabled}
            value={value}
            onChange={onChange}
          >
            {options.map((option) => (
              <Radio.Button
                key={option.value}
                value={option.value}
              >
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        )
      case "checkbox":
        return (
          <Checkbox name={name} disabled={disabled} className={inputClassName} checked={value} onChange={onChange}>
            {label}
          </Checkbox>
        )
      case "upload":
        return (
          <div>
            <Upload
              listType={uploadProps.listType}
              maxCount={uploadProps.maxCount}
              beforeUpload={() => false}
              disabled={disabled}
              fileList={fileList}
              onChange={handleFileChange}
              className="w-full"
            >
              <div className="w-full">
                <button type="button" className="bg-gray-100 text-sky-700 rounded-md border-none py-1 px-12">
                  <PaperClipOutlined />
                  Attachment
                </button>
              </div>
            </Upload>
            {fileSizeError && (
              <div className="text-red-500 text-sm mt-1">
                {fileSizeError}
              </div>
            )}
            {/* {uploadProps.maxSize && (
              <div className="text-gray-500 text-xs mt-1">
                Maximum file size: {uploadProps.maxSize} KB
              </div>
            )} */}
          </div>
        )
      case "link":
        return (
          <div>
            <label className="block text-sky-700 font-medium mb-1" htmlFor={name}>{label}</label>
            <input
              type="file"
              name={name}
              id={name}
              className="block w-full border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-sky-700"
              onChange={onChange}
              disabled={disabled}
            />
          </div>
        );
      case "button-group":
        return (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`px-4 py-1 rounded-md border ${value === option.value ? 'bg-sky-700 text-white' : 'bg-gray-100 text-sky-700'} transition-colors`}
                onClick={() => onChange({ target: { value: option.value, name } })}
                disabled={disabled}
              >
                {option.label}
              </button>
            ))}
          </div>
        );
      default:
        return <Input name={name} size="large" prefix={prefix} placeholder={placeholder} disabled={disabled} className={inputClassName} value={value} onChange={onChange} />
    }
  }

  return (
    <Form.Item
      name={name}
      {...props}
      label={type === 'checkbox' ? undefined : label ? (
        <span className={labelClassName}>
          {label}
          {/* {required && <span className="text-red-500 ml-1">*</span>} */}
        </span>
      ) : undefined}
      required={required}
      valuePropName={type === 'checkbox' ? 'checked' : 'value'}
    >
      {renderField()}
    </Form.Item>
  )
} 