"use client";
import { useState, useEffect } from "react";
import { Form, Steps, Row, Col, Card, Typography, Space, ConfigProvider } from 'antd';
import { FormField } from "@/components/common/FormField";
import axios from "axios";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

const initialFormData = {
  vin: "",
  odometer: "",
  daysOnLot: "",
  description: "",
  inspectionLocation: undefined,
  modelYear1980OrOlder: false,
  trueMileageUnknown: false,
  titleAbsent: false,
  titleBranded: false,
  mechanicalIssues: false,
  frameDamage: false,
  factoryEmissionsModified: false,
  driveabilityIssues: false,
  expectedReservePrice: undefined,
  specialVehicle: 0,
  specialityDescription: "",
  colorTagIndication: "green",
};

const formSteps = [
    {
      title: 'Vehicle Information',
      fields: ['vin', 'odometer', 'daysOnLot', 'description', 'inspectionLocation', 'modelYear1980OrOlder', 'trueMileageUnknown']
    },
    {
      title: 'Title Information',
      fields: ['titleAbsent', 'titleBranded']
    },
    {
      title: 'Vehicle Issues',
      fields: ['mechanicalIssues', 'frameDamage', 'factoryEmissionsModified', 'driveabilityIssues', 'colorTagIndication']
    },
    {
      title: 'Review & Submit'
    },
];

