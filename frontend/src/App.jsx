import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';
import { Activity, ShieldAlert, TrendingUp, Calendar, Zap, CheckCircle2, ArrowUpRight } from 'lucide-react';

const API_BASE_URL = "https://uk-energy-backend-albn.onrender.com/api";

export default function App() {
  const [selectedDate, setSelectedDate] = useState("2026-01-01");
  const [dailyData, setDailyData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loadedDate, setLoadedDate] = useState(null);

  // Fetch daily settlement data when date changes
  useEffect(() => {
    fetch(`${API_BASE_URL}/wind/daily?date=${selectedDate}`)
      .then(res => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then(data => {
        setDailyData(data);
      })
      .catch(err => {
        console.error("Error fetching daily data:", err);
        setDailyData(null);
      })
      .finally(() => {
        setLoadedDate(selectedDate);
      });
  }, [selectedDate]);

  // Fetch monthly summary metrics on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/analytics/summary`)
      .then(res => res.json())
      .then(data => setSummaryData(data))
      .catch(err => console.error("Error fetching summary:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">UK Wholesale Power | Day-Ahead Procurement</h1>
              <p className="text-xs text-slate-400">Elexon BMRS Wind Generation Forecast & Accuracy Analytics (Jan 2026 Pilot)</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Live BMRS Feed Connected
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Executive KPI Summary Cards */}
        {summaryData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl shadow-lg">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mean Absolute Error (MAE)</span>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-3 flex items-baseline">
                <span className="text-3xl font-extrabold text-white">{summaryData.overallMetrics.mae_mw}</span>
                <span className="ml-2 text-sm font-medium text-slate-400">MW</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Average absolute forecast deviation across Jan 2026</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl shadow-lg">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Root Mean Square Error (RMSE)</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3 flex items-baseline">
                <span className="text-3xl font-extrabold text-white">{summaryData.overallMetrics.rmse_mw}</span>
                <span className="ml-2 text-sm font-medium text-slate-400">MW</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Penalizes large front volatility errors</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl shadow-lg">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Forecast Bias (Mean Error)</span>
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-3 flex items-baseline">
                <span className="text-3xl font-extrabold text-white">{summaryData.overallMetrics.bias_mw}</span>
                <span className="ml-2 text-sm font-medium text-slate-400">MW</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Positive = Over-forecasting tendency</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl shadow-lg">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mean Absolute % Error</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3 flex items-baseline">
                <span className="text-3xl font-extrabold text-white">{summaryData.overallMetrics.mape_pct}%</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Relative error against actual generation</p>
            </div>
          </div>
        )}

        {/* Controls & Date Selector Bar */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Select Delivery Date (January 2026):</span>
            <input 
              type="date" 
              min="2026-01-01" 
              max="2026-01-31" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-slate-400">
            Showing 48 Settlement Periods (30-min resolution) for <strong className="text-white">{selectedDate}</strong>
          </div>
        </div>

        {/* Main Charts Section */}
        {loadedDate !== selectedDate ? (
          <div className="h-96 flex items-center justify-center bg-slate-900/40 rounded-xl border border-slate-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : dailyData && dailyData.settlementPeriods ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart 1: Actual vs Day-Ahead Forecast */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Wind Generation: Actual vs. Day-Ahead Forecast</h3>
                  <p className="text-xs text-slate-400">Based on 11:00 AM Gate Closure Cutoff (D-1)</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData.settlementPeriods}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis 
                      dataKey="settlementPeriod" 
                      stroke="#64748b" 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => `SP ${val}`}
                    />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" MW" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="actualGenerationMW" name="Actual Wind (MW)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="forecastGenerationMW" name="Day-Ahead Forecast (MW)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Thermal Procurement Gap */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-lg">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Thermal Procurement Gap</h3>
                <p className="text-xs text-slate-400">Backup thermal power required (Demand baseline: 27.5 GW)</p>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData.settlementPeriods}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="settlementPeriod" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" MW" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Bar dataKey="thermalProcurementGapMW" name="Thermal Gap (MW)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-red-400 bg-slate-900/40 rounded-xl border border-slate-800">
            Failed to load daily wind settlement data. Please check backend connection.
          </div>
        )}

      </main>
    </div>
  );
}