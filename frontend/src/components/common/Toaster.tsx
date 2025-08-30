import { notification } from "antd";

export function showToast({ type = "info", message, description }: { type?: "success" | "error" | "info" | "warning"; message: string; description?: string }) {
  notification[type]({
    message,
    description,
    placement: "topRight",
  });
}

// No provider needed for AntD notification, but export a dummy component for consistency
export default function Toaster() { return null; } 