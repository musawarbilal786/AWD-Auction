"use client";
import { useEffect } from "react";
import { message } from "antd";

export default function MessageConfig() {
  useEffect(() => {
    message.config({
      top: 60,
      duration: 3,
      maxCount: 3,
    });
  }, []);
  return null;
} 