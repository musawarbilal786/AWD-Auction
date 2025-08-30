import { useState } from 'react';
import axios from 'axios';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';

interface UseProxyProps {
  onSuccess?: () => void;
}

export const useProxy = ({ onSuccess }: UseProxyProps = {}) => {
  const [isSettingProxy, setIsSettingProxy] = useState(false);

  const setProxy = async (auctionId: string | number, proxyAmount: number) => {
    if (!auctionId) {
      showErrorToast({ message: "Auction ID is required" }, "Set Proxy");
      return;
    }

    if (!proxyAmount || proxyAmount <= 0) {
      showErrorToast({ message: "Please enter a valid proxy amount" }, "Set Proxy");
      return;
    }

    setIsSettingProxy(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const payload = {
        auction_id: auctionId,
        proxy_amount: proxyAmount,
        bid_amount: proxyAmount,
      };

      await axios.post(`${apiUrl}/auctions/api/v1/create-proxy/`, payload, { headers });
      
      showSuccessToast("Proxy bid set successfully!", "Set Proxy");
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error: any) {
      showErrorToast(error, "Set Proxy");
      return false;
    } finally {
      setIsSettingProxy(false);
    }
  };

  return {
    setProxy,
    isSettingProxy,
  };
}; 