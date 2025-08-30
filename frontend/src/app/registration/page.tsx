"use client"

import { useState, useEffect } from "react"
import { Form, Button, message, Radio, Checkbox, Modal } from "antd"
import type { UploadFile } from "antd/es/upload/interface"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { FormField } from "@/components/common/FormField"
import { ProgressIndicator } from "@/components/common/ProgressIndicator"
import StripeCustomerSetup from "@/components/stripe/StripeCustomerSetup"

import { CheckCircleFilled, CreditCardOutlined } from "@ant-design/icons"
import Image from "next/image"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler"

interface RegistrationFormData {
  // Step 1
  has_dealer: string
  // Step 2
  first_name: string
  last_name: string
  email: string
  phone_number: string
  mobile_no: string
  contact_preference: string

  // Step 3
  dealership_name: string
  street_name: string
  tax_id: string
  website: string
  city_name: string
  state_id: string
  zipcode: string
  dealer_license: UploadFile[]
  business_license: UploadFile[]
  retail_certificate: UploadFile[]
  dealership_type: string
  dealership_interest: string
  no_of_locations: string
  cars_in_stock: string
  referral_code: string
  text_update: boolean
  heard_about: string
  agree_terms: boolean
}

const steps = [
  { id: 1, title: "Sign Up to Getting Started", subtitle: "Do you have a valid dealer license?" },
  { id: 2, title: "Personal Information", subtitle: "Introduce yourself for better acquaintance." },
  { id: 3, title: "Dealership Information", subtitle: "Please tell us about your dealership." },
  { id: 4, title: "Dealership Information", subtitle: "What is the address on your dealership license?" },
  { id: 5, title: "Preference setting", subtitle: "What is the address on your dealership license?" },
  { id: 6, title: "Verification", subtitle: "Complete your registration." },
]

const contactOptions = [
  { label: "Phone", value: "phone" },
  { label: "Email", value: "email" },
  { label: "Text Message", value: "text" },
]

const dealershipTypeOptions = [
  { label: "Franchise", value: "1" },
  { label: "Independent", value: "2" },
  { label: "Wholesale", value: "3" },
]

const interestOptions = [
  { label: "Sell a vehicle", value: "1" },
  { label: "Buy a vehicle", value: "2" },
  { label: "Both buy and sell", value: "3" },
]

