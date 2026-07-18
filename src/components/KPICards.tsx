import React, { useState } from "react";
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  Target, 
  Receipt, 
  RotateCcw, 
  Percent, 
  Star, 
  Activity,
  ArrowUp,
  ArrowDown,
  Info
} from "lucide-react";
import { KPIMetrics } from "../types";

interface KPICardsProps {
  metrics: KPIMetrics;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
  const {
    totalNetSales,
    totalGrossSales,
    totalTransactions,
    totalUnitsSold,
    totalFootfall,
    targetAchievement,
    avgTransactionValue,
    returnRate,
    discountRate,
    conversionRate,
    avgCustomerRating,
    totalStockouts,
    avgStockouts
  } = metrics;

  const cardData = [
    {
      id: "kpi-net-sales",
      title: "Total Net Sales",
      value: totalNetSales !== null ? `$${totalNetSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null,
      description: "Net of discounts",
      tooltip: "Total revenue after all discounts and returns have been deducted.",
      icon: DollarSign,
      iconColor: "text-emerald-400",
      color: "border-slate-800/80 bg-slate-900/60 hover:border-emerald-500/30"
    },
    {
      id: "kpi-target-achievement",
      title: "Target Achievement",
      value: targetAchievement !== null ? `${targetAchievement.toFixed(2)}%` : null,
      description: totalNetSales !== null && targetAchievement !== null && targetAchievement > 0 ? `Target: $${(totalNetSales / (targetAchievement / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "",
      tooltip: "Percentage of the sales target that has been achieved.",
      icon: Target,
      iconColor: targetAchievement !== null && targetAchievement >= 100 
        ? "text-emerald-400" 
        : targetAchievement !== null && targetAchievement >= 85 
        ? "text-amber-400" 
        : "text-rose-400",
      color: "border-slate-800/80 bg-slate-900/60 hover:border-sky-500/30",
      progress: targetAchievement !== null ? Math.min(targetAchievement, 100) : null,
      trend: targetAchievement !== null ? (targetAchievement >= 100 ? "positive" : "negative") : null
    },
    {
      id: "kpi-avg-transaction",
      title: "Avg Transaction Value",
      value: avgTransactionValue !== null ? `$${avgTransactionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null,
      description: "Average spend per ticket",
      tooltip: "Calculated as Total Net Sales divided by Total Transactions.",
      icon: Receipt,
      iconColor: "text-pink-400",
      color: "border-slate-800/80 bg-slate-900/60 hover:border-pink-500/30"
    },
    {
      id: "kpi-return-rate",
      title: "Return Rate",
      value: returnRate !== null ? `${returnRate.toFixed(2)}%` : null,
      description: "Returns of net sales value",
      tooltip: "Percentage of sales value that was returned. > 5% indicates poor performance.",
      icon: RotateCcw,
      iconColor: returnRate !== null && returnRate > 5 ? "text-rose-400" : "text-slate-400",
      color: returnRate !== null && returnRate > 5 ? "border-rose-500/50 bg-rose-950/20 hover:border-rose-500" : "border-slate-800/80 bg-slate-900/60 hover:border-rose-500/30",
      trend: returnRate !== null ? (returnRate > 5 ? "negative" : "positive") : null
    },
    {
      id: "kpi-discount-rate",
      title: "Discount Rate",
      value: discountRate !== null ? `${discountRate.toFixed(2)}%` : null,
      description: "Discounts of gross sales",
      tooltip: "Percentage of gross sales given as discounts.",
      icon: Percent,
      iconColor: "text-orange-400",
      color: "border-slate-800/80 bg-slate-900/60 hover:border-orange-500/30"
    },
    {
      id: "kpi-transactions",
      title: "Total Transactions",
      value: totalTransactions !== null ? totalTransactions.toLocaleString() : null,
      description: "Successful sales receipts",
      tooltip: "Total count of individual customer transactions/receipts.",
      icon: ShoppingCart,
      iconColor: "text-violet-400",
      color: "border-slate-800/80 bg-slate-900/60 hover:border-violet-500/30"
    },
    {
      id: "kpi-footfall",
      title: "Total Footfall",
      value: totalFootfall !== null ? totalFootfall.toLocaleString() : null,
      description: "Total store visitors",
      tooltip: "Total number of people who visited the stores.",
      icon: Users,
      iconColor: "text-blue-400",
      color: "border-slate-800/80 bg-slate-900/60 hover:border-blue-500/30"
    },
    {
      id: "kpi-customer-rating",
      title: "Avg Customer Rating",
      value: avgCustomerRating !== null ? `${avgCustomerRating.toFixed(2)}` : null,
      description: "Scale of 1.0 - 5.0",
      tooltip: "Average rating given by customers on a scale from 1 to 5.",
      icon: Star,
      iconColor: "text-yellow-400 fill-yellow-400/20",
      color: "border-slate-800/80 bg-slate-900/60 hover:border-amber-500/30",
      trend: avgCustomerRating !== null ? (avgCustomerRating >= 4.0 ? "positive" : "negative") : null
    },
    {
      id: "kpi-stockouts",
      title: "Stockouts",
      value: totalStockouts !== null ? totalStockouts.toLocaleString() : null,
      description: avgStockouts !== null ? `Avg: ${avgStockouts.toFixed(1)} per store` : "Stockout events",
      tooltip: "Number of times a product was out of stock. Exceeding average is a risk.",
      icon: Package,
      iconColor: (totalStockouts !== null && avgStockouts !== null && totalStockouts > avgStockouts * 1.5) ? "text-rose-400" : "text-indigo-400",
      color: (totalStockouts !== null && avgStockouts !== null && totalStockouts > avgStockouts * 1.5) ? "border-rose-500/50 bg-rose-950/20 hover:border-rose-500" : "border-slate-800/80 bg-slate-900/60 hover:border-indigo-500/30",
      trend: (totalStockouts !== null && avgStockouts !== null) ? (totalStockouts > avgStockouts * 1.5 ? "negative" : "positive") : null
    }
  ].filter(card => card.value !== null);

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <div id="kpi-cards-grid" className="flex flex-wrap gap-4">
      {cardData.map((card) => {
        const IconComponent = card.icon;
        
        let TrendIcon = null;
        if (card.trend === "positive") {
          TrendIcon = <ArrowUp className="h-4 w-4 text-emerald-400" />;
        } else if (card.trend === "negative") {
          TrendIcon = <ArrowDown className="h-4 w-4 text-rose-400" />;
        }

        return (
          <div
            key={card.id}
            id={card.id}
            className={`relative flex-1 min-w-[220px] p-4 rounded-xl border flex flex-col justify-between shadow-xs transition duration-300 hover:shadow-lg ${card.color} backdrop-blur-md`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div 
                  className="relative cursor-help"
                  onMouseEnter={() => setActiveTooltip(card.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <Info className="h-3.5 w-3.5 text-slate-500 hover:text-slate-300 transition-colors" />
                  {activeTooltip === card.id && (
                    <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-800 text-slate-200 text-xs rounded-lg shadow-xl border border-slate-700 pointer-events-none">
                      {card.tooltip}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-800" />
                    </div>
                  )}
                </div>
              </div>
              <IconComponent className={`h-5 w-5 shrink-0 ${card.iconColor || "text-slate-400"}`} />
            </div>
            
            <div className="mt-3 flex items-end justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold tracking-tight text-white">{card.value}</span>
                  {TrendIcon && (
                    <div className={`flex items-center justify-center rounded-full p-0.5 ${card.trend === 'positive' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                      {TrendIcon}
                    </div>
                  )}
                </div>
                <p className="text-[10px] mt-1 text-slate-500 truncate" title={card.description}>
                  {card.description}
                </p>
              </div>
            </div>

            {card.progress !== undefined && card.progress !== null && (
              <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    card.progress >= 100 ? 'bg-emerald-400' : card.progress >= 85 ? 'bg-amber-400' : 'bg-rose-400'
                  }`}
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
