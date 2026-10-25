from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from data_engine import ElexonDataEngine
import pandas as pd

app = FastAPI(
    title="UK Wind Power Day-Ahead Trading API",
    description="Backend service providing actual vs day-ahead forecast analysis for Elexon BMRS January 2026 data.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = ElexonDataEngine()
dataset_df = engine.get_january_2026_data()


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Elexon BMRS Procurement API",
        "target_period": "January 2026",
        "loaded_records": len(dataset_df)
    }


@app.get("/api/wind/daily")
def get_daily_wind_data(
    date: str = Query(default="2026-01-01", description="Date string in YYYY-MM-DD format")
):
    filtered = dataset_df[dataset_df["settlementDate"] == date]

    if filtered.empty:
        return {
            "error": f"No data found for date {date}. Please select a valid date between 2026-01-01 and 2026-01-31."
        }

    daily_metrics = engine.compute_metrics(filtered)
    records = filtered.to_dict(orient="records")
    for record in records:
        if isinstance(record["startTime"], pd.Timestamp):
            record["startTime"] = record["startTime"].isoformat()

    return {
        "date": date,
        "metrics": daily_metrics,
        "settlementPeriods": records
    }


@app.get("/api/analytics/summary")
def get_monthly_summary():
    overall_metrics = engine.compute_metrics(dataset_df)

    period_profile = dataset_df.groupby("settlementPeriod").agg({
        "absoluteErrorMW": "mean",
        "errorMW": "mean",
        "actualGenerationMW": "mean",
        "forecastGenerationMW": "mean"
    }).reset_index()

    period_profile.columns = ["settlementPeriod", "avgMAE", "avgBias", "avgActual", "avgForecast"]
    period_profile = period_profile.round(2).to_dict(orient="records")

    return {
        "overallMetrics": overall_metrics,
        "settlementPeriodProfile": period_profile
    }