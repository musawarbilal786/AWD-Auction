import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface UpcomingAuctionCardProps {
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
    routePath?: string;
}

export default function UpcomingAuctionCard({ 
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
    routePath
}: UpcomingAuctionCardProps) {
    const miles = specs.find(s => s.label.toLowerCase().includes('mile'))?.value;
    const router = useRouter();
    
    const handleTitleClick = () => {
        if (routePath && id) {
            router.push(`${routePath}`);
        }
    };
    
    return (
        <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-md p-4 gap-4 w-full max-w-3xl min-h-[160px] relative">
            {/* Left section - Image */}
            <div className="w-full md:w-32 h-32 md:h-24 flex-shrink-0 relative rounded-lg overflow-hidden mx-auto md:mx-0">
                <Image src={image} alt={title} fill className="object-cover" />
            </div>
            
            {/* Right section - Details */}
            <div className="flex-1 flex flex-col gap-1 relative">
                {/* Coming Soon status in top right corner */}
                <div className="absolute top-0 right-0">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-600">
                        Coming Soon
                    </span>
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
                
                <div className="flex-1" />
                
                {/* Price */}
                {price && <div className="text-lg font-bold text-gray-800">$ {price}</div>}
                
                {/* Coming Soon label at bottom - full width */}
                <div className="mt-2">
                    <div className="w-full bg-gray-200 text-gray-600 text-center py-2 px-3 rounded-lg font-semibold">
                        Coming Soon
                    </div>
                </div>
            </div>
        </div>
    );
} 