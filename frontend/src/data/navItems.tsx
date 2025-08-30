import {
  HomeOutlined,
  ToolOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  CarOutlined,
  CreditCardOutlined,
  ProfileOutlined,
  UserOutlined,
  IdcardOutlined,
  CheckOutlined,
  HeartOutlined,
  FieldTimeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  FileSearchOutlined,
  CloseCircleOutlined,
  UnorderedListOutlined,
  InfoCircleOutlined,
  TagsOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";
import React from "react";

export interface NavItem {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  children?: NavItem[];
  key?: string;
}

export interface NavItemsByRole {
  [role: string]: NavItem[];
}

export const navItemsByRole: NavItemsByRole = {
  superadmin: [
    { label: "Dashboard", icon: <HomeOutlined />, href: "/" },
    { 
      label: "App", 
      icon: <ToolOutlined />, 
      
      children: [
        { key: 'users', label: "Users", icon: <UserOutlined />, href: "/app/users" },
        { key: 'roles', label: "Roles", icon: <UserOutlined />, href: "/app/roles" },
        { key: 'settings', label: "Settings", icon: <SafetyCertificateOutlined />, href: "/app/settings" },
        { key: 'merchant', label: "Merchant Profile", icon: <UserOutlined />, href: "/app/merchant" },
        { key: 'countries', label: "Countries", icon: <ProfileOutlined />, href: "/app/countries" },
        { key: 'states', label: "States", icon: <ProfileOutlined />, href: "/app/states" },
        { key: 'buyer-fee', label: "Buyer Fee", icon: <ProfileOutlined />, href: "/app/buyer-fee" },
        { key: 'seller-fees', label: "Seller Fees Types", icon: <ProfileOutlined />, href: "/app/seller-fees" },
        {
          key: 'forms', label: "Forms", icon: <ProfileOutlined />, children: [
            { key: 'contact-form', label: "Contact Form", href: "/app/forms/contact-form" },
          ]
        },
        {
          key: 'career', label: "Career", icon: <ToolOutlined />, children: [
            { key: 'career', label: "Career", href: "/app/career/career" },
            { key: 'Applicents', label: "Applicents", href: "/app/career/applicents" }
          ]
        },
        {
          key: 'pages', label: "Pages", icon: <FileTextOutlined />, children: [
            { key: 'media', label: "Media", icon: <ProfileOutlined />, href: "/app/pages/media" },
            { key: 'add-vehicle', label: "Add Vehicle", icon: <CarOutlined />, href: "/app/pages/add-vehicle" },
            { key: 'covid-19', label: "Covid 19", icon: <SafetyCertificateOutlined />, href: "/app/pages/covid-19" },
            { key: 'resource-center', label: "Resource Center", icon: <AppstoreOutlined />, href: "/app/pages/resource-center" },
            { key: 'trust-safety', label: "Trust Safety", icon: <SafetyCertificateOutlined />, href: "/app/pages/trust-safety" },
            { key: 'about', label: "About", icon: <InfoCircleOutlined />, href: "/app/pages/about" },
            { key: 'against-discrimination', label: "Against Discrimination", icon: <StopOutlined />, href: "/app/pages/against-discrimination" },
            { key: 'how-it-work', label: "How It Work", icon: <FileTextOutlined />, href: "/app/pages/how-it-work" }
          ]
        }
      ]
    },
    { label: "Dealerships", icon: <ShopOutlined />, 
      children: [
        {
          key: 'Dealers', label: "Dealers", icon: <ShopOutlined />,
          children: [
            { key: 'Pending', label: "Pending", icon: <ClockCircleOutlined />, href: "/dealerships/dealers/pending" },
            { key: 'Approved', label: "Approved", icon: <CheckCircleOutlined />, href: "/dealerships/dealers/approved" },
            { key: 'Suspended', label: "Suspended", icon: <StopOutlined />, href: "/dealerships/dealers/suspended" }
          ]
        },
        { key: 'Credits', label: "Credits", icon: <CreditCardOutlined />, href: "/dealerships/credits" }
      ]
    },
    {
      label: "Inspection", icon: <SafetyCertificateOutlined />, 
      children: [
        { key: "pending", label: "Pending", icon: <ClockCircleOutlined />, href: "/inspection/pending" },
        { key: "requests", label: "Requests", icon: <FileSearchOutlined />, href: "/inspection/requests" },
        {
          key: "completed", label: "Completed", icon: <CheckCircleOutlined />, children: [
            { key: "approved", label: "Approved", icon: <CheckOutlined />, href: "/inspection/completed/approved" },
            { key: "denied", label: "Denied", icon: <CloseCircleOutlined />, href: "/inspection/completed/denied" }
          ]
        },
        { key: "inspectors", label: "Inspectors", icon: <UserOutlined />, href: "/inspection/inspectors" },
        { key: "speciality-approval", label: "Speciality Approval", icon: <CheckOutlined />, href: "/inspection/speciality-approval" },
      ]
    },
    {
      label: "Auctions", icon: <AppstoreOutlined />, 
      children: [
        { key: "live", label: "Live", icon: <HeartOutlined />, href: "/auctions/live" },
        { key: "won", label: "Won", icon: <CheckOutlined />, href: "/auctions/won" },
        { key: "run-list", label: "Run List", icon: <FieldTimeOutlined />, href: "/auctions/run-list" }
      ]
    },
    { label: "Titles", icon: <FileTextOutlined />, href: "/titles" },
    { label: "Notifications", icon: <BellOutlined />, href: "/notifications" },
    {
      label: "Transportation", icon: <CarOutlined />, 
      children: [
        { key: "transporters", label: "Transporters", icon: <CarOutlined />, href: "/transportation/transporters" },
        {
          key: "jobs", label: "Jobs", icon: <ProfileOutlined />, children: [
            { key: "unpicked", label: "Un-Picked", icon: <ClockCircleOutlined />, href: "/transportation/jobs/unpicked" },
            { key: "accepted", label: "Accepted", icon: <CheckCircleOutlined />, href: "/transportation/jobs/accepted" },
            { key: "ended", label: "Ended", icon: <StopOutlined />, href: "/transportation/jobs/ended" }
          ]
        },
        { key: "charges-slabs", label: "Charges Slabs", icon: <CreditCardOutlined />, href: "/transportation/charges-slabs" }
      ]
    },
    {
      label: "Payments", icon: <CreditCardOutlined />, 
      children: [
        { key: "seller-payment", label: "Seller Payment", icon: <CreditCardOutlined />, href: "/payments/seller" },
        { key: "transporter-payment", label: "Transporter Payment", icon: <CarOutlined />, href: "/payments/transporter" }
      ]
    },
    { label: "Tickets", icon: <IdcardOutlined />, 
      children: [
        { key: 'ticket-list', label: "Tickets List", icon: <UnorderedListOutlined />, href: "/tickets/list" },
        { key: 'ticket-statuses', label: "Statuses", icon: <InfoCircleOutlined />, href: "/tickets/statuses" },
        { key: 'ticket-categories', label: "Categories", icon: <TagsOutlined />, href: "/tickets/categories" }
      ]
    },
    {
      label: "Reports", icon: <ProfileOutlined />, 
      children: [
        { key: "financial-report", label: "Financial Report", icon: <CreditCardOutlined />, href: "/reports/financial" }
      ]
    },
  ],
  inspector: [
    { label: "Tasks", icon: <HomeOutlined />, href: "/tasks" },
  ],
}; 

const dsNavItemsSeller: NavItem[] = [
  { label: "Dashboard", icon: <HomeOutlined />, href: "/" },
  {
    label: "Selling",
    icon: <CarOutlined />,
    children: [
      { label: "Selling (Current sales)", href: "/selling/current-sales" },
      { label: "In Negotiation", href: "/selling/in-negotiation" },
      { label: "Sold", href: "/selling/sold" },
    ],
  },
  { label: "Title Center", icon: <FileTextOutlined />, href: "/titles-ds" },
  {
    label: "Request Inspection",
    icon: <PlusOutlined />,
    children: [
      { label: "New", href: "/request-inspection/new" },
      { label: "Requested", href: "/request-inspection/requested" },
    ],
  },
  { label: "Transportation Center", icon: <FileTextOutlined />, href: "/transportation-ds" },
  { label: "Payments", icon: <CreditCardOutlined />, href: "/payments-ds" },
];

const dsNavItemsBuyer: NavItem[] = [
  { label: "Dashboard", icon: <HomeOutlined />, href: "/" },
  { label: "Auctions", icon: <ToolOutlined />, href: "/auctions-ds" },
  { label: "Upcoming", icon: <ShopOutlined />, href: "/upcoming-auctions" },
  {
    label: "Ended Auctions",
    icon: <SafetyCertificateOutlined />,
    children: [
      { label: "Offer Now", href: "/ended-auctions/offer-now" },
      { label: "Sold (Pending offers and sold)", href: "/ended-auctions/sold" },
    ],
  },
  {
    label: "Active Buying",
    icon: <ProfileOutlined />,
    children: [
      { label: "Buying (Current Bids)", href: "/active-buying/current-bids" },
      { label: "In Negotiation", href: "/active-buying/in-negotiation" },
      { label: "Won", href: "/active-buying/won" },
    ],
  },
  { label: "Title Center", icon: <FileTextOutlined />, href: "/titles-ds" },
  { label: "Transportation Center", icon: <FileTextOutlined />, href: "/transportation-ds" },
  { label: "Payments", icon: <CreditCardOutlined />, href: "/payments-ds" },
];

const dsNavItemsBoth: NavItem[] = [
  { label: "Dashboard", icon: <HomeOutlined />, href: "/" },
  { label: "Auctions", icon: <ToolOutlined />, href: "/auctions-ds" },
  { label: "Upcoming", icon: <ShopOutlined />, href: "/upcoming-auctions" },
  {
    label: "Ended Auctions",
    icon: <SafetyCertificateOutlined />,
    children: [
      { label: "Offer Now", href: "/ended-auctions/offer-now" },
      { label: "Sold (Pending offers and sold)", href: "/ended-auctions/sold" },
    ],
  },
  {
    label: "Active Buying",
    icon: <ProfileOutlined />,
    children: [
      { label: "Buying (Current Bids)", href: "/active-buying/current-bids" },
      { label: "In Negotiation", href: "/active-buying/in-negotiation" },
      { label: "Won", href: "/active-buying/won" },
    ],
  },
  {
    label: "Selling",
    icon: <CarOutlined />,
    children: [
      { label: "Selling (Current sales)", href: "/selling/current-sales" },
      { label: "In Negotiation", href: "/selling/in-negotiation" },
      { label: "Sold", href: "/selling/sold" },
    ],
  },
  { label: "Title Center", icon: <FileTextOutlined />, href: "/titles-ds" },
  {
    label: "Request Inspection",
    icon: <PlusOutlined />,
    children: [
      { label: "New", href: "/request-inspection/new" },
      { label: "Requested", href: "/request-inspection/requested" },
    ],
  },
  { label: "Transportation Center", icon: <FileTextOutlined />, href: "/transportation-ds" },
  { label: "Payments", icon: <CreditCardOutlined />, href: "/payments-ds" },
];

// Transporter navigation items - completely separate naming
const transporterNavItems: NavItem[] = [
  { label: "Dashboard", icon: <HomeOutlined />, href: "/" },
  { label: "New Jobs", icon: <CarOutlined />, href: "/transporter-new-jobs" },
  { label: "Accepted Jobs", icon: <UserOutlined />, href: "/transporter-accepted-jobs" },
  { label: "Completed Jobs", icon: <SafetyCertificateOutlined />, href: "/transporter-completed-jobs" },
  { label: "Payments", icon: <CreditCardOutlined />, href: "/transporter-payments" },
];

export function getDsNavItems(backendRole: string): NavItem[] {
  if (backendRole === "SELLER") {
    return dsNavItemsSeller;
  } else if (backendRole === "BUYER") {
    return dsNavItemsBuyer;
  } else if (backendRole === "BOTH" || backendRole === "SELLER/BUYER") {
    return dsNavItemsBoth;
  }
  // fallback to both
  return dsNavItemsBoth;
}

export function getTransporterNavItems(): NavItem[] {
  return transporterNavItems;
} 