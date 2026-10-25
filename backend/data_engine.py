import os
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class ElexonDataEngine:

    def __init__(self):
        self.actuals_url = "https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream"
        self.forecast_url = "https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream"
        self.cutoff_hour = 11
    
    def fetch_elexon_stream(self, url, params):
        try:
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            payload = response.json()
            if isinstance(payload, list):
                return payload
            if isinstance(payload, dict):
                data = payload.get("data", [])
                if isinstance(data, list):
                    return data
            print(f"Unexpected Elexon API response format for {url}")
            return []
        
        except Exception as e:
            print(f"Elexon API connection warning for {url}: {e}")
            return []
    
    def get_january_2026_data(self):
        start_str = "2026-01-01T00:00:00Z"
        end_str = "2026-01-31T23:59:59Z"

        params = {
            "publishDateTimeFrom": start_str,
            "publishDateTimeTo": end_str
        }
        raw_actuals = self.fetch_elexon_stream(self.actuals_url, params)
        raw_forecasts = self.fetch_elexon_stream(self.forecast_url, params)

        columns = [
            "startTime",
            "actualGenerationMW",
            "forecastGenerationMW",
            "settlementDate",
            "settlementPeriod",
            "errorMW",
            "absoluteErrorMW",
            "thermalProcurementGapMW",
        ]
        if not raw_actuals or not raw_forecasts:
            return pd.DataFrame(columns=columns)

        df_act = pd.DataFrame(raw_actuals)

        if "fuelType" in df_act.columns:
            df_act = df_act[df_act["fuelType"] == "WIND"]
        df_act["startTime"] = pd.to_datetime(df_act["startTime"])

        df_fc = pd.DataFrame(raw_forecasts)
        df_fc["publishTime"] = pd.to_datetime(df_fc["publishTime"])
        df_fc["startTime"] = pd.to_datetime(df_fc["startTime"])
        df_fc = df_fc.sort_values(by="publishTime", ascending=False)
        df_filtered_fc = df_fc.drop_duplicates(subset=["startTime"], keep="first")
        df_merged = pd.merge(
            df_act[["startTime", "generation"]].rename(columns={"generation": "actualGenerationMW"}),
            df_filtered_fc[["startTime", "generation"]].rename(columns={"generation": "forecastGenerationMW"}),
            on="startTime",
            how="inner"
        )
        df_merged["startTime"] = pd.to_datetime(df_merged["startTime"])
        df_merged["settlementDate"] = df_merged["startTime"].dt.strftime("%Y-%m-%d")
        df_merged["settlementPeriod"] = (df_merged["startTime"].dt.hour * 2) + (df_merged["startTime"].dt.minute // 30) + 1
        df_merged["errorMW"] = df_merged["forecastGenerationMW"] - df_merged["actualGenerationMW"]
        df_merged["absoluteErrorMW"] = np.abs(df_merged["errorMW"])

        baseline_demand = 28000.0

        df_merged["thermalProcurementGapMW"] = np.clip(baseline_demand - df_merged["actualGenerationMW"], 0, None)
        return df_merged

    def compute_metrics(self, df: pd.DataFrame) -> dict:
        """
        Computes aggregate trading accuracy indicators: MAE, RMSE, Bias, and MAPE.
        """
        if df.empty:
            return {"mae_mw": 0, "rmse_mw": 0, "bias_mw": 0, "mape_pct": 0}

        mae = float(df["absoluteErrorMW"].mean())
        rmse = float(np.sqrt((df["errorMW"] ** 2).mean()))
        bias = float(df["errorMW"].mean())

        valid = df[df["actualGenerationMW"] > 200]
        mape = float((valid["absoluteErrorMW"] / valid["actualGenerationMW"]).mean() * 100) if not valid.empty else 0.0

        return {
            "mae_mw": round(mae, 2),
            "rmse_mw": round(rmse, 2),
            "bias_mw": round(bias, 2),
            "mape_pct": round(mape, 2),
            "total_records": len(df)
        }
