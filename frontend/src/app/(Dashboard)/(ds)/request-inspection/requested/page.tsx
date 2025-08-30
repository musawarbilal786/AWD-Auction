"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/common/DataTable";
import { Tag, Typography, Row, Col, message } from "antd";
import axios from "axios";
import { showErrorToast, showSuccessToast, COMMON_ERROR_MESSAGES, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";
import SendToAuctionModal from '@/components/modals/SendToAuctionModal';
import ConfirmModal from '@/components/modals/ConfirmModal';

const { Title, Text } = Typography;

// Status code to label and color mapping
const STATUS_MAP: Record<number, { label: string; color: string }> = {
    0: { label: 'Pending', color: 'default' },
    1: { label: 'Waiting for speciality approval', color: 'gold' },
    2: { label: 'Inspector Assigned', color: 'blue' },
    3: { label: 'Inspection started', color: 'orange' },
    4: { label: 'Inspection Completed', color: 'green' },
    20: { label: 'In Run List', color: 'pink' },
    21: { label: 'On Auction', color: 'cyan' },
    22: { label: 'Auction Rejected', color: 'red' },
    5: { label: 'Waiting for buyer confirmation', color: 'purple' },
    6: { label: 'Payment pending', color: 'magenta' },
    7: { label: 'Delivered', color: 'lime' },
};

const getStatusTag = (status: any) => {
    // Convert status to a number if possible
    const statusNum = typeof status === 'number' ? status : Number(status);
    const statusObj = STATUS_MAP[statusNum];
    if (!statusObj) {
        return <Tag>N/A</Tag>;
    }
    return <Tag color={statusObj.color}>{statusObj.label}</Tag>;
};

const ExpandedRowRender = ({ record, onOpenAuctionModal, auctionModalOpen, onAuctionModalOk, onAuctionModalCancel, selectedVehicle, confirmModalOpen, onConfirmAuction, onCancelConfirm, sendingAuction }: any) => {
    const location = record.inspection_location;
    const dealershipName = location?.dealership?.dealership_name || 'N/A';
    const street = location?.address || '';
    const zip = location?.zip || '';
    const inspectionAddressTitle = location ? `${location.title}` : 'N/A';
    const statusNum = typeof record.status === 'number' ? record.status : Number(record.status);
    const statusObj = STATUS_MAP[statusNum];

    // Right column content based on status
    let rightContent;
    if (statusNum === 4) { // Inspection Completed
        rightContent = (
            <>
                <Title level={5}>Expected Price</Title>
                <p className="font-bold text-2xl">${Number(record.expected_price).toLocaleString()}</p>
                <p className="mt-2"><strong>Auction Fee:</strong> $10</p>
                <div className="flex gap-2 mt-2">
                    {record.lights && Array.isArray(record.lights) ? (
                        record.lights.map((light: string, index: number) => {
                            const lightColors: Record<string, string> = {
                                'red': 'bg-red-500',
                                'yellow': 'bg-yellow-500',
                                'green': 'bg-green-500',
                                'purple': 'bg-purple-500',
                                'pink': 'bg-pink-500',
                                'blue': 'bg-blue-500',
                                'orange': 'bg-orange-500',
                                'gray': 'bg-gray-500'
                            };
                            
                            const colorClass = lightColors[light.toLowerCase()] || 'bg-gray-500';
                            
                            return (
                                <span 
                                    key={index} 
                                    className={`w-4 h-4 rounded-full ${colorClass} inline-block`}
                                    title={light.charAt(0).toUpperCase() + light.slice(1)}
                                ></span>
                            );
                        })
                    ) : (
                        <span className="text-gray-400 text-sm">No lights available</span>
                    )}
                </div>
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => onOpenAuctionModal(record)}>
                    Send to auction
                </button>
                <SendToAuctionModal
                    open={auctionModalOpen}
                    onOk={onAuctionModalOk}
                    onCancel={onAuctionModalCancel}
                    vehicleData={selectedVehicle}
                />
                <ConfirmModal
                    open={confirmModalOpen}
                    onOk={onConfirmAuction}
                    onCancel={onCancelConfirm}
                    title="Send to Auction"
                    content="Are you sure you want to send this vehicle to auction?"
                    okText={sendingAuction ? "Sending..." : "Yes, auction it"}
                    cancelText="Cancel"
                />
            </>
        );
    } else {
        rightContent = (
            <>
                <Title level={5}>Expected Price</Title>
                <p className="font-bold text-2xl">${Number(record.expected_price).toLocaleString()}</p>
                <p className="mt-2"><strong>Auction Fee:</strong> $10</p>
                <p className="mt-2">{statusObj?.label || record.status || 'N/A'}</p>
            </>
        );
    }

    return (
        <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-12 gap-4 border-t">
            {/* Left Column: VIN Details */}
            <div className="md:col-span-4">
                <Title level={5} className="font-bold">VIN</Title>
                <p><strong>VIN:</strong> {record.vin ? record.vin.slice(-6) : 'N/A'}</p>
                <p><strong>Dealership:</strong> {dealershipName}</p>
                <p className="mt-2"><strong>Inspection Address:</strong></p>
                <p>{inspectionAddressTitle}</p>
                <p>{street}</p>
                <p>ZIP {zip}</p>
            </div>

            {/* Middle empty column with a vertical line */}
            <div className="hidden md:flex md:col-span-1 justify-center">
                <div className="border-l h-full"></div>
            </div>

            {/* Right Column: Price and Status */}
            <div className="md:col-span-7">
                <div className="flex justify-between items-start">
                    {getStatusTag(record.status)}
                    <div className="text-right">
                        {rightContent}
                    </div>
                </div>
            </div>
        </div>
    );
};


