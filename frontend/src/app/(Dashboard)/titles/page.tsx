"use client";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Tag, Dropdown, Button, Menu } from "antd";
import { SettingOutlined, DownOutlined } from "@ant-design/icons";
import DataTable from "@/components/common/DataTable";
import { useRouter } from "next/navigation";

const statusColor = (status: string) => {
  switch (status) {
    case "Title at seller":
      return "default";
    case "Title Delivered":
      return "green";
    case "Title Shipped":
      return "blue";
    case "Title Received":
      return "green";
    default:
      return "default";
  }
};

const columns = [
  { title: "Auction ID", dataIndex: "auctionId", key: "auctionId" },
  {
    title: "Vehicle Details",
    dataIndex: "vehicleDetails",
    key: "vehicleDetails",
    render: (details: any) => (
      <div>
        <div>VIN : {details.vin}</div>
        <div>{details.name}</div>
      </div>
    ),
  },
  {
    title: "Seller",
    dataIndex: "seller",
    key: "seller",
    render: (seller: any) => (
      <div>
        <div className="font-bold">{seller.name}</div>
        <div>{seller.address}</div>
        <div className="font-bold">{seller.phone}</div>
      </div>
    ),
  },
  {
    title: "Buyer",
    dataIndex: "buyer",
    key: "buyer",
    render: (buyer: any) => (
      <div>
        <div className="font-bold">{buyer.name}</div>
        <div>{buyer.address}</div>
        <div className="font-bold">{buyer.phone}</div>
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => <Tag color={statusColor(status)}>{status}</Tag>,
  },
  {
    title: "Action",
    key: "action",
    render: (_: any, record: any) => {
      const router = useRouter();
      const handleView = () => {
        router.push(`/titles/view/${record.auctionId}`);
      };
      const menu = (
        <Menu>
          <Menu.Item key="view" onClick={handleView}>View</Menu.Item>
        </Menu>
      );
      return (
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button>
            <span className="flex items-center gap-1">
              <SettingOutlined /> <DownOutlined />
            </span>
          </Button>
        </Dropdown>
      );
    },
  },
];

const data = [
  {
    key: 1,
    auctionId: "3719587407",
    vehicleDetails: { vin: "1G2MB35B16Y118676", name: "2006 Pontiac Solstice 2D Roadster" },
    seller: { name: "Aladdin Harmon", address: "Aladdin Harmon RUSSELLVILLE, 15046 Hwy 43 Ste C, 35653", phone: "+1 (535) 926-8259" },
    buyer: { name: "Marten Lobo", address: "1520 E Buena Vista Drive #A, Lake Buena Vista", phone: "" },
    status: "Title at seller",
  },
  {
    key: 2,
    auctionId: "3869781292",
    vehicleDetails: { vin: "1FTNE24L98DA19139", name: "2008 Ford E250 Vans Cargo Van" },
    seller: { name: "Aladdin Harmon", address: "Aladdin Harmon RUSSELLVILLE, 15046 Hwy 43 Ste C, 35653", phone: "+1 (535) 926-8259" },
    buyer: { name: "Mike angle", address: "854 Avocado Ave., Newport Beach", phone: "" },
    status: "Title at seller",
  },
  {
    key: 3,
    auctionId: "1438461304",
    vehicleDetails: { vin: "JN8A55VX9W4444882", name: "2009 Nissan Rogue 4D SUV AWD" },
    seller: { name: "Speed Car", address: "South Dakota, 34021 N US-45, Grayslake, IL 60030, 57102", phone: "605-371-7629" },
    buyer: { name: "Gage Carr", address: "Latifah Mercer, Pascale Cervantes", phone: "" },
    status: "Title Delivered",
  },
  {
    key: 4,
    auctionId: "4284465192",
    vehicleDetails: { vin: "1NXBR12E12Z424450", name: "2001 Toyota Corolla 4D Sedan" },
    seller: { name: "Speed Car", address: "South Dakota, 34021 N US-45, Grayslake, IL 60030, 57102", phone: "605-371-7629" },
    buyer: { name: "Gage Carr", address: "Latifah Mercer, Pascale Cervantes", phone: "" },
    status: "Title at seller",
  },
  {
    key: 5,
    auctionId: "204859329",
    vehicleDetails: { vin: "5TBT54147X002142", name: "2007 Toyota Tundra Double Cab 4WD" },
    seller: { name: "Viva Cars", address: "Granville Lane, 4034 Granville Lane, 0000", phone: "+1 (547) 812-3511" },
    buyer: { name: "Speed Car", address: "Speed Car Yard, Oleg Love", phone: "" },
    status: "Title Shipped",
  },
  {
    key: 6,
    auctionId: "78922556",
    vehicleDetails: { vin: "4T1BB46K59U096853", name: "2009 Toyota Camry 4D Sedan" },
    seller: { name: "Speed Car", address: "South Dakota, 34021 N US-45, Grayslake, IL 60030, 57102", phone: "605-371-7629" },
    buyer: { name: "Gage Carr", address: "Latifah Mercer, Pascale Cervantes", phone: "" },
    status: "Title Received",
  },
];

export default function TitlesPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Titles", href: "/auctions/titles" }]} />
      <div className="p-6">
        <DataTable
          columns={columns}
          data={data}
          tableData={{
            selectableRows: true,
            isEnableFilterInput: true,
          }}
        />
      </div>
    </div>
  );
}
