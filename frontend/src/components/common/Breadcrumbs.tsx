"use client";
import { Button } from "antd";
import Link from "next/link";

export interface BreadcrumbItem {
  label?: string;
  href?: string;
  items?: BreadcrumbItem[];
  onSaveButtonClick?: () => void;
  saveButtonLabel?: string;
  showSaveButton?: boolean;
}

export default function Breadcrumbs({ items, showSaveButton, saveButtonLabel, onSaveButtonClick }: BreadcrumbItem ) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <nav className="flex items-center justify-between">
        <ol className="flex items-center space-x-2 text-2xl font-bold">
          {items?.map((item, idx) => (
            <li key={idx} className="flex items-center">
              {item.href ? (
                <Link href={item.href} className={idx === 0 ? "text-sky-700 hover:underline" : "text-gray-500 font-normal hover:underline"}>
                  {item.label}
                </Link>
              ) : (
                <span className={idx === 0 ? "text-sky-700" : "text-gray-500 font-normal"}>
                  {item.label}
                </span>
              )}
              {idx < items.length - 1 && (
                <span className="mx-2 text-gray-400 font-normal">/</span>
              )}
            </li>
          ))}
        </ol>
        <div className="flex items-center justify-end">
         { showSaveButton && <button 
         className="bg-sky-700 text-white px-4 py-2 rounded-md"
         onClick={onSaveButtonClick}
         >{saveButtonLabel}</button>}
        </div>
      </nav>
    </div>
  );
} 