const DsRequestInspectionPage = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
    const [auctionModalOpen, setAuctionModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [auctionPayload, setAuctionPayload] = useState<any>(null);
    const [sendingAuction, setSendingAuction] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await axios.get('https://dev.awdauctions.com/inspections/api/v1/requests/', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = response.data?.results || response.data?.data || (Array.isArray(response.data) ? response.data : []);
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch inspection requests:", error);
            showErrorToast(error, "Inspection requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleExpand = (expanded: boolean, record: any) => {
        const keys = expanded ? [record.id] : [];
        setExpandedRowKeys(keys);
    };

    // Handler for opening the auction modal with the selected vehicle
    const handleOpenAuctionModal = (vehicle: any) => {
      setSelectedVehicle(vehicle);
      setAuctionModalOpen(true);
    };

    // Handler for SendToAuctionModal's onOk
    const handleSendToAuction = (payload: any) => {
      // The payload is now directly provided by the SendToAuctionModal
      setAuctionPayload(payload);
      setAuctionModalOpen(false);
      setConfirmModalOpen(true);
    };

    // Handler for confirming auction
    const handleConfirmAuction = async () => {
      setSendingAuction(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access") : null;
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await axios.post(`${apiUrl}/inspections/api/v1/send-to-auctions/`, auctionPayload, { headers });
        showSuccessToast("Vehicle sent to auction!", "Auction");
        setConfirmModalOpen(false);
        
        // Refresh the data to show updated status
        await fetchRequests();
        
        // Clear expanded rows and selected vehicle
        setExpandedRowKeys([]);
        setSelectedVehicle(null);
      } catch (err: any) {
        showErrorToast(err, "Send to auction");
      } finally {
        setSendingAuction(false);
      }
    };

    const columns = [
        {
            title: 'VIN (last six)',
            dataIndex: 'vin',
            key: 'vin',
            render: (vin: string) => vin.slice(-6),
        },
        {
            title: 'Stock No',
            dataIndex: 'stock_no',
            key: 'stock_no',
            render: (text: any) => text || 'N/A',
        },
        {
            title: 'Vehicle',
            dataIndex: 'vehicle',
            key: 'vehicle',
            render: (vehicle: any) => vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'N/A',
        },
        {
            title: 'Expected value',
            dataIndex: 'expected_price',
            key: 'expected_price',
            render: (price: number) => `$${Number(price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (dateStr: string) => {
                if (!dateStr) return 'N/A';
                const date = new Date(dateStr);
                const day = date.getDate();
                const month = date.toLocaleString('default', { month: 'short' });
                const year = date.getFullYear();
                return `${day} ${month} ${year}`;
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: any) => getStatusTag(status),
        },
    ];

    return (
        <div className="p-6">
            <div className="mt-8">
                <Title level={4}>Requested for Inspection</Title>
                <DataTable
                    columns={columns}
                    data={requests.map(req => ({ ...req, key: (req as any).id }))}
                    loading={loading}
                    tableData={{
                        isEnableFilterInput: true,
                    }}
                    expandable={{
                        expandedRowRender: (record: any) => (
                            <ExpandedRowRender
                                record={record}
                                onOpenAuctionModal={handleOpenAuctionModal}
                                auctionModalOpen={auctionModalOpen && selectedVehicle?.id === record.id}
                                onAuctionModalOk={handleSendToAuction}
                                onAuctionModalCancel={() => setAuctionModalOpen(false)}
                                selectedVehicle={selectedVehicle}
                                confirmModalOpen={confirmModalOpen && selectedVehicle?.id === record.id}
                                onConfirmAuction={handleConfirmAuction}
                                onCancelConfirm={() => setConfirmModalOpen(false)}
                                sendingAuction={sendingAuction}
                            />
                        ),
                        expandedRowKeys,
                        onExpand: handleExpand,
                    }}
                />
            </div>
        </div>
    );
};

export default DsRequestInspectionPage; 