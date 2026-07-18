import React, { useState, useMemo } from "react";
import { FiltersState, SalesEntry, StoreMaster, KPIMetrics } from "./types";
import { defaultSalesData, sampleStores } from "./data";
import { KPICards } from "./components/KPICards";
import { FiltersPanel } from "./components/FiltersPanel";
import { ChartsPanel } from "./components/ChartsPanel";
import { InsightsPanel } from "./components/InsightsPanel";
import { BarChart3, TrendingUp, Sparkles, FileSpreadsheet } from "lucide-react";

export default function App() {
  // Master Datasets (with default pre-populated sample values for out-of-the-box working experience)
  const [salesData, setSalesData] = useState<SalesEntry[]>(defaultSalesData);
  const [storesData, setStoresData] = useState<StoreMaster[]>(sampleStores);

  // Filter State
  const [filters, setFilters] = useState<FiltersState>({
    week: [],
    region: [],
    storeName: [],
    city: [],
    storeFormat: [],
    productCategory: []
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Merge datasets on SalesEntry.storeId === StoreMaster.storeId
  const mergedData = useMemo(() => {
    return salesData.map((sale) => {
      const store = storesData.find((s) => s.storeId === sale.storeId || s.storeName === sale.storeId) || {
        storeId: sale.storeId,
        storeName: sale.storeId, // fallback in case storeId column from sales data actually holds the store name
        region: "Other",
        city: "Unknown",
        storeFormat: "Standard"
      };
      return {
        ...sale,
        ...store
      };
    });
  }, [salesData, storesData]);

  // Apply filters dynamically
  const filteredData = useMemo(() => {
    return mergedData.filter((row) => {
      if (filters.week.length > 0 && !filters.week.includes(row.week)) return false;
      if (filters.region.length > 0 && !filters.region.includes(row.region)) return false;
      if (filters.storeName.length > 0 && !filters.storeName.includes(row.storeName)) return false;
      if (filters.city.length > 0 && !filters.city.includes(row.city)) return false;
      if (filters.storeFormat.length > 0 && !filters.storeFormat.includes(row.storeFormat)) return false;
      if (filters.productCategory.length > 0 && !filters.productCategory.includes(row.productCategory)) return false;
      return true;
    });
  }, [mergedData, filters]);

  // Compute 11 Business Intelligence KPIs
  const metrics = useMemo<KPIMetrics>(() => {
    const sumOrNull = (key: keyof SalesEntry) => {
      let hasData = false;
      let sum = 0;
      for (const row of filteredData) {
        if (row[key] !== null && row[key] !== undefined) {
          hasData = true;
          sum += row[key] as number;
        }
      }
      return hasData ? sum : null;
    };

    const totalNetSales = sumOrNull("netSales");
    const totalGrossSales = sumOrNull("grossSales");
    const totalTransactions = sumOrNull("transactions");
    const totalUnitsSold = sumOrNull("unitsSold");
    const totalFootfall = sumOrNull("footfall");
    const totalSalesTarget = sumOrNull("salesTarget");
    const totalReturnsAmount = sumOrNull("returnsAmount");
    const totalDiscountAmount = sumOrNull("discountAmount");
    const totalStockouts = sumOrNull("stockoutEvents");
    
    // Average stockouts per store logic
    const storeStockouts = new Map<string, number>();
    for (const row of filteredData) {
      if (row.stockoutEvents !== null && row.stockoutEvents !== undefined) {
        storeStockouts.set(row.storeId, (storeStockouts.get(row.storeId) || 0) + row.stockoutEvents);
      }
    }
    let totalStockoutStores = storeStockouts.size;
    const avgStockouts = totalStockoutStores > 0 ? (totalStockouts || 0) / totalStockoutStores : null;
    
    // Average rating logic
    let totalRating = 0;
    let ratingCount = 0;
    for (const row of filteredData) {
      if (row.customerRating !== null && row.customerRating !== undefined) {
        totalRating += row.customerRating;
        ratingCount++;
      }
    }
    const avgCustomerRating = ratingCount > 0 ? totalRating / ratingCount : null;

    return {
      totalNetSales,
      totalGrossSales,
      totalTransactions,
      totalUnitsSold,
      totalFootfall,
      targetAchievement: totalSalesTarget && totalNetSales ? (totalNetSales / totalSalesTarget) * 100 : null,
      avgTransactionValue: totalTransactions && totalNetSales ? totalNetSales / totalTransactions : null,
      returnRate: totalNetSales && totalReturnsAmount !== null ? (totalReturnsAmount / totalNetSales) * 100 : null,
      discountRate: totalGrossSales && totalDiscountAmount !== null ? (totalDiscountAmount / totalGrossSales) * 100 : null,
      conversionRate: totalFootfall && totalTransactions !== null ? (totalTransactions / totalFootfall) * 100 : null,
      avgCustomerRating,
      totalStockouts,
      avgStockouts
    };
  }, [filteredData]);

  const handleUploadStores = (newStores: StoreMaster[]) => {
    setStoresData(newStores);
    // Reset filters to prevent stale selected elements
    setFilters({
      week: [],
      region: [],
      storeName: [],
      city: [],
      storeFormat: [],
      productCategory: []
    });
  };

  const handleUploadSales = (newSales: SalesEntry[]) => {
    setSalesData(newSales);
    setFilters({
      week: [],
      region: [],
      storeName: [],
      city: [],
      storeFormat: [],
      productCategory: []
    });
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-950 text-slate-200 antialiased selection:bg-sky-500/25 selection:text-sky-200 pb-12">
      
      {/* Executive Header */}
      <header id="dashboard-header" className="bg-slate-900/50 border-b border-slate-800/80 py-4 px-6 sticky top-0 z-50 backdrop-blur-md">
        <div className="w-full mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500 rounded-lg text-white shadow-lg shadow-sky-500/20">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-2">
                Retail Sales Intelligence <span className="text-slate-500 font-normal text-sm hidden sm:inline">| Executive Dashboard</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                Analyze weekly execution, financial metrics, discount yields, and active AI-generated recommendations.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="lg:hidden px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition border border-slate-700"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
            </button>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hidden sm:flex">
              <span className="h-2 w-2 bg-sky-400 rounded-full animate-pulse" />
              <span>Operational Mode: Active Insights</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col gap-8">
        
        {/* Row 1: KPI Cards */}
        <section id="kpi-banner">
          <KPICards metrics={metrics} />
        </section>

        {/* Row 2: Filters (full width) */}
        <section id="filters-section" className={`w-full z-40 transition-all ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
          <FiltersPanel
            filters={filters}
            setFilters={setFilters}
            salesData={salesData}
            storesData={storesData}
            onUploadStores={handleUploadStores}
            onUploadSales={handleUploadSales}
            totalFilteredRows={filteredData.length}
            filteredData={filteredData}
            onCloseMobile={() => setMobileFiltersOpen(false)}
          />
        </section>

        {/* Rows 3-5: Charts */}
        <section id="charts-section" className="w-full">
          {filteredData.length === 0 ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-300">No transactions match your active filters.</p>
              <p className="text-xs mt-1 text-slate-500">Try resetting the filter panel on the left to restore the data views.</p>
            </div>
          ) : (
            <ChartsPanel filteredData={filteredData} />
          )}
        </section>

        {/* Row 6: AI Intelligence Summaries */}
        <section id="insights-section" className="w-full">
          <InsightsPanel
            filteredData={filteredData}
            filters={filters}
            metrics={metrics}
          />
        </section>

      </main>

      {/* Bottom Bar Info */}
      <footer id="dashboard-footer" className="h-8 bg-slate-950 border-t border-slate-800 px-6 mt-12 flex items-center justify-between text-[9px] font-mono text-slate-500 tracking-wider">
        <div>CONNECTED TO RETAIL_SALES_ENGINE_V2</div>
        <div className="flex gap-4">
          <span>LATENCY: 14MS</span>
          <span>UPTIME: 99.98%</span>
          <span>ENV: PRODUCTION</span>
        </div>
      </footer>

    </div>
  );
}
