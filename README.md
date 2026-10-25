# UK Wholesale Power | Day-Ahead Wind Generation & Procurement Analytics

A full-stack enterprise analytics platform built for UK energy utilities to evaluate wind generation forecasts from the **Elexon BMRS API** (`FUELHH` and `WINDFOR` streams) for January 2026.

---

## 🚀 Project Overview
Energy utility traders buying electricity in the UK Day-Ahead Market must commit to purchases by **11:00 AM on Day D-1**. Because wind generation is weather-dependent, accurate forecasting is critical to determine the **Thermal Procurement Gap** (backup power needed from gas/coal plants).

This application provides:
1. **Day-Ahead Decision Support:** Visualizes actual wind generation vs. day-ahead forecasts filtered by the 11:00 AM gate closure rule across all 48 settlement periods.
2. **Quantitative Error Analytics:** Computes key risk metrics (**MAE, RMSE, Forecast Bias, MAPE**) to help risk teams quantify forecast error.
3. **Thermal Gap Calculator:** Highlights the exact MW deficit relative to UK demand baselines.

---

## 📂 File & Directory Structure

```text
uk-energy-pilot-2026/
├── backend/
│   ├── Dockerfile
│   ├── data_engine.py       # Pandas data processing & Elexon BMRS stream handler
│   ├── main.py              # FastAPI REST endpoints
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── App.jsx          # Main React dashboard & Recharts visualizers
│   │   ├── main.jsx
│   │   └── index.css        # Tailwind CSS styling
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml       # Container orchestration for local testing
└── README.md
