import React, { useState } from "react";
import { Checkbox, Slider, Collapse, Button } from "antd";

interface AuctionFiltersSidebarProps {
  filters: any;
  onChange: (filters: any) => void;
  filterOptions: any;
  onApply: () => void;
  open?: boolean;
  onClose?: () => void;
}

const filterSections = [
  { key: "makeModel", label: "Model & Make" },
  { key: "price", label: "Price" },
  { key: "year", label: "Year" },
  { key: "mileage", label: "Mileage" },
  { key: "fuelType", label: "Fuel Type" },
  { key: "transmission", label: "Transmission" },
];

export default function AuctionFiltersSidebar({ filters, onChange, filterOptions, onApply, open = true, onClose }: AuctionFiltersSidebarProps) {
  const [activeKeys, setActiveKeys] = useState<string[]>(["makeModel"]);

  const handleCollapseChange = (keys: string[] | string) => {
    setActiveKeys(Array.isArray(keys) ? keys : [keys]);
  };

  const handleCheckboxChange = (section: string, value: string) => {
    const current = filters[section] || [];
    onChange({ ...filters, [section]: current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value] });
  };

  const handleSliderChange = (section: string, value: [number, number]) => {
    onChange({ ...filters, [section]: value });
  };

  const handleClear = (section: string) => {
    onChange({ ...filters, [section]: section === "price" || section === "year" || section === "mileage" ? filterOptions[section].range : [] });
  };

  // Mobile modal
  if (typeof window !== "undefined" && window.innerWidth < 768) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-md mx-auto flex flex-col gap-4 relative">
          <div className="flex flex-row justify-between items-center mb-2">
            <span className="text-xl font-bold">Filters</span>
            <div className="flex gap-2">
              <Button onClick={onClose} className="!bg-sky-600 !text-white">Close</Button>
              <Button type="primary" className="!bg-sky-600" onClick={() => { onApply(); onClose && onClose(); }}>Apply</Button>
            </div>
          </div>
          <Collapse
            activeKey={activeKeys}
            onChange={handleCollapseChange}
            expandIconPosition="end"
            bordered={false}
            className="bg-white"
          >
            {/* Model & Make */}
            <Collapse.Panel header={<span className="font-semibold">Model & Make</span>} key="makeModel" extra={<span className="text-xs text-sky-600 cursor-pointer" onClick={e => { e.stopPropagation(); handleClear("makeModel"); }}>clear</span>}>
              <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                {filterOptions.makeModel.map((item: any) => (
                  <Checkbox
                    key={item.value}
                    checked={filters.makeModel?.includes(item.value)}
                    onChange={() => handleCheckboxChange("makeModel", item.value)}
                  >
                    {item.label} <span className="text-gray-400">({item.count})</span>
                  </Checkbox>
                ))}
              </div>
            </Collapse.Panel>
            {/* Price */}
            <Collapse.Panel header={<span className="font-semibold">Price</span>} key="price" extra={<span className="text-xs text-sky-600 cursor-pointer" onClick={e => { e.stopPropagation(); handleClear("price"); }}>clear</span>}>
              <Slider
                range
                min={filterOptions.price.range[0]}
                max={filterOptions.price.range[1]}
                value={filters.price}
                onChange={v => handleSliderChange("price", v as [number, number])}
                marks={filterOptions.price.marks}
              />
            </Collapse.Panel>
            {/* Year */}
            <Collapse.Panel header={<span className="font-semibold">Year</span>} key="year" extra={<span className="text-xs text-sky-600 cursor-pointer" onClick={e => { e.stopPropagation(); handleClear("year"); }}>clear</span>}>
              <Slider
                range
                min={filterOptions.year.range[0]}
                max={filterOptions.year.range[1]}
                value={filters.year}
                onChange={v => handleSliderChange("year", v as [number, number])}
                marks={filterOptions.year.marks}
              />
            </Collapse.Panel>
            {/* Mileage */}
            <Collapse.Panel header={<span className="font-semibold">Mileage</span>} key="mileage" extra={<span className="text-xs text-sky-600 cursor-pointer" onClick={e => { e.stopPropagation(); handleClear("mileage"); }}>clear</span>}>
              <Slider
                range
                min={filterOptions.mileage.range[0]}
                max={filterOptions.mileage.range[1]}
                value={filters.mileage}
                onChange={v => handleSliderChange("mileage", v as [number, number])}
                marks={filterOptions.mileage.marks}
              />
            </Collapse.Panel>
            {/* Fuel Type */}
            <Collapse.Panel header={<span className="font-semibold">Fuel Type</span>} key="fuelType" extra={<span className="text-xs text-sky-600 cursor-pointer" onClick={e => { e.stopPropagation(); handleClear("fuelType"); }}>clear</span>}>
              <div className="flex flex-col gap-1">
                {filterOptions.fuelType.map((item: any) => (
                  <Checkbox
                    key={item.value}
                    checked={filters.fuelType?.includes(item.value)}
                    onChange={() => handleCheckboxChange("fuelType", item.value)}
                  >
                    {item.label} <span className="text-gray-400">({item.count})</span>
                  </Checkbox>
                ))}
              </div>
            </Collapse.Panel>
            {/* Transmission */}
            <Collapse.Panel header={<span className="font-semibold">Transmission</span>} key="transmission" extra={<span className="text-xs text-sky-600 cursor-pointer" onClick={e => { e.stopPropagation(); handleClear("transmission"); }}>clear</span>}>
              <div className="flex flex-col gap-1">
                {filterOptions.transmission.map((item: any) => (
                  <Checkbox
                    key={item.value}
                    checked={filters.transmission?.includes(item.value)}
                    onChange={() => handleCheckboxChange("transmission", item.value)}
                  >
                    {item.label} <span className="text-gray-400">({item.count})</span>
                  </Checkbox>
                ))}
              </div>
            </Collapse.Panel>
          </Collapse>
        </div>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <div className="bg-white rounded-xl shadow-md p-4 w-full md:w-80 flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center mb-2">
        <span className="text-xl font-bold">Filters</span>
        <Button type="primary" className="!bg-sky-600" onClick={onApply}>Apply</Button>
      </div>
      <Collapse
        activeKey={activeKeys}
        onChange={handleCollapseChange}
        expandIconPosition="end"
        bordered={false}
        className="bg-white"
      >
        {/* Model & Make */}
        <Collapse.Panel header={<span className="font-semibold">Model & Make</span>} key="makeModel" extra={<span className="text-xs text-sky-600 cursor-pointer" onClick={e => { e.stopPropagation(); handleClear("makeModel"); }}>clear</span>}>
          <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
            {filterOptions.makeModel.map((item: any) => (
              <Checkbox
                key={item.value}
                checked={filters.makeModel?.includes(item.value)}
                onChange={() => handleCheckboxChange("makeModel", item.value)}
              >
                {item.label} <span className="text-gray-400">({item.count})</span>
              </Checkbox>
            ))}
          </div>
        </Collapse.Panel>
        {/* Price */}
        <Collapse.Panel header={<span className="font-semibold">Price</span>} key="price" extra={<span className="text-xs text-sky-600 cursor-pointer" onClick={e => { e.stopPropagation(); handleClear("price"); }}>clear</span>}>
          <Slider
            range
            min={filterOptions.price.range[0]}
            max={filterOptions.price.range[1]}
            value={filters.price}
            onChange={v => handleSliderChange("price", v as [number, number])}
            marks={filterOptions.price.marks}
          />
        </Collapse.Panel>
        {/* Year */}
        <Collapse.Panel header={<span className="font-semibold">Year</span>} key="year" extra={<span className="text-xs text-sky-600 cursor-pointer" onClick={e => { e.stopPropagation(); handleClear("year"); }}>clear</span>}>
          <Slider
            range
            min={filterOptions.year.range[0]}
            max={filterOptions.year.range[1]}
            value={filters.year}
            onChange={v => handleSliderChange("year", v as [number, number])}
            marks={filterOptions.year.marks}
          />
        </Collapse.Panel>
        {/* Mileage */}
        <Collapse.Panel header={<span className="font-semibold">Mileage</span>} key="mileage" extra={<span className="text-xs text-sky-600 cursor-pointer" onClick={e => { e.stopPropagation(); handleClear("mileage"); }}>clear</span>}>
          <Slider
            range
            min={filterOptions.mileage.range[0]}
            max={filterOptions.mileage.range[1]}
            value={filters.mileage}
            onChange={v => handleSliderChange("mileage", v as [number, number])}
            marks={filterOptions.mileage.marks}
          />
        </Collapse.Panel>
        {/* Fuel Type */}
        <Collapse.Panel header={<span className="font-semibold">Fuel Type</span>} key="fuelType" extra={<span className="text-xs text-sky-600 cursor-pointer" onClick={e => { e.stopPropagation(); handleClear("fuelType"); }}>clear</span>}>
          <div className="flex flex-col gap-1">
            {filterOptions.fuelType.map((item: any) => (
              <Checkbox
                key={item.value}
                checked={filters.fuelType?.includes(item.value)}
                onChange={() => handleCheckboxChange("fuelType", item.value)}
              >
                {item.label} <span className="text-gray-400">({item.count})</span>
              </Checkbox>
            ))}
          </div>
        </Collapse.Panel>
        {/* Transmission */}
        <Collapse.Panel header={<span className="font-semibold">Transmission</span>} key="transmission" extra={<span className="text-xs text-sky-600 cursor-pointer" onClick={e => { e.stopPropagation(); handleClear("transmission"); }}>clear</span>}>
          <div className="flex flex-col gap-1">
            {filterOptions.transmission.map((item: any) => (
              <Checkbox
                key={item.value}
                checked={filters.transmission?.includes(item.value)}
                onChange={() => handleCheckboxChange("transmission", item.value)}
              >
                {item.label} <span className="text-gray-400">({item.count})</span>
              </Checkbox>
            ))}
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
} 