import * as XLSX from "xlsx";
import { SalesEntry, StoreMaster, MergedDataRow } from "./types";

// Standard Sample Store Master
export const sampleStores: StoreMaster[] = [
  { storeId: "S01", storeName: "Metro Center Chicago", region: "Midwest", city: "Chicago", storeFormat: "Superstore" },
  { storeId: "S02", storeName: "Bay Area Elite", region: "West", city: "San Francisco", storeFormat: "Flagship" },
  { storeId: "S03", storeName: "Manhattan Hub", region: "East", city: "New York", storeFormat: "Flagship" },
  { storeId: "S04", storeName: "Seattle Sound", region: "West", city: "Seattle", storeFormat: "Express" },
  { storeId: "S05", storeName: "Miami Breeze", region: "South", city: "Miami", storeFormat: "Boutique" },
  { storeId: "S06", storeName: "Dallas Frontier", region: "South", city: "Dallas", storeFormat: "Superstore" }
];

// Seed dynamic sample data for realistic dashboard look-and-feel (6 stores * 5 categories * 8 weeks = 240 rows)
export function generateSampleSales(): SalesEntry[] {
  const categories = ["Electronics", "Apparel", "Home & Kitchen", "Footwear", "Beauty"];
  const weeks = ["W01", "W02", "W03", "W04", "W05", "W06", "W07", "W08"];
  const sales: SalesEntry[] = [];

  // Seed repeatable random generator for consistent data across runs
  let seed = 42;
  function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  for (const week of weeks) {
    for (const store of sampleStores) {
      for (const category of categories) {
        // Base gross sales depends on store format and category
        let baseGross = 15000;
        if (store.storeFormat === "Flagship") baseGross = 32000;
        else if (store.storeFormat === "Superstore") baseGross = 24000;
        else if (store.storeFormat === "Boutique") baseGross = 12000;
        
        if (category === "Electronics") baseGross *= 1.4;
        else if (category === "Beauty") baseGross *= 0.8;

        const randVal = random();
        const grossSales = Math.round(baseGross * (0.8 + randVal * 0.4));
        const discountRate = 0.05 + random() * 0.12; // 5% to 17%
        const discountAmount = Math.round(grossSales * discountRate);
        const netSales = grossSales - discountAmount;

        // Returns depend on category and a bit of store format
        let baseReturnRate = 0.03; // 3%
        if (category === "Apparel") baseReturnRate = 0.08; // higher apparel returns
        else if (category === "Footwear") baseReturnRate = 0.06;
        const returnRate = baseReturnRate + random() * 0.04;
        const returnsAmount = Math.round(netSales * returnRate);

        // Footfall and Transactions
        let baseFootfall = store.storeFormat === "Flagship" ? 4000 : store.storeFormat === "Superstore" ? 3000 : 1500;
        const footfall = Math.round(baseFootfall * (0.85 + random() * 0.3));
        const conversionRate = 0.15 + random() * 0.10; // 15% to 25%
        const transactions = Math.round(footfall * conversionRate);

        // Units Sold
        const avgUnitsPerTx = category === "Electronics" ? 1.2 : category === "Apparel" ? 2.2 : 1.8;
        const unitsSold = Math.round(transactions * avgUnitsPerTx);

        // Sales target slightly below or above net sales
        const salesTarget = Math.round(baseGross * 0.95);

        // Stockout properties
        const stockoutRiskVal = random();
        const stockoutRisk = stockoutRiskVal > 0.85 ? "High" : stockoutRiskVal > 0.60 ? "Medium" : "Low";
        const stockoutEvents = stockoutRisk === "High" ? (random() > 0.4 ? 1 : 0) : 0;

        // Customer Rating depends on store performance & random
        let baseRating = store.region === "West" ? 4.5 : store.region === "East" ? 4.1 : 3.9;
        if (stockoutRisk === "High") baseRating -= 0.5;
        const customerRating = Math.round((baseRating + random() * 0.6) * 10) / 10;

        sales.push({
          week,
          storeId: store.storeId,
          grossSales,
          netSales,
          transactions,
          unitsSold,
          footfall,
          salesTarget,
          returnsAmount,
          discountAmount,
          productCategory: category,
          stockoutRisk,
          stockoutEvents,
          customerRating: Math.min(5.0, Math.max(1.0, customerRating))
        });
      }
    }
  }

  return sales;
}

export const defaultSalesData: SalesEntry[] = generateSampleSales();

// Helper to download templates
export function downloadStoreMasterTemplate() {
  const ws = XLSX.utils.json_to_sheet(sampleStores);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Store Master");
  XLSX.writeFile(wb, "store_master.xlsx");
}

