export interface SalesEntry {
  week: string;
  storeId: string;
  grossSales: number | null;
  netSales: number | null;
  transactions: number | null;
  unitsSold: number | null;
  footfall: number | null;
  salesTarget: number | null;
  returnsAmount: number | null;
  discountAmount: number | null;
  productCategory: string;
  stockoutRisk: "Low" | "Medium" | "High";
  stockoutEvents: number | null; // 1 if stockout occurred, 0 otherwise
  customerRating: number | null;
}

export interface StoreMaster {
  storeId: string;
  storeName: string;
  region: string;
  city: string;
  storeFormat: string;
}

export interface MergedDataRow extends SalesEntry, StoreMaster {}

export interface FiltersState {
  week: string[];
  region: string[];
  storeName: string[];
  city: string[];
  storeFormat: string[];
  productCategory: string[];
}

export interface KPIMetrics {
  totalNetSales: number | null;
  totalGrossSales: number | null;
  totalTransactions: number | null;
  totalUnitsSold: number | null;
  totalFootfall: number | null;
  targetAchievement: number | null;
  avgTransactionValue: number | null;
  returnRate: number | null;
  discountRate: number | null;
  conversionRate: number | null;
  avgCustomerRating: number | null;
  totalStockouts: number | null;
  avgStockouts: number | null;
}
