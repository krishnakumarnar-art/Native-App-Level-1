import React, { useRef, useState, useEffect } from "react";
import { 
  Filter, 
  RotateCcw, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  ChevronDown,
  X
} from "lucide-react";
import { FiltersState, StoreMaster, SalesEntry } from "../types";
import { 
  downloadStoreMasterTemplate, 
  downloadWeeklySalesTemplate,
  parseStoreMasterFile,
  parseWeeklySalesFile
} from "../data";

interface FiltersPanelProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  salesData: SalesEntry[];
  storesData: StoreMaster[];
  onUploadStores: (stores: StoreMaster[]) => void;
  onUploadSales: (sales: SalesEntry[]) => void;
  totalFilteredRows: number;
  filteredData: any[];
  onCloseMobile?: () => void;
}

const MultiSelect = ({
  label,
  options,
  selectedValues,
  onChange,
}: {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  const handleSelectAll = () => {
    onChange(options);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
      <label className="text-xs font-semibold text-slate-400">{label}</label>
      <div 
        className="w-full min-h-[42px] bg-slate-950 border border-slate-800 rounded-lg p-2 flex flex-wrap gap-1 items-center cursor-pointer relative pr-8"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.length === 0 ? (
          <span className="text-slate-500 text-sm px-1">All Selected (Default)</span>
        ) : (
          selectedValues.slice(0, 2).map(val => (
            <span key={val} className="bg-sky-500/20 text-sky-300 text-xs px-2 py-0.5 rounded flex items-center gap-1">
              <span className="truncate max-w-[100px]">{val}</span>
              <X className="h-3 w-3 cursor-pointer hover:text-sky-100 shrink-0" onClick={(e) => { e.stopPropagation(); toggleOption(val); }} />
            </span>
          ))
        )}
        {selectedValues.length > 2 && (
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded">
            +{selectedValues.length - 2}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 flex flex-col max-h-64">
          <div className="p-2 border-b border-slate-800 flex items-center gap-2 shrink-0">
            <Search className="h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-slate-200 w-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="p-2 border-b border-slate-800 flex justify-between gap-2 bg-slate-900/50 shrink-0">
            <button onClick={(e) => { e.stopPropagation(); handleSelectAll(); }} className="text-xs font-semibold text-sky-400 hover:text-sky-300 px-2 py-1">Select All</button>
            <button onClick={(e) => { e.stopPropagation(); handleClearAll(); }} className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-2 py-1">Clear All</button>
          </div>
          <div className="overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="text-xs text-slate-500 p-2 text-center">No options found</div>
            ) : (
              filteredOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedValues.includes(opt)} 
                    onChange={() => toggleOption(opt)} 
                    className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500/50"
                  />
                  <span className="text-sm text-slate-300 truncate">{opt}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  setFilters,
  salesData,
  storesData,
  onUploadStores,
  onUploadSales,
  totalFilteredRows,
  filteredData,
  onCloseMobile
}) => {
  const storeInputRef = useRef<HTMLInputElement>(null);
  const salesInputRef = useRef<HTMLInputElement>(null);

  const [storesUploadStatus, setStoresUploadStatus] = useState<{ success?: boolean; msg?: string }>({});
  const [salesUploadStatus, setSalesUploadStatus] = useState<{ success?: boolean; msg?: string }>({});
  const [dragActiveStores, setDragActiveStores] = useState(false);
  const [dragActiveSales, setDragActiveSales] = useState(false);

  // Derive dynamic filter lists from active datasets
  const weeks = Array.from(new Set(salesData.map((s) => s.week))).sort() as string[];
  const regions = Array.from(new Set(storesData.map((s) => s.region))).sort() as string[];
  const storeNames = Array.from(new Set(storesData.map((s) => s.storeName))).sort() as string[];
  const cities = Array.from(new Set(storesData.map((s) => s.city))).sort() as string[];
  const storeFormats = Array.from(new Set(storesData.map((s) => s.storeFormat))).sort() as string[];
  const categories = Array.from(new Set(salesData.map((s) => s.productCategory))).sort() as string[];

  const handleFilterChange = (key: keyof FiltersState, value: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      week: [],
      region: [],
      storeName: [],
      city: [],
      storeFormat: [],
      productCategory: []
    });
  };

  // Upload handlers
  const handleStoresFile = async (file: File) => {
    try {
      setStoresUploadStatus({ msg: "Reading file..." });
      const parsed = await parseStoreMasterFile(file);
      onUploadStores(parsed);
      setStoresUploadStatus({ success: true, msg: `Loaded ${parsed.length} stores!` });
    } catch (err: any) {
      setStoresUploadStatus({ success: false, msg: err.message || "Invalid store master file" });
    }
  };

  const handleSalesFile = async (file: File) => {
    try {
      setSalesUploadStatus({ msg: "Reading file..." });
      const parsed = await parseWeeklySalesFile(file);
      onUploadSales(parsed);
      setSalesUploadStatus({ success: true, msg: `Loaded ${parsed.length} entries!` });
    } catch (err: any) {
      setSalesUploadStatus({ success: false, msg: err.message || "Invalid weekly sales file" });
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent, type: "stores" | "sales") => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (type === "stores") setDragActiveStores(true);
      if (type === "sales") setDragActiveSales(true);
    } else if (e.type === "dragleave") {
      if (type === "stores") setDragActiveStores(false);
      if (type === "sales") setDragActiveSales(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: "stores" | "sales") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "stores") {
      setDragActiveStores(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleStoresFile(e.dataTransfer.files[0]);
      }
    } else {
      setDragActiveSales(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleSalesFile(e.dataTransfer.files[0]);
      }
    }
  };

  return (
    <div id="filters-sidebar" className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-6 shadow-2xl h-full backdrop-blur-md">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <Filter className="h-5 w-5 text-sky-400" />
          <span>Dashboard Filters</span>
        </div>
        <button
          id="btn-reset-filters"
          onClick={handleResetFilters}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-sky-400 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded-lg transition duration-200"
          title="Reset all selections"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* Filter Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MultiSelect
          label="Week Start Date"
          options={weeks}
          selectedValues={filters.week}
          onChange={(val) => handleFilterChange("week", val)}
        />
        <MultiSelect
          label="Region"
          options={regions}
          selectedValues={filters.region}
          onChange={(val) => handleFilterChange("region", val)}
        />
        <MultiSelect
          label="Store Name"
          options={storeNames}
          selectedValues={filters.storeName}
          onChange={(val) => handleFilterChange("storeName", val)}
        />
        <MultiSelect
          label="City"
          options={cities}
          selectedValues={filters.city}
          onChange={(val) => handleFilterChange("city", val)}
        />
        <MultiSelect
          label="Store Format"
          options={storeFormats}
          selectedValues={filters.storeFormat}
          onChange={(val) => handleFilterChange("storeFormat", val)}
        />
        <MultiSelect
          label="Product Category"
          options={categories}
          selectedValues={filters.productCategory}
          onChange={(val) => handleFilterChange("productCategory", val)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 border-t border-slate-800/80 pt-4">
        {/* Actions Section */}
        <div className="flex flex-col gap-3">
          <div className="text-[11px] text-slate-400 font-medium flex justify-between">
            <span>Matching records:</span>
            <span className="font-bold text-sky-400">{totalFilteredRows} / {salesData.length}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={handleResetFilters}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition"
            >
              Reset All
            </button>
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-sky-900/20"
            >
              Apply Filters
            </button>
          </div>
          
          <button
            onClick={() => {
              if (filteredData.length === 0) return;
              const headers = Object.keys(filteredData[0]).join(",");
              const rows = filteredData.map(row => Object.values(row).map(val => typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : (val ?? "")).join(","));
              const csvContent = [headers, ...rows].join("\n");
              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", `filtered_sales_data_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            disabled={filteredData.length === 0}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 font-medium text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Filtered Data
          </button>
        </div>

        {/* File Management and Import/Export Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Upload Excel Datasets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store Master Upload */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-400">1. Store Master (store_master.xlsx)</span>
          <div
            id="drag-stores"
            onDragEnter={(e) => handleDrag(e, "stores")}
            onDragOver={(e) => handleDrag(e, "stores")}
            onDragLeave={(e) => handleDrag(e, "stores")}
            onDrop={(e) => handleDrop(e, "stores")}
            onClick={() => storeInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition ${
              dragActiveStores 
                ? "border-sky-500 bg-sky-950/30" 
                : "border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60"
            }`}
          >
            <input
              type="file"
              ref={storeInputRef}
              onChange={(e) => e.target.files?.[0] && handleStoresFile(e.target.files[0])}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <Upload className="h-4 w-4 mx-auto mb-1 text-slate-500" />
            <span className="text-xs text-slate-400 font-medium block">Drag-and-drop or select file</span>
          </div>
          {storesUploadStatus.msg && (
            <div className="mt-1 flex items-center gap-1.5 text-[10px]">
              {storesUploadStatus.success === true ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              ) : storesUploadStatus.success === false ? (
                <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              ) : (
                <Loader2 className="h-3.5 w-3.5 text-sky-400 shrink-0 animate-spin" />
              )}
              <span className={`font-semibold ${
                storesUploadStatus.success === true ? "text-emerald-400" : storesUploadStatus.success === false ? "text-rose-400" : "text-slate-400"
              }`}>
                {storesUploadStatus.msg}
              </span>
            </div>
          )}
        </div>

        {/* Weekly Sales Upload */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-400">2. Weekly Sales (retail_weekly_sales.xlsx)</span>
          <div
            id="drag-sales"
            onDragEnter={(e) => handleDrag(e, "sales")}
            onDragOver={(e) => handleDrag(e, "sales")}
            onDragLeave={(e) => handleDrag(e, "sales")}
            onDrop={(e) => handleDrop(e, "sales")}
            onClick={() => salesInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition ${
              dragActiveSales 
                ? "border-sky-500 bg-sky-950/30" 
                : "border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60"
            }`}
          >
            <input
              type="file"
              ref={salesInputRef}
              onChange={(e) => e.target.files?.[0] && handleSalesFile(e.target.files[0])}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <Upload className="h-4 w-4 mx-auto mb-1 text-slate-500" />
            <span className="text-xs text-slate-400 font-medium block">Drag-and-drop or select file</span>
          </div>
          {salesUploadStatus.msg && (
            <div className="mt-1 flex items-center gap-1.5 text-[10px]">
              {salesUploadStatus.success === true ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              ) : salesUploadStatus.success === false ? (
                <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              ) : (
                <Loader2 className="h-3.5 w-3.5 text-sky-400 shrink-0 animate-spin" />
              )}
              <span className={`font-semibold ${
                salesUploadStatus.success === true ? "text-emerald-400" : salesUploadStatus.success === false ? "text-rose-400" : "text-slate-400"
              }`}>
                {salesUploadStatus.msg}
              </span>
            </div>
          )}
        </div>
        </div>

        {/* Template Downloads */}
        <div className="border-t border-slate-800/80 pt-3 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Download Sample Files</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-download-stores"
              onClick={downloadStoreMasterTemplate}
              className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-800/50 py-1.5 rounded-lg transition"
            >
              <Download className="h-3 w-3" />
              Store Master
            </button>
            <button
              id="btn-download-sales"
              onClick={downloadWeeklySalesTemplate}
              className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-800/50 py-1.5 rounded-lg transition"
            >
              <Download className="h-3 w-3" />
              Weekly Sales
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
