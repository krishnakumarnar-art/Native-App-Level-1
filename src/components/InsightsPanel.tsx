import React, { useState } from "react";
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  ArrowRight, 
  FileDown, 
  HelpCircle,
  FileText
} from "lucide-react";
import { MergedDataRow, FiltersState, KPIMetrics } from "../types";
import { exportToCSV } from "../data";

interface InsightsPanelProps {
  filteredData: MergedDataRow[];
  filters: FiltersState;
  metrics: KPIMetrics;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  filteredData,
  filters,
  metrics
}) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Compute facts client-side to supply the AI with pristine facts
  const getComputedFacts = () => {
    if (filteredData.length === 0) return {};

    // Region Sales
    const regionSalesMap = new Map<string, number>();
    const regionStockoutsMap = new Map<string, number>();

    // Store Sales & Targets
    const storeSalesMap = new Map<string, { sales: number; target: number }>();
    
    // Category Returns & Sales
    const categoryReturnsMap = new Map<string, { returns: number; sales: number }>();

    for (const row of filteredData) {
      // Region sales
      regionSalesMap.set(row.region, (regionSalesMap.get(row.region) || 0) + row.netSales);
      
      // Region Stockouts
      if (row.stockoutRisk === "High" || row.stockoutEvents > 0) {
        regionStockoutsMap.set(row.region, (regionStockoutsMap.get(row.region) || 0) + 1);
      }

      // Store sales vs targets
      const st = storeSalesMap.get(row.storeName) || { sales: 0, target: 0 };
      st.sales += row.netSales;
      st.target += row.salesTarget;
      storeSalesMap.set(row.storeName, st);

      // Category returns
      const cat = categoryReturnsMap.get(row.productCategory) || { returns: 0, sales: 0 };
      cat.returns += row.returnsAmount;
      cat.sales += row.netSales;
      categoryReturnsMap.set(row.productCategory, cat);
    }

    // Best/Worst Regions
    let topRegion = "";
    let maxRegionSales = -1;
    let worstRegion = "";
    let minRegionSales = Infinity;

    regionSalesMap.forEach((sales, region) => {
      if (sales > maxRegionSales) {
        maxRegionSales = sales;
        topRegion = region;
      }
      if (sales < minRegionSales) {
        minRegionSales = sales;
        worstRegion = region;
      }
    });

    // Top Store
    let topStoreName = "";
    let maxStoreSales = -1;
    const underperformingStores: string[] = [];

    storeSalesMap.forEach((data, storeName) => {
      if (data.sales > maxStoreSales) {
        maxStoreSales = data.sales;
        topStoreName = storeName;
      }
      if (data.sales < data.target) {
        underperformingStores.push(storeName);
      }
    });

    // High return category
    let highReturnCategory = "";
    let maxReturnRate = -1;
    categoryReturnsMap.forEach((data, category) => {
      const rate = data.sales > 0 ? (data.returns / data.sales) * 100 : 0;
      if (rate > maxReturnRate) {
        maxReturnRate = rate;
        highReturnCategory = category;
      }
    });

    // High stockouts
    let highStockoutRegion = "";
    let maxStockouts = 0;
    regionStockoutsMap.forEach((count, region) => {
      if (count > maxStockouts) {
        maxStockouts = count;
        highStockoutRegion = region;
      }
    });

    return {
      topRegion: topRegion || "N/A",
      worstRegion: worstRegion || "N/A",
      topStore: topStoreName || "N/A",
      underperformingStores: underperformingStores,
      highReturnCategory: highReturnCategory || "N/A",
      highStockoutRegion: highStockoutRegion || "N/A"
    };
  };

  const generateLocalInsights = () => {
    if (filteredData.length === 0) {
      setError("Please ensure there is filtered data available to analyze.");
      setInsights("");
      return;
    }

    setLoading(true);
    setError("");
    
    // Simulate a brief calculation delay
    setTimeout(() => {
      try {
        const facts = getComputedFacts();
        
        const bullets: string[] = [];
        
        if (facts.topRegion !== "N/A") {
          bullets.push(`- **${facts.topRegion}** region generated the highest revenue.`);
        }
        if (facts.worstRegion !== "N/A") {
          bullets.push(`- **${facts.worstRegion}** region generated the lowest revenue.`);
        }
        if (facts.topStore !== "N/A") {
          bullets.push(`- **${facts.topStore}** is the best performing store.`);
        }
        if (facts.underperformingStores && facts.underperformingStores.length > 0) {
          bullets.push(`- **${facts.underperformingStores.join(", ")}** ${facts.underperformingStores.length === 1 ? 'is' : 'are'} below sales target.`);
        } else {
          bullets.push(`- All stores met or exceeded their sales targets.`);
        }
        if (facts.highReturnCategory !== "N/A") {
          bullets.push(`- **${facts.highReturnCategory}** has the highest return rate.`);
        }
        if (facts.highStockoutRegion !== "N/A") {
          bullets.push(`- **${facts.highStockoutRegion}** experienced the highest stockouts.`);
        }
        
        bullets.push(`- Average customer rating is **${metrics.avgCustomerRating.toFixed(1)}/5**.`);
        bullets.push(`- Overall target achievement is **${metrics.targetAchievement.toFixed(1)}%**.`);

        setInsights(bullets.join("\n"));
      } catch (err: any) {
        console.error(err);
        setError("Failed to generate insights based on current data.");
      } finally {
        setLoading(false);
      }
    }, 200); // Slight delay for UI feedback
  };

  React.useEffect(() => {
    // Generate immediately when data is available or when filters change
    if (filteredData.length > 0) {
      const timeoutId = setTimeout(() => {
        generateLocalInsights();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setInsights("");
    }
  }, [filters, filteredData]);

  const handleCopyToClipboard = () => {
    if (!insights) return;
    navigator.clipboard.writeText(insights);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    if (!insights) return;
    const element = document.createElement("a");
    const file = new Blob([insights], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `retail_sales_report_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportFilteredCSV = () => {
    const filename = `filtered_sales_export_${new Date().toISOString().split("T")[0]}.csv`;
    exportToCSV(filteredData, filename);
  };

  // Simple Markdown to HTML formatter to render report beautifully without heavy unsafe libraries
  const renderFormattedMarkdown = (text: string) => {
    if (!text) return null;
    
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content = line;
      
      // Handle Headings
      if (content.startsWith("### ")) {
        return <h4 key={idx} className="text-base font-bold text-sky-400 mt-6 mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">{content.replace("### ", "")}</h4>;
      }
      if (content.startsWith("## ")) {
        return <h3 key={idx} className="text-lg font-bold text-sky-400 mt-8 mb-4">{content.replace("## ", "")}</h3>;
      }
      if (content.startsWith("# ")) {
        return <h2 key={idx} className="text-xl font-bold text-white mt-8 mb-4 border-b-2 border-slate-800 pb-2">{content.replace("# ", "")}</h2>;
      }

      // Handle Bullet points
      if (content.startsWith("- ") || content.startsWith("* ")) {
        const cleanText = content.substring(2);
        return (
          <ul key={idx} className="list-disc list-inside ml-4 text-sm text-slate-300 my-2 leading-relaxed">
            <li>{parseBoldText(cleanText)}</li>
          </ul>
        );
      }

      // Handle numbered lists
      const numberMatch = content.match(/^(\d+)\.\s(.*)/);
      if (numberMatch) {
        return (
          <div key={idx} className="flex gap-3 text-sm text-slate-300 my-2 leading-relaxed pl-2">
            <span className="font-bold text-sky-400">{numberMatch[1]}.</span>
            <span>{parseBoldText(numberMatch[2])}</span>
          </div>
        );
      }

      // Default paragraph
      if (content.trim() === "") return <div key={idx} className="h-3" />;
      return <p key={idx} className="text-sm text-slate-300 my-2.5 leading-relaxed">{parseBoldText(content)}</p>;
    });
  };

  // Helper to turn bold syntax (**text**) into actual React bold tags
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-white">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div id="ai-analyst-panel" className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-6 shadow-2xl h-full justify-between backdrop-blur-md">
      
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-950/40 border border-sky-800/30 rounded-lg text-sky-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Business Insight Summary</h3>
              <p className="text-[10px] text-slate-500">Auto-generated from filtered data</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!insights && !loading && !error && (
          <div className="text-center py-10 px-4 flex flex-col items-center gap-4 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/40">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-500">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300">No Insights Available</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                Upload data or adjust your filters to view the business insight summary.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div id="ai-loading-state" className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-slate-800 border-t-sky-400 animate-spin" />
              <Sparkles className="h-5 w-5 text-sky-400 absolute top-3.5 left-3.5" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-300">Calculating Insights...</p>
              <p className="text-[10px] text-slate-500 mt-1">Applying business rules to current data</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div id="ai-error-state" className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-300 flex flex-col gap-2">
            <span className="text-xs font-bold">Analysis Failed</span>
            <p className="text-[11px] leading-relaxed opacity-90">{error}</p>
            <button
              onClick={generateLocalInsights}
              className="mt-1 self-start text-[10px] font-bold text-rose-300 bg-rose-900/40 hover:bg-rose-900/60 py-1 px-2.5 rounded-lg transition"
            >
              Retry Generation
            </button>
          </div>
        )}

        {/* Generated Insights */}
        {insights && (
          <div id="ai-insights-report" className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-slate-950 border border-slate-800 p-2 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Generated Report</span>
              <div className="flex gap-1">
                <button
                  id="btn-copy-report"
                  onClick={handleCopyToClipboard}
                  className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-sky-400 transition"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  id="btn-download-txt-report"
                  onClick={handleDownloadReport}
                  className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-sky-400 transition"
                  title="Download as TXT file"
                >
                  <FileText className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Report Content */}
            <div className="min-h-[300px] max-h-[800px] overflow-y-auto pr-1 border border-slate-800 rounded-xl p-5 bg-slate-950/50">
              {renderFormattedMarkdown(insights)}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800/80 pt-4 mt-4">
        <button
          onClick={handleDownloadReport}
          disabled={!insights}
          className="w-full flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-xs py-3 px-2 rounded-xl transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="h-4 w-4" />
          Download Business Insights
        </button>
      </div>
    </div>
  );
};
