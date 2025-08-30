import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Modal, Button, Input } from "antd";
import axios from "axios";
import { showErrorToast, showSuccessToast, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";

interface AuctionCardProps {
    image: string;
    title: string;
    vin?: string;
    colors?: { color: string; label: string }[];
    specs?: { label: string; value: string }[];
    status: string;
    onBuyNow?: () => void;
    labelText?: string;
    labelColor?: string;
    price?: string | number;
    id?: string | number;
    routePath?: string;
    hasBids?: boolean; // New prop to determine if there are existing bids
}

const statusColors: Record<string, string> = {
    "Coming Soon": "bg-gray-200 text-gray-500",
    "In Negotiation": "bg-yellow-100 text-yellow-700",
    "Live": "bg-green-100 text-green-700",
    "Ended": "bg-red-100 text-red-700",
};

export default function AuctionCard({ image, title, vin, colors = [], specs = [], status, onBuyNow, labelText, labelColor, price, id, routePath, hasBids = false }: AuctionCardProps) {
    const miles = specs.find(s => s.label.toLowerCase().includes('mile'))?.value;
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bidAmount, setBidAmount] = useState("0.00");
    const [placingBid, setPlacingBid] = useState(false);
    
    const handleTitleClick = () => {
        if (routePath && id) {
            router.push(`${routePath}`);
        }
    };

    const handleBuyClick = () => {
        setIsModalOpen(true);
    };

    const handlePlaceBid = () => {
        // Handle bid placement logic here
        console.log("Placing bid:", bidAmount);
        setIsModalOpen(false);
        setBidAmount("0.00");
    };

    const incrementBid = () => {
        const currentAmount = parseFloat(bidAmount) || 0;
        setBidAmount((currentAmount + 100).toFixed(2));
    };
    
    return (
        <>
            <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-md p-4 gap-4 w-full max-w-3xl min-h-[160px] relative">
                {/* Timer in top right corner */}
                <div className="absolute top-4 right-4 flex items-center gap-1 text-sm font-semibold text-gray-600">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                        <polyline points="12,6 12,12 16,14" strokeWidth="2"/>
                    </svg>
                    10:00
                </div>

                <div className="w-full md:w-32 h-32 md:h-24 flex-shrink-0 relative rounded-lg overflow-hidden mx-auto md:mx-0">
                    <Image src={image} alt={title} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                    <div className="flex flex-row justify-between items-start">
                        <div 
                            className={`font-bold text-lg truncate ${routePath && id ? 'text-blue-600 cursor-pointer hover:text-blue-800' : 'text-gray-900'}`}
                            onClick={handleTitleClick}
                        >
                            {title}
                        </div>
                        <div className="flex flex-col items-end min-w-[90px]">
                            {labelText ? (
                                <span className="text-xs font-bold px-2 py-1 rounded" style={{ color: labelColor || '#ef4444' }}>{labelText}</span>
                            ) : (
                                <span className="h-5 block" />
                            )}
                            {miles && <span className="text-xs text-gray-400 font-semibold mt-1">{miles} Miles</span>}
                        </div>
                    </div>
                    {vin && <div className="text-xs text-gray-500 font-mono mb-1">{vin}</div>}
                    {colors.length > 0 && (
                        <div className="flex flex-row gap-3 items-center mb-1">
                            {colors.map((c, i) => (
                                <span key={i} className="flex items-center gap-1 text-xs">
                                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: c.color }}></span>
                                    {c.label}
                                </span>
                            ))}
                        </div>
                    )}
                    {specs.length > 0 && (
                        <div className="flex flex-row flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-2">
                            {specs.filter(s => !s.label.toLowerCase().includes('mile')).map((s, i) => (
                                <span key={i}>{s.value} {s.label}</span>
                            ))}
                        </div>
                    )}
                    <div className="flex-1" />
                    <div className="flex flex-row items-center gap-4 mt-2 w-full">
                        {price && <div className="text-lg font-bold text-gray-800">$ {price}</div>}
                        {status && (
                            <div className={`rounded-lg px-4 py-1 text-sm font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-500'}`}>{labelText || status}</div>
                        )}
                    </div>
                    {/* Action buttons */}
                    <div className="flex flex-row gap-2 mt-2">
                        <Button 
                            type="primary" 
                            className="bg-sky-600 hover:bg-sky-700"
                            onClick={handleBuyClick}
                        >
                            {hasBids ? "Bid Now" : "Place starting bid"}
                        </Button>
                        <Button className="border-sky-600 text-sky-600 hover:bg-sky-50">
                            Set Proxy
                        </Button>
                        <Button className="border-sky-600 text-sky-600 hover:bg-sky-50">
                            Buy Now
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bid Modal */}
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={500}
                centered
                closeIcon={
                    <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">×</span>
                    </div>
                }
            >
                <div className="text-center">
                    {/* Gavel Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center">
                            <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                            </svg>
                        </div>
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Place The Bid Now</h2>
                    
                    {/* Description */}
                    <p className="text-gray-600 mb-6">Seize the opportunity and place your bid now to unlock exceptional value.</p>
                    
                    {/* Bid Information */}
                    <div className="mb-6">
                        <div className="text-lg font-semibold text-gray-900 mb-4">Bid Start From: $ 0.00</div>
                        
                        {/* Bid Amount Input */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1">
                                <Input
                                    size="large"
                                    value={`$ ${bidAmount}`}
                                    onChange={(e) => setBidAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                                    className="text-2xl font-bold text-sky-600 text-center"
                                    style={{ fontSize: '24px', fontWeight: 'bold', color: '#0284c7' }}
                                />
                            </div>
                            <Button 
                                type="primary" 
                                className="bg-sky-600 hover:bg-sky-700"
                                onClick={incrementBid}
                            >
                                + $100
                            </Button>
                        </div>
                    </div>
                    
                    {/* Place Bid Button */}
                    <Button 
                        type="primary" 
                        size="large"
                        className="bg-sky-600 hover:bg-sky-700 w-full h-12 text-lg font-semibold"
                        onClick={handlePlaceBid}
                    >
                        Place Now
                    </Button>
                </div>
            </Modal>
        </>
    );
} 