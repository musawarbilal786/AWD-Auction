import Link from "next/link";
import { EditOutlined, DeleteOutlined, FileSearchOutlined, DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";

export const statusColors: Record<string, string> = {
  "Active": "bg-green-100 text-green-700 border-green-300",
  "Inactive": "bg-gray-100 text-gray-700 border-gray-300",
};

export type HandleDeleteType = (userId: number) => void;

export function getUserColumns(handleDelete: HandleDeleteType) {
  return [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
      render: (key: number, _: any, idx: number) => idx + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <Link href={`/app/users/${record.key}`}>
          <span className="text-blue-700 font-semibold cursor-pointer hover:underline">{name}</span>
        </Link>
      ),
    },
    {
      title: "Username",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <span className="text-blue-700 cursor-pointer hover:underline">{email}</span>,
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const menuItems = [
          {
            key: "edit",
            icon: <EditOutlined />, 
            label: (
              <Link href={`/app/users/${record.key}`}>
                <span className="cursor-pointer hover:underline">Edit</span>
              </Link>
            ),
          },
          {
            key: "delete",
            icon: <DeleteOutlined />, 
            label: (
              <span
                className="cursor-pointer hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(record.key);
                }}
              >
                Delete
              </span>
            ),
          },
          {
            key: "logs",
            icon: <FileSearchOutlined />, 
            label: (
              <span>Logs</span>
            ),
          },
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <span className="inline-flex items-center gap-1 px-3 py-1 border rounded cursor-pointer hover:bg-gray-50">
              <span className="text-blue-700"><DownOutlined /></span>
            </span>
          </Dropdown>
        );
      },
    },
  ];
} 