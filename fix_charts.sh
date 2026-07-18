#!/bin/bash
cat src/components/ChartsPanel.tsx | sed -n '1,123p' > src/components/ChartsPanel.tmp.tsx

cat << 'INNER_EOF' >> src/components/ChartsPanel.tmp.tsx
  return (
    <div id="charts-container" className="flex flex-col gap-8 w-full">
      
      {/* Row 3: Weekly Sales Trend | Sales by Region */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
        {/* Weekly Net Sales Trend Line Chart */}
        <div id="chart-weekly-trend" className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md w-full min-w-0 xl:min-w-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-sky-400" />
            <h3 className="text-base font-bold text-slate-200">Revenue over Time</h3>
          </div>
          <div className="h-[400px] min-h-[400px] w-full">
            {weeklyTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data matches current filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, undefined]}
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#f8fafc" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
                  <Line 
                    type="monotone" 
                    dataKey="netSales" 
                    name="Net Sales" 
                    stroke="#38bdf8" 
                    strokeWidth={4} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sales by Region */}
        <div id="chart-sales-by-region" className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md w-full min-w-0 xl:min-w-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="h-6 w-6 text-sky-400" />
            <h3 className="text-base font-bold text-slate-200">Sales by Region</h3>
          </div>
          <div className="h-[400px] min-h-[400px] w-full">
            {regionSalesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data matches current filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionSalesData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="region" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, "Net Sales"]}
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#f8fafc" }}
                  />
                  <Bar dataKey="netSales" name="Net Sales" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Category Performance | Store Leaderboard */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
        {/* Product Category Performance */}
        <div id="chart-product-performance" className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md w-full min-w-0 xl:min-w-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <Tag className="h-6 w-6 text-amber-400" />
            <h3 className="text-base font-bold text-slate-200">Product Category Performance</h3>
          </div>
          <div className="h-[400px] min-h-[400px] w-full">
            {categorySalesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data matches current filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySalesData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Net Sales"]}
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#f8fafc" }}
                  />
                  <Bar dataKey="netSales" name="Net Sales" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Store Leaderboard */}
        <div id="leaderboard-panel" className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md w-full min-w-0 xl:min-w-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <Award className="h-6 w-6 text-sky-400" />
            <h3 className="text-base font-bold text-slate-200">Top Stores by Revenue</h3>
          </div>
          <div className="h-[400px] min-h-[400px] w-full">
            {storeLeaderboard.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data matches current filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storeLeaderboard} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} tickLine={false} />
                  <YAxis dataKey="storeName" type="category" stroke="#64748b" fontSize={12} tickLine={false} width={130} />
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, "Net Sales"]}
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#f8fafc" }}
                  />
                  <Bar dataKey="netSales" name="Net Sales" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={25} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 5: Target vs Actual | Stockout Risk */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
        {/* Sales Target vs Net Sales */}
        <div id="chart-target-vs-actual" className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md w-full min-w-0 xl:min-w-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-6 w-6 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-200">Sales Target vs Net Sales (by Store)</h3>
          </div>
          <div className="h-[400px] min-h-[400px] w-full">
            {targetVsSalesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data matches current filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={targetVsSalesData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="storeName" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, undefined]}
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#f8fafc" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
                  <Bar dataKey="target" name="Sales Target" fill="#334155" radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.6} />
                  <Bar dataKey="netSales" name="Net Sales" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stockout Risk */}
        <div id="chart-stockout-risk" className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md w-full min-w-0 xl:min-w-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-rose-400" />
            <h3 className="text-base font-bold text-slate-200">Stockout Risk</h3>
          </div>
          <div className="h-[400px] min-h-[400px] w-full">
            {stockoutData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data matches current filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockoutData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="storeName" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any) => [value, "Stockouts"]}
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#f8fafc" }}
                  />
                  <Bar dataKey="stockouts" name="Total Stockouts" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
INNER_EOF

mv src/components/ChartsPanel.tmp.tsx src/components/ChartsPanel.tsx