export function downloadWeeklySalesTemplate() {
  const ws = XLSX.utils.json_to_sheet(defaultSalesData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Weekly Sales");
  XLSX.writeFile(wb, "retail_weekly_sales.xlsx");
}

// Function to read Store Master excel file
export function parseStoreMasterFile(file: File): Promise<StoreMaster[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return reject(new Error("No data loaded from file"));
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        // Map and validate fields to ensure StoreMaster compatibility
        const stores: StoreMaster[] = jsonData.map((row, index) => {
          const storeId = String(row.storeId || row.store_id || row["Store ID"] || `ST${100 + index}`);
          const storeName = String(row.storeName || row.store_name || row["Store Name"] || `Store ${storeId}`);
          const region = String(row.region || row.Region || "Unknown");
          const city = String(row.city || row.City || "Unknown");
          const storeFormat = String(row.storeFormat || row.store_format || row["Store Format"] || "Standard");

          return { storeId, storeName, region, city, storeFormat };
        });

        if (stores.length === 0) {
          reject(new Error("The uploaded Store Master file has no valid rows."));
        } else {
          resolve(stores);
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Error reading Store Master Excel file."));
    reader.readAsBinaryString(file);
  });
}

// Function to read Weekly Sales excel file
export function parseWeeklySalesFile(file: File): Promise<SalesEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return reject(new Error("No data loaded from file"));
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const sales: SalesEntry[] = jsonData.map((row, index) => {
          // Helper for case-insensitive key lookup
          const getVal = (keys: string[], defaultVal: any = null) => {
            for (const key of keys) {
              // Try exact match first
              if (row[key] !== undefined && row[key] !== null && row[key] !== "") return row[key];
              // Try case-insensitive
              const lowerKey = key.toLowerCase();
              const foundKey = Object.keys(row).find(k => k.toLowerCase() === lowerKey);
              if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && row[foundKey] !== "") return row[foundKey];
            }
            return defaultVal;
          };

          const week = String(getVal(["week_start_date", "week_start", "week", "Week"], "W01"));
          const storeId = String(getVal(["store_name", "storeName", "storeId", "store_id", "Store ID"], "S01"));
          
          const grossSales = Number(getVal(["gross_sales", "grossSales", "Gross Sales"], 0));
          const netSales = Number(getVal(["net_sales", "netSales", "Net Sales"], 0));
          const transactions = Number(getVal(["transactions", "Transactions"], 0));
          const unitsSold = Number(getVal(["units_sold", "unitsSold", "Units Sold"], 0));
          const footfall = Number(getVal(["footfall", "Footfall"], 0));
          const salesTarget = Number(getVal(["sales_target", "salesTarget", "Sales Target"], 0));
          const returnsAmount = Number(getVal(["returns_amount", "returnsAmount", "Returns Amount"], 0));
          const discountAmount = Number(getVal(["discount_amount", "discountAmount", "Discount Amount"], 0));
          const productCategory = String(getVal(["product_category", "productCategory", "Product Category"], "General"));
          
          let stockoutRisk: "Low" | "Medium" | "High" = "Low";
          const riskStr = String(getVal(["stockout_risk", "stockoutRisk", "Stockout Risk"], "Low")).trim().toLowerCase();
          if (riskStr === "high") stockoutRisk = "High";
          else if (riskStr === "medium") stockoutRisk = "Medium";

          const stockoutEvents = Number(getVal(["stockout_events", "stockoutEvents", "Stockout Events"], (stockoutRisk === "High" ? 1 : 0)));
          const customerRating = Number(getVal(["customer_rating", "customerRating", "Customer Rating"], 4.0));

          return {
            week,
            storeId,
            grossSales,
            netSales,
            transactions,
            unitsSold,
            footfall,
            salesTarget,
            returnsAmount,
            discountAmount,
            productCategory,
            stockoutRisk,
            stockoutEvents,
            customerRating
          };
        });

        if (sales.length === 0) {
          reject(new Error("The uploaded Weekly Sales file has no valid rows."));
        } else {
          resolve(sales);
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Error reading Weekly Sales Excel file."));
    reader.readAsBinaryString(file);
  });
}

// Function to export filtered data to CSV
export function exportToCSV(data: MergedDataRow[], filename: string) {
  if (data.length === 0) return;
  const headers = [
    "Week", "Store ID", "Store Name", "Region", "City", "Store Format",
    "Product Category", "Gross Sales ($)", "Net Sales ($)", "Transactions",
    "Units Sold", "Footfall", "Sales Target ($)", "Returns Amount ($)",
    "Discount Amount ($)", "Stockout Risk", "Customer Rating"
  ];

  const csvRows = [headers.join(",")];
  for (const row of data) {
    const values = [
      row.week,
      row.storeId,
      `"${row.storeName.replace(/"/g, '""')}"`,
      `"${row.region.replace(/"/g, '""')}"`,
      `"${row.city.replace(/"/g, '""')}"`,
      `"${row.storeFormat.replace(/"/g, '""')}"`,
      `"${row.productCategory.replace(/"/g, '""')}"`,
      row.grossSales,
      row.netSales,
      row.transactions,
      row.unitsSold,
      row.footfall,
      row.salesTarget,
      row.returnsAmount,
      row.discountAmount,
      row.stockoutRisk,
      row.customerRating
    ];
    csvRows.push(values.join(","));
  }

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
