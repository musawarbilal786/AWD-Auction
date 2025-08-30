import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Modal, Button, Input, message } from "antd";
import axios from "axios";
import { showErrorToast, showSuccessToast, COMMON_SUCCESS_MESSAGES } from "@/utils/errorHandler";
import { useBuyNow } from "@/hooks/useBuyNow";
import { useProxy } from "@/hooks/useProxy";
import BuyNowModal from "@/components/modals/BuyNowModal";
import SetProxyModal from "@/components/modals/SetProxyModal";

interface AuctionListCardProps {
    image: string;
    title: string;
    vin?: string;
    colors?: { color: string; label: string }[];
    specs?: { label: string; value: string }[];
    status: string;
    labelText?: string;
    labelColor?: string;
    price?: string | number;
    id?: string | number;
    auctionId?: string | number;
    routePath?: string;
    hasBids?: boolean;
    currentBid?: number | null;
    onRefresh?: () => void;
}

const statusColors: Record<string, string> = {
    "Coming Soon": "bg-gray-200 text-gray-500",
    "In Negotiation": "bg-yellow-100 text-yellow-700",
    "Live": "bg-green-100 text-green-700",
    "Ended": "bg-red-100 text-red-700",
};

export default function AuctionListCard({ 
    image, 
    title, 
    vin, 
    colors = [], 
    specs = [], 
    status, 
    labelText, 
    labelColor, 
    price, 
    id, 
    auctionId,
    routePath, 
    hasBids = false,
    currentBid = null,
    onRefresh
}: AuctionListCardProps) {
    const miles = specs.find(s => s.label.toLowerCase().includes('mile'))?.value;
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
    const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
    const [bidAmount, setBidAmount] = useState("0.00");
    const [placingBid, setPlacingBid] = useState(false);
    
    // Use the custom hook for buy now functionality
    const { buyNow, isBuying } = useBuyNow({
        onSuccess: () => {
            setIsBuyNowModalOpen(false);
            if (onRefresh) {
                setTimeout(() => {
                    onRefresh();
                }, 500);
            }
        }
    });

    // Use the custom hook for proxy functionality
    const { setProxy, isSettingProxy } = useProxy({
        onSuccess: () => {
            setIsProxyModalOpen(false);
            if (onRefresh) {
                setTimeout(() => {
                    onRefresh();
                }, 500);
            }
        }
    });
    
    const handleTitleClick = () => {
        if (routePath && id) {
            router.push(`${routePath}`);
        }
    };

    const handleBuyClick = () => {
        setIsModalOpen(true);
    };

    const handleBuyNowClick = () => {
        setIsBuyNowModalOpen(true);
    };

    const handleProxyClick = () => {
        setIsProxyModalOpen(true);
    };

    const handleBuyNowConfirm = async () => {
        const auctionIdToUse = auctionId || id;
        if (auctionIdToUse) {
            await buyNow(auctionIdToUse);
        }
    };

    const handleProxyConfirm = async (amount: number) => {
        const auctionIdToUse = auctionId || id;
        if (auctionIdToUse) {
            await setProxy(auctionIdToUse, amount);
        }
    };

    const handlePlaceBid = async () => {
        // Use auctionId if available, otherwise fall back to id
        const auctionIdToUse = auctionId || id;
        
        if (!auctionIdToUse) {
            showErrorToast({ message: "Auction ID is required" }, "Bid placement");
            return;
        }

        const bidValue = parseFloat(bidAmount);
        if (isNaN(bidValue) || bidValue <= 0) {
            showErrorToast({ message: "Please enter a valid bid amount" }, "Bid placement");
            return;
        }

        setPlacingBid(true);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            const payload = {
                auction_id: auctionIdToUse,
                bid: bidValue
            };

            await axios.post(`${apiUrl}/auctions/api/v1/create-bid/`, payload, { headers });
            
            showSuccessToast(COMMON_SUCCESS_MESSAGES.CREATED, "Bid");
            setIsModalOpen(false);
            setBidAmount("0.00");
            
            // Refresh the auction list to show updated bid information
            if (onRefresh) {
                console.log("Refreshing auction list after successful bid...");
                setTimeout(() => {
                    onRefresh();
                }, 500);
            }
        } catch (error: any) {
            console.error('Bid placement error:', error);
            showErrorToast(error, "Bid placement");
        } finally {
            setPlacingBid(false);
        }
    };

    const incrementBid = () => {
        const currentAmount = parseFloat(bidAmount) || 0;
        setBidAmount((currentAmount + 100).toFixed(2));
    };
    
    return (
        <>
            <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-md p-4 gap-4 w-full max-w-3xl min-h-[160px] relative">
                {/* Left section - Image */}
                <div className="w-full md:w-32 h-32 md:h-24 flex-shrink-0 relative rounded-lg overflow-hidden mx-auto md:mx-0">
                    <Image src={image} alt={title} fill className="object-cover" />
                </div>
                
                {/* Right section - Details */}
                <div className="flex-1 flex flex-col gap-1 relative">
                    {/* Timer in top right corner of the right section */}
                    <div className="absolute top-0 right-0 flex items-center gap-1 text-sm font-semibold text-sky-600">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                            <polyline points="12,6 12,12 16,14" strokeWidth="2"/>
                        </svg>
                        10:00
                    </div>
                    
                    {/* Title */}
                    <div 
                        className={`font-bold text-lg truncate ${routePath && id ? 'text-blue-600 cursor-pointer hover:text-blue-800' : 'text-gray-900'}`}
                        onClick={handleTitleClick}
                    >
                        {title}
                    </div>
                    
                    {/* VIN/ID */}
                    {vin && <div className="text-xs text-gray-500 font-mono mb-1">{vin}</div>}
                    
                    {/* Colors */}
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
                    
                    {/* Specs */}
                    {specs.length > 0 && (
                        <div className="flex flex-row flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-2">
                            {specs.map((s, i) => (
                                <span key={i}>{s.value} {s.label}</span>
                            ))}
                        </div>
                    )}
                    
                    {/* Mileage below timer */}
                    {miles && <div className="text-xs text-gray-400 font-semibold mt-1">{miles} Miles</div>}
                    
                    <div className="flex-1" />
                    
                    {/* Price and Status */}
                    <div className="flex flex-row items-center gap-4 mt-2 w-full">
                        {price && <div className="text-lg font-bold text-gray-800">$ {price}</div>}
                        {/* {status && (
                            <div className={`rounded-lg px-4 py-1 text-sm font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-500'}`}>{labelText || status}</div>
                        )} */}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex flex-row gap-2 mt-2">
                        <Button 
                            type="primary" 
                            className="bg-sky-600 hover:bg-sky-700"
                            onClick={handleBuyClick}
                        >
                            {hasBids ? "Bid Now" : "Place the opening Bid"}
                        </Button>
                        <Button 
                            className="border-gray-300 text-gray-600 hover:bg-gray-50"
                            onClick={handleProxyClick}
                        >
                            Set Proxy
                        </Button>
                        <Button 
                            className="border-gray-300 text-gray-600 hover:bg-gray-50"
                            onClick={handleBuyNowClick}
                        >
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
                style={{ zIndex: 1000 }}
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
                        {currentBid ? (
                            <div className="text-lg font-semibold text-gray-900 mb-4">
                                Current Bid: $ {currentBid.toLocaleString()}
                            </div>
                        ) : (
                            <div className="text-lg font-semibold text-gray-900 mb-4">
                                Bid Start From: $ 0.00
                            </div>
                        )}
                        
                        {/* Bid Amount Input */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1">
                                <Input
                                    size="large"
                                    value={`$ ${bidAmount}`}
                                    onChange={(e) => setBidAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                                    className="text-2xl font-bold text-sky-600 text-center"
                                    style={{ fontSize: '24px', fontWeight: 'bold', color: '#0284c7' }}
                                    placeholder={currentBid ? `Enter amount higher than $${currentBid}` : "Enter bid amount"}
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
                        loading={placingBid}
                        disabled={placingBid}
                    >
                        Place Now
                    </Button>
                </div>
            </Modal>

            {/* Buy Now Modal - Using the shared component */}
            <BuyNowModal
                open={isBuyNowModalOpen}
                onClose={() => setIsBuyNowModalOpen(false)}
                onConfirm={handleBuyNowConfirm}
                title={title}
                price={price}
                vin={vin}
                loading={isBuying}
            />

            {/* Set Proxy Modal - Using the shared component */}
            <SetProxyModal
                open={isProxyModalOpen}
                onClose={() => setIsProxyModalOpen(false)}
                onConfirm={handleProxyConfirm}
                title={title}
                price={price}
                vin={vin}
                currentBid={currentBid}
                loading={isSettingProxy}
            />
        </>
    );
}