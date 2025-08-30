import { useState } from 'react';
import axios from 'axios';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';

interface UseBuyNowProps {
  onSuccess?: () => void;
}

export const useBuyNow = ({ onSuccess }: UseBuyNowProps = {}) => {
  const [isBuying, setIsBuying] = useState(false);

  const buyNow = async (auctionId: string | number) => {
    if (!auctionId) {
      showErrorToast({ message: "Auction ID is required" }, "Buy Now");
      return;
    }

    setIsBuying(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const payload = {
        auction_id: auctionId,
      };

      await axios.post(`${apiUrl}/auctions/api/v1/buy-now/`, payload, { headers });
      
      showSuccessToast("Vehicle purchased successfully!", "Buy Now");
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error: any) {
      showErrorToast(error, "Buy Now");
      return false;
    } finally {
      setIsBuying(false);
    }
  };

  return {
    buyNow,
    isBuying,
  };
}; 