const DsRequestInspectionNew = () => {
    const [current, setCurrent] = useState(0);
    const [formData, setFormData] = useState(initialFormData);
    const [locations, setLocations] = useState<any[]>([]);
    const [locationsLoading, setLocationsLoading] = useState(true);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const token = localStorage.getItem('access');
                const response = await axios.get('https://dev.awdauctions.com/users/api/v1/dealer-locations/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setLocations(response.data);
            } catch (error) {
                console.error('Failed to fetch locations:', error);
                showErrorToast(error, "Inspection locations");
            } finally {
                setLocationsLoading(false);
            }
        };
        fetchLocations();
    }, []);

    const next = () => {
        form.validateFields(formSteps[current].fields).then(() => {
            setCurrent(current + 1);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const prev = () => {
        setCurrent(current - 1);
    };
    
    const onFinish = () => {
        form.validateFields().then(async () => {
            setLoading(true);
            const apiData = {
                vin: formData.vin,
                odometer: Number(formData.odometer),
                days_on_lot: Number(formData.daysOnLot),
                unknown_mileage: formData.trueMileageUnknown ? 1 : 0,
                older_model: formData.modelYear1980OrOlder ? 1 : 0,
                title_absent: formData.titleAbsent ? 1 : 0,
                title_branded: formData.titleBranded ? 1 : 0,
                mechanical_issue: formData.mechanicalIssues ? 1 : 0,
                frame_damage: formData.frameDamage ? 1 : 0,
                factory_emissions_modified: formData.factoryEmissionsModified ? 1 : 0,
                driveability_issue: formData.driveabilityIssues ? 1 : 0,
                expected_price: String(formData.expectedReservePrice),
                is_special: formData.specialVehicle ? 1 : 0,
                manual_delivered: 0,
                via_api: 1,
                inspection_location_id: formData.inspectionLocation,
                has_green: formData.colorTagIndication === "green" ? 1 : 0,
                has_red: formData.colorTagIndication === "red" ? 1 : 0,
            };

            if (formData.specialVehicle && formData.specialityDescription) {
                (apiData as any).speciality_notes = formData.specialityDescription;
            }

            try {
                const token = localStorage.getItem('access');
                await axios.post('https://dev.awdauctions.com/inspections/api/v1/requests/', apiData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                showSuccessToast(COMMON_SUCCESS_MESSAGES.CREATED, "Inspection request");
                router.push('/request-inspection/requested');
            } catch (error) {
                console.error('API Error:', error);
                showErrorToast(error, "Inspection request");
            } finally {
                setLoading(false);
            }
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const ReviewDetailItem = ({ label, value }: { label: string, value: any }) => (
        <div className="flex justify-between items-center py-2 border-b">
            <Text>{label}</Text>
            <Text strong>{value}</Text>
        </div>
    );

    const selectedLocation = locations.find(loc => loc.id === formData.inspectionLocation);

    return (
        <div>
            <Title level={2}>Request an Inspection</Title>
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#0369a1',
                    },
                }}
            >
                <Steps current={current} className="mb-8">
                    {formSteps.map(item => (
                        <Steps.Step key={item.title} title={item.title} />
                    ))}
                </Steps>
            </ConfigProvider>

            <Form 
                form={form} 
                layout="vertical" 
                initialValues={formData}
                onValuesChange={(_, values) => setFormData(values)}
            >
                <div style={{ display: current === 0 ? 'block' : 'none' }}>
                    <Card>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <FormField name="vin" label="VIN" rules={[{ required: true, message: 'VIN is required' }]} placeholder="123423" />
                                <FormField name="odometer" label="ODOMETER" rules={[{ required: true, message: 'Odometer is required' }]} placeholder="3444" />
                                <FormField name="daysOnLot" label="DAYS ON LOT (Optional)" placeholder="33" />
                                 <FormField name="description" type="textarea" label="Seller Disclosure" rules={[{ required: true, message: 'Seller Disclosure is required' }]} placeholder="this is good one" />
                                <FormField
                                    name="inspectionLocation"
                                    type="select"
                                    label="INSPECTION LOCATION"
                                    rules={[{ required: true, message: 'Inspection location is required' }]}
                                    placeholder="Select a location"
                                    loading={locationsLoading}
                                    options={locations.map(loc => ({ label: loc.address, value: loc.id }))}
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                 <FormField name="modelYear1980OrOlder" type="checkbox" label="Model year is 1980 or older" />
                                 <FormField name="trueMileageUnknown" type="checkbox" label="True Mileage Unknown / Not Actual Mileage" />
                            </Col>
                        </Row>
                    </Card>
                </div>

                <div style={{ display: current === 1 ? 'block' : 'none' }}>
                    <Card>
                        <Title level={4}>TITLE</Title>
                        <FormField
                            name="titleAbsent"
                            type="radio"
                            label="TITLE ABSENT"
                            options={[{ label: 'NO', value: false }, { label: 'YES', value: true }]}
                        />
                         <Text type="secondary">The title is not immediately available at the time of auction</Text>

                        <FormField
                            name="titleBranded"
                            type="radio"
                            label="TITLE BRANDED"
                            options={[{ label: 'NO', value: false }, { label: 'YES', value: true }]}
                            className="mt-4"
                        />
                        <Text type="secondary">The vehicle's title is branded (salvage, junk, etc.)</Text>
                    </Card>
                </div>
                
                <div style={{ display: current === 2 ? 'block' : 'none' }}>
                    <Card>
                        <Title level={4}>VEHICLE ISSUES</Title>
                        <FormField
                            name="mechanicalIssues"
                            type="radio"
                            label="Mechanical/Electrical"
                            options={[{ label: 'NO', value: false }, { label: 'YES', value: true }]}
                        />
                        <Text type="secondary">Are there any mechanical or electrical issues?</Text>
                        
                        <FormField
                            name="frameDamage"
                            type="radio"
                            label="Frame Damage"
                            options={[{ label: 'NO', value: false }, { label: 'YES', value: true }]}
                            className="mt-4"
                        />
                        <Text type="secondary">Are there any damages to the frame?</Text>

                        <FormField
                            name="factoryEmissionsModified"
                            type="radio"
                            label="Factory Emissions Modified"
                            options={[{ label: 'NO', value: false }, { label: 'YES', value: true }]}
                            className="mt-4"
                        />
                        <Text type="secondary">Have the factory emissions been modified?</Text>

                        <FormField
                            name="driveabilityIssues"
                            type="radio"
                            label="Driveability Issues"
                            options={[{ label: 'NO', value: false }, { label: 'YES', value: true }]}
                            className="mt-4"
                        />
                        <Text type="secondary">Does the vehicle have issues with starting, running, shifting, etc</Text>
                        <Title level={4}>COLOR TAG</Title>
                        <FormField
                            name="colorTagIndication"
                            type="radio"
                            label="Color Tag Indication"
                            options={[{ label: 'Green', value: 'green' }, { label: 'Red', value: 'red' }]}
                            rules={[{ required: true, message: 'Color tag indication is required' }]}
                        />
                        <Text type="secondary">Green indicates good condition, Red indicates issues</Text>
                    </Card>
                </div>


                <div style={{ display: current === 3 ? 'block' : 'none' }}>
                    <Title level={4} className="mb-6">Review & Submit</Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <Card title="VIN" size="small">
                                <ReviewDetailItem label="VIN" value={formData.vin} />
                                <ReviewDetailItem label="Dealership" value="testing dealer" />
                                <ReviewDetailItem label="Inspection Address" value={selectedLocation ? selectedLocation.address : ''} />
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card title="VEHICLE DETAILS" size="small">
                                <ReviewDetailItem label="Odometer" value={formData.odometer} />
                                <ReviewDetailItem label="Actual Mileage" value={formData.trueMileageUnknown ? 'NO' : 'YES'} />
                                <ReviewDetailItem label="Title Absent" value={formData.titleAbsent ? 'YES' : 'NO'} />
                                <ReviewDetailItem label="Title Brand" value={formData.titleBranded ? 'YES' : 'NO'} />
                                <div className="py-2 border-b">
                                    <Text>Description</Text>
                                    <p className="font-semibold">{formData.description}</p>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card title="VEHICLE CONDITION" size="small">
                                <ReviewDetailItem label="Mechanical/Electrical" value={formData.mechanicalIssues ? 'YES' : 'NO'} />
                                <ReviewDetailItem label="Frame Damage" value={formData.frameDamage ? 'YES' : 'NO'} />
                                <ReviewDetailItem label="Factory Emissions" value={formData.factoryEmissionsModified ? 'YES' : 'NO'} />
                                <ReviewDetailItem label="Driveability" value={formData.driveabilityIssues ? 'YES' : 'NO'} />
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card title="EXPECTED RESERVE PRICE" size="small">
                                <Row align="middle" justify="space-between">
                                    <Col>
                                        <Space align="center">
                                            <Text style={{fontSize: '24px', fontWeight: 'bold'}}>$</Text>
                                            <FormField 
                                                name="expectedReservePrice" 
                                                placeholder="700" 
                                                rules={[{ required: true, message: 'Expected reserve price is required' }]}
                                            />
                                        </Space>
                                    </Col>
                                    <Col>
                                        <FormField name="specialVehicle" type="checkbox" label="Special Vehicle?" />
                                    </Col>
                                </Row>
                                {formData.specialVehicle && (
                                    <div className="mt-4">
                                        <FormField
                                            name="specialityDescription"
                                            type="textarea"
                                            label="Describe the speciality *"
                                            rules={[{ required: true, message: 'Speciality description is required' }]}
                                        />
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </div>
                
                <div className="mt-2">
                    <Space>
                        {current > 0 && (
                            <button type="button" onClick={prev} className="bg-sky-700 text-white px-4 py-2 rounded-md">
                                Previous Step
                            </button>
                        )}
                        {current < formSteps.length - 1 && (
                            <button type="button" onClick={next} className="bg-sky-700 text-white px-4 py-2 rounded-md">
                                Next Step
                            </button>
                        )}
                        {current === formSteps.length - 1 && (
                            <button type="button" onClick={onFinish} className="bg-sky-700 text-white px-4 py-2 rounded-md" disabled={loading}>
                                {loading ? 'Submitting...' : 'Confirm Request'}
                            </button>
                        )}
                    </Space>
                </div>
            </Form>
        </div>
    );
};

export default DsRequestInspectionNew; 