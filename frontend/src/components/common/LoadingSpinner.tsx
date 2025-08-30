"use client";

import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Spin
        indicator={
          <LoadingOutlined
            style={{
              fontSize: 48,
              color: "#1890ff",
            }}
            spin
          />
        }
      />
      <p className="mt-4 text-gray-500 text-lg">Loading...</p>
    </div>
  );
} 