export default function Registration() {
  const [currentStep, setCurrentStep] = useState(1)
  const [form] = Form.useForm()
  const has_dealer = Form.useWatch("has_dealer", form)
  const router = useRouter()

  // Animation state
  const [animating, setAnimating] = useState(false)
  const [animationClass, setAnimationClass] = useState("in")
  const [pendingStep, setPendingStep] = useState<number | null>(null)

  // 1. Add initial state for all form fields in snake_case
  const initialFormData: RegistrationFormData = {
    has_dealer: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    mobile_no: "",
    contact_preference: "",
    dealership_name: "",
    street_name: "",
    tax_id: "",
    website: "",
    city_name: "",
    dealer_license: [],
    business_license: [],
    retail_certificate: [],
    state_id: "",
    zipcode: "",
    dealership_type: "",
    dealership_interest: "",
    no_of_locations: "",
    cars_in_stock: "",
    referral_code: "",
    text_update: false,
    heard_about: "",
    agree_terms: false,
  };
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);

  // 2. Controlled change handlers
  const handleChange = (name: keyof RegistrationFormData, value: RegistrationFormData[keyof RegistrationFormData]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      // @ts-ignore
      handleChange(name as keyof RegistrationFormData, (e.target as HTMLInputElement).checked);
    } else {
      handleChange(name as keyof RegistrationFormData, value);
    }
  };
  const handleUploadChange = (name: keyof RegistrationFormData, fileList: UploadFile[]) => {
    handleChange(name, fileList);
  };

  // Animation handler
  const animateStep = (dir: number) => {
    setAnimating(true)
    setAnimationClass(dir > 0 ? "out-right" : "out-left")
    setTimeout(() => {
      setPendingStep(currentStep + dir)
      setAnimationClass(dir > 0 ? "in-left" : "in-right")
      setTimeout(() => {
        setCurrentStep((prev) => prev + dir)
        setAnimationClass("in")
        setAnimating(false)
        setPendingStep(null)
      }, 20)
    }, 500)
  }

  const [showErrors, setShowErrors] = useState(false);

  const nextStep = async () => {
    setShowErrors(true);
    try {
      await form.validateFields();
      if (currentStep < steps.length && !animating) {
        animateStep(1);
        setShowErrors(false); // Reset for next step
      }
    } catch (error) {
      showErrorToast({ message: COMMON_ERROR_MESSAGES.VALIDATION_ERROR });
    }
  };

  const prevStep = () => {
    if (currentStep > 1 && !animating) {
      animateStep(-1)
    }
  }

  // 6. Update onFinish to build FormData and map fields
  const [submitting, setSubmitting] = useState(false);
  const [stripeModalVisible, setStripeModalVisible] = useState(false);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);

  const onFinish = async () => {
    const apiData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (["dealer_license", "business_license", "retail_certificate"].includes(key)) {
        const files = value as UploadFile[];
        if (files && files.length > 0 && files[0].originFileObj) {
          apiData.append(key, files[0].originFileObj as File);
        }
      } else if (typeof value === "boolean") {
        apiData.append(key, value ? "1" : "0");
      } else if (typeof value === "string" || typeof value === "number") {
        apiData.append(key, String(value));
      } else if (value instanceof Blob) {
        apiData.append(key, value);
      } else if (value && typeof value === "object") {
        apiData.append(key, JSON.stringify(value));
      } else {
        apiData.append(key, "");
      }
    });

    // Log FormData contents for debugging
    for (let pair of apiData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    setSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      console.log(apiData);
      await axios.post(`${apiUrl}/users/api/v1/register/`, apiData);
      showSuccessToast(COMMON_SUCCESS_MESSAGES.REGISTERED);
      // Move to verification step after successful registration
      animateStep(1);
    } catch (error: any) {
      showErrorToast(error, "Registration");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterStep5 = async () => {
    setShowErrors(true);
    try {
      await form.validateFields();
      await onFinish(); // Call registration API
    } catch (error) {
      showErrorToast({ message: COMMON_ERROR_MESSAGES.VALIDATION_ERROR });
    }
  };

  const redirectToLogin = () => {
    router.push("/login");
  };

  const handleStripeSuccess = (customerId: string) => {
    setStripeCustomerId(customerId);
    setStripeModalVisible(false);
    showSuccessToast('Stripe setup completed successfully!');
  };

  const handleStripeCancel = () => {
    setStripeModalVisible(false);
  };

  const openStripeSetup = () => {
    setStripeModalVisible(true);
  };

  // Animation classes for Tailwind
  const getStepClass = (phase: string) => {
    switch (phase) {
      case "in":
        return "opacity-100 rotate-y-0 z-10"
      case "out-left":
        return "opacity-0 -rotate-y-90 z-0"
      case "out-right":
        return "opacity-0 rotate-y-90 z-0"
      case "in-left":
        return "opacity-0 rotate-y-90 z-0"
      case "in-right":
        return "opacity-0 -rotate-y-90 z-0"
      default:
        return ""
    }
  }

  // 3. DealerRadioCards: make fully controlled using formData and setFormData
  const DealerRadioCards = () => {
    const value = formData.has_dealer;
    const setValue = (val: string) => handleChange("has_dealer", val);
    const options = [
      { label: "Yes, I have a valid dealer license", value: "yes" },
      { label: "No, I don't have a valid dealer license", value: "no" },
    ];
    return (
      <Form.Item
        required
        validateStatus={showErrors && !value ? "error" : ""}
        help={showErrors && !value ? "Please select an option" : undefined}
        className="w-full mb-0 font-poppins"
      >
        <div className="flex flex-col gap-4 w-full items-center">
          {options.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setValue(opt.value)}
                className={`w-full max-w-2xl flex items-center justify-between px-6 py-4 rounded-lg border transition-all duration-200
                  ${selected ? "border-blue-500 bg-blue-50 shadow" : "border-gray-200 bg-white"}
                  focus:outline-none`}
              >
                <span className={`text-lg transition-all duration-200 ${selected ? "font-[500] text-black" : "font-light text-gray-400"}`}>{opt.label}</span>
                <span className="ml-4 flex items-center justify-center">
                  <span
                    className={`relative w-7 h-7 flex items-center justify-center rounded-full border-2 transition-all duration-200
                      ${selected ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"}
                    `}
                  >
                    <span
                      className={`absolute left-1/2 top-1/2 w-4 h-4 rounded-full bg-white transition-all duration-200
                        ${selected ? "scale-0" : "-translate-x-1/2 -translate-y-1/2 scale-100"}
                      `}
                      style={{ transform: "translate(-50%, -50%)" }}
                    />
                    <CheckCircleFilled
                      className={`text-white text-xl transition-all duration-200 ${selected ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
                      style={{ transition: "all 0.2s" }}
                    />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Form.Item>
    );
  };

  // 4. Controlled FormField props generator
  const getFieldProps = (name: keyof RegistrationFormData, extra = {}) => ({
    name,
    value: formData[name],
    onChange: (e: any) => {
      if (e && e.target) {
        // For Input, e.target.value
        handleChange(name, e.target.value);
      } else {
        // For Select, e is the value
        handleChange(name, e);
      }
    },
    ...extra,
  });

  // 5. Controlled Upload handler for FormField
  const getUploadProps = (name: keyof RegistrationFormData) => ({
    fileList: formData[name] as UploadFile[],
    onChange: ({ fileList }: { fileList: UploadFile[] }) => handleUploadChange(name, fileList),
    beforeUpload: () => false,
  });

  // State options fetched from API
  const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [statesError, setStatesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStates = async () => {
      setStatesLoading(true);
      setStatesError(null);
      try {
        const res = await fetch("https://dev.awdauctions.com/utils/api/v1/states");
        const data = await res.json();
        // Assuming the response is an array of state objects with id and name
        const options = Array.isArray(data)
          ? data.map((state: any) => ({ label: state.name, value: String(state.id) }))
          : [];
        setStateOptions(options);
      } catch (err: any) {
        setStatesError("Failed to load states");
      } finally {
        setStatesLoading(false);
      }
    };
    fetchStates();
  }, []);

  // Step content generator
  const renderStepContent = (step: number) => (
    <Form
      form={form}
      layout="vertical"
      className="max-w-3xl mx-auto w-full font-poppins"
    >
      {/* Step Title & Subtitle */}
      <div className="mb-8 text-center flex flex-col items-center">
        <Image src="/awd-logo.png"  alt="AWD Auctions" width={200} height={200} />
        <h2 className="text-[22px] font-bold text-sky-600 mb-1">{steps[step-1].title}</h2>
        <p className="text-gray-500 text-base">{steps[step-1].subtitle}</p>
      </div>
      {step === 1 && (
        <div className="flex flex-col items-center w-full">
          <DealerRadioCards />
        </div>
      )}
      {step === 2 && (
        <div className="w-full">
          <div className="flex flex-row gap-2">
            <FormField {...getFieldProps("first_name")} className="w-4/4 md:w-2/4" label="First Name" rules={[{ required: true, message: "Please enter your first name" }]} required={true} />
            <FormField {...getFieldProps("last_name")} className="w-4/4 md:w-2/4" label="Last Name" rules={[{ required: true, message: "Please enter your last name" }]} required={true} />
          </div>
          <FormField {...getFieldProps("email")} type="email" label="Email" rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" }
          ]} required={true} />
          <div className="flex flex-col sm:flex-row gap-2">
            <FormField {...getFieldProps("contact_preference")} className="w-6/6 md:w-2/6" type="select" label="Contact Preference" rules={[{ required: true, message: "Please select your contact preference" }]} options={contactOptions} required={true} />
            <FormField {...getFieldProps("phone_number")} className="w-6/6 md:w-2/6" label="Phone Number" rules={[{ required: true, message: "Please enter your phone number" }]} required={true} />
            <FormField {...getFieldProps("mobile_no")} className="w-6/6 md:w-2/6" label="Cell Number" rules={[{required: true, message: "Please enter your Cell number"}]} required={true}/>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="w-full">
          <div className="flex flex-col md:flex-row md:gap-2">
            <FormField {...getFieldProps("dealership_name")} className="w-4/4 md:w-2/4" label="Dealership Name" rules={[{ required: true, message: "Please enter dealership name" }]} required={true} />
            <FormField {...getFieldProps("street_name")} className="w-4/4 md:w-2/4" label="Dealership Street Name" rules={[{ required: true, message: "Please enter street name" }]} required={true} />
          </div>
          <div className="flex flex-col md:flex-row md:gap-2">
            <FormField {...getFieldProps("tax_id")} className="w-6/6 md:w-2/6" label="Tax ID" rules={[{ required: true, message: "Please enter tax ID" }]} required={true} />
            <FormField {...getFieldProps("website")} className="w-6/6 md:w-2/6" label="Website" required={true} />
            <FormField {...getFieldProps("city_name")} className="w-6/6 md:w-2/6" label="City" rules={[{ required: true, message: "Please enter city" }]} required={true} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <FormField {...getFieldProps("dealer_license")} {...getUploadProps("dealer_license")} className="w-full" type="upload" label="Dealer license" rules={[{ required: true, message: "Please upload dealer license" }]} required={true} />
            <FormField {...getFieldProps("business_license")} {...getUploadProps("business_license")} className="w-full" type="upload" label="Business license" rules={[{ required: true, message: "Please upload business license" }]} required={true} />
            <FormField {...getFieldProps("retail_certificate")} {...getUploadProps("retail_certificate")} className="w-full" type="upload" label="Certificate of retail (CRT-61)" rules={[{ required: true, message: "Please upload certificate of retail" }]} required={true} />
          </div>
          <div className="flex flex-col md:flex-row md:gap-2">
            <FormField {...getFieldProps("zipcode")} className="w-4/4 md:w-2/4" label="Zipcode" rules={[{ required: true, message: "Please enter zipcode" }]} required={true} />
            <FormField {...getFieldProps("state_id")} className="w-4/4 md:w-2/4" type="select" label="State" rules={[{ required: true, message: "Please select state" }]} options={stateOptions} required={true} />
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="grid grid-cols-1 w-full">
          <FormField {...getFieldProps("dealership_type")} type="select" label="Dealership Type" rules={[{ required: true, message: "Please select your dealership type" }]} options={dealershipTypeOptions} required={true} />
          <FormField {...getFieldProps("dealership_interest")} type="select" label="What is your interest" rules={[{ required: true, message: "Please select your interest" }]} options={interestOptions} required={true} />
          <FormField {...getFieldProps("no_of_locations")} label="No of Locations" rules={[{ required: true, message: "Please enter number of locations" }]} required={true} />
          <FormField {...getFieldProps("cars_in_stock")} label="How many cars do you stock?" rules={[{ required: true, message: "Please enter number of cars in stock" }]} required={true} />
        </div>
      )}
      {step === 5 && (
        <div className="w-full">
          <FormField
            {...getFieldProps("referral_code")}
            placeholder="Enter referral code"
            className="mb-4"
          />
          <FormField
            {...getFieldProps("heard_about")}
            type="select"
            placeholder="How did you hear about AWD?"
            options={[
              { label: "Google Search", value: "google" },
              { label: "Friend/Colleague", value: "friend" },
              { label: "Social Media", value: "social" },
              { label: "Other", value: "other" },
            ]}
            className="mb-4"
          />
          <Form.Item className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                name="text_update"
                checked={formData.text_update}
                onChange={handleInputChange}
              />
              Text me updates <a href="#" className="text-blue-600 underline ml-1">(Text message Policy)</a>
            </label>
          </Form.Item>
          <Form.Item
            name="agree_terms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error("You must agree to Terms and Conditions")),
              },
            ]}
          >
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                name="agree_terms"
                checked={formData.agree_terms}
                onChange={handleInputChange}
              />
              I agree to <Link href="/terms" target="_blank" className="text-blue-600 underline ml-1">Terms and Conditions</Link> *
            </label>
          </Form.Item>
        </div>
      )}
      {step === 6 && (
        <div className="flex flex-col items-center justify-center min-h-[260px] w-full space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-sky-600">Registration Complete!</h3>
            <p className="text-gray-600 mb-4">
              Congratulations! You have been registered successfully.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-gray-800 font-medium">
                <span className="font-bold">Account Status:</span> Your account status is pending.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Thank you for registering with AWD Auctions. We&apos;ll review your information and get back to you within 24 hours.
              </p>
            </div>
            
            {/* Stripe Status */}
            {stripeCustomerId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-medium">
                  <span className="font-bold">✅ Stripe Connected:</span> Your payment method has been successfully set up.
                </p>
                <p className="text-sm text-green-600 mt-2">
                  You can now participate in auctions and make payments.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Form>
  )

  return (
    <AuthLayout maxWidth="4xl">
      <div className="flex flex-col h-full items-center font-poppins">
        <div className="max-w-3xl w-full mx-auto flex flex-col flex-1">
          {/* Content Area */}
          <div className="relative flex-1 flex flex-col items-center justify-center w-full">
            {/* Step Content with Animation */}
            {/* Current step */}
            <div
              className={`w-full left-0 top-0 transition-all duration-500 ease-in-out transform ${getStepClass(animationClass)}`}
              style={{ backfaceVisibility: "hidden" }}
            >
              {renderStepContent(currentStep)}
            </div>
            {/* Pending step (for animation) */}
            {animating && pendingStep && (
              <div
                className={`absolute w-full left-0 top-0 transition-all duration-500 ease-in-out transform ${getStepClass(animationClass)}`}
                style={{ backfaceVisibility: "hidden" }}
              >
                {renderStepContent(pendingStep)}
              </div>
            )}
          </div>
          {/* Navigation Buttons - always at the bottom */}
          <div className="flex justify-center space-x-4 w-full">
            {currentStep > 1 && currentStep < 6 && (
              <button
                onClick={prevStep}
                className="px-12 py-2 h-11 border border-sky-600 text-sky-600 hover:bg-sky-50 rounded-lg font-[600]"
                disabled={animating}
              >
                Back
              </button>
            )}
            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className={`px-12 py-2 h-11 bg-sky-600 hover:bg-sky-700 rounded-lg text-white ${currentStep === 1 && !formData.has_dealer ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={(currentStep === 1 && !formData.has_dealer) || animating}
              >
                Continue
              </button>
            ) : currentStep === 5 ? (
              <Button
                type="primary"
                htmlType="submit"
                className="px-12 py-2 h-11 bg-sky-600 hover:bg-sky-700 rounded-lg"
                onClick={handleRegisterStep5}
                disabled={animating || submitting}
              >
                Register
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                {!stripeCustomerId && (
                  <Button
                    type="primary"
                    className="px-8 py-2 h-11 bg-green-600 hover:bg-green-700 rounded-lg"
                    onClick={openStripeSetup}
                    disabled={animating}
                    icon={<CreditCardOutlined />}
                  >
                    Connect to Stripe
                  </Button>
                )}
                <Button
                  type="primary"
                  className="px-8 py-2 h-11 bg-sky-600 hover:bg-sky-700 rounded-lg"
                  onClick={redirectToLogin}
                  disabled={animating}
                >
                  Redirect to Login
                </Button>
              </div>
            )}
          </div>
          {/* Progress Indicator - always at the bottom */}
          <div className="mt-6 w-full">
            <ProgressIndicator steps={steps} currentStep={currentStep} />
          </div>
        </div>
      </div>

      {/* Stripe Customer Setup Modal */}
      <Modal
        title="Connect to Stripe"
        open={stripeModalVisible}
        onCancel={handleStripeCancel}
        footer={null}
        width={800}
        centered
        destroyOnClose
      >
        <StripeCustomerSetup
          userData={{
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone_number: formData.phone_number,
            dealership_name: formData.dealership_name,
            street_name: formData.street_name,
            city_name: formData.city_name,
            state_id: formData.state_id,
            zipcode: formData.zipcode,
            tax_id: formData.tax_id,
          }}
          onSuccess={handleStripeSuccess}
          onCancel={handleStripeCancel}
        />
      </Modal>
    </AuthLayout>
  )
} 