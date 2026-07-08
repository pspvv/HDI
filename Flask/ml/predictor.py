import math
import pickle
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR
MODEL_R2 = 0.9582

_model = None


def get_model():
    global _model
    if _model is None:
        model_path = MODELS_DIR / "HDI.pkl"
        with open(model_path, "rb") as f:
            _model = pickle.load(f)
    return _model


def classify_hdi(hdi_score):
    if hdi_score >= 0.8:
        return "Very High", "#10b981"
    if hdi_score >= 0.7:
        return "High", "#3b82f6"
    if hdi_score >= 0.55:
        return "Medium", "#f59e0b"
    return "Low", "#ef4444"


def compute_component_indices(life_expectancy, expected_schooling, mean_schooling, gni_per_capita):
    le_index = max(0, min(1, (life_expectancy - 20) / (85 - 20)))
    eys_index = max(0, min(1, expected_schooling / 18))
    mys_index = max(0, min(1, mean_schooling / 15))
    edu_index = (eys_index + mys_index) / 2

    if gni_per_capita <= 100:
        gni_index = 0.0
    else:
        gni_index = (math.log(gni_per_capita) - math.log(100)) / (
            math.log(75000) - math.log(100)
        )
        gni_index = max(0, min(1, gni_index))

    return {
        "life_expectancy_index": round(le_index, 4),
        "education_index": round(edu_index, 4),
        "income_index": round(gni_index, 4),
    }


def validate_inputs(life_expectancy, expected_schooling, mean_schooling, gni_per_capita):
    errors = []

    try:
        life_expectancy = float(life_expectancy)
        expected_schooling = float(expected_schooling)
        mean_schooling = float(mean_schooling)
        gni_per_capita = float(gni_per_capita)
    except (TypeError, ValueError):
        return None, ["Please enter valid numbers for all fields."]

    if life_expectancy <= 0 or life_expectancy > 120:
        errors.append("Life expectancy must be between 0 and 120 years.")
    if expected_schooling < 0 or expected_schooling > 25:
        errors.append("Expected years of schooling must be between 0 and 25.")
    if mean_schooling < 0 or mean_schooling > 25:
        errors.append("Mean years of schooling must be between 0 and 25.")
    if gni_per_capita <= 0:
        errors.append("GNI per capita must be a positive number.")

    if errors:
        return None, errors

    for key, value in (
        ("life_expectancy", life_expectancy),
        ("expected_schooling", expected_schooling),
        ("mean_schooling", mean_schooling),
        ("gni_per_capita", gni_per_capita),
    ):
        if math.isnan(value):
            errors.append(f"{key.replace('_', ' ').title()} cannot be empty.")

    if errors:
        return None, errors

    return {
        "life_expectancy": life_expectancy,
        "expected_schooling": expected_schooling,
        "mean_schooling": mean_schooling,
        "gni_per_capita": gni_per_capita,
    }, []


FEATURE_COLUMNS = [
    "Life Expectancy at Birth (2021)",
    "Expected Years of Schooling (2021)",
    "Mean Years of Schooling (2021)",
    "Gross National Income Per Capita (2021)",
]


def predict_hdi(inputs):
    model = get_model()
    input_df = pd.DataFrame([[
        inputs["life_expectancy"],
        inputs["expected_schooling"],
        inputs["mean_schooling"],
        inputs["gni_per_capita"],
    ]], columns=FEATURE_COLUMNS)

    hdi_score = float(model.predict(input_df)[0])
    hdi_score = max(0, min(1, hdi_score))

    category, color = classify_hdi(hdi_score)
    components = compute_component_indices(
        inputs["life_expectancy"],
        inputs["expected_schooling"],
        inputs["mean_schooling"],
        inputs["gni_per_capita"],
    )

    return {
        "hdi_score": round(hdi_score, 4),
        "category": category,
        "color": color,
        "confidence": round(MODEL_R2 * 100, 1),
        "input": inputs,
        "components": components,
        "percentile": round(hdi_score * 100, 1),
    }


CSV_COLUMN_MAP = {
    "life expectancy at birth (2021)": "life_expectancy",
    "expected years of schooling (2021)": "expected_schooling",
    "mean years of schooling (2021)": "mean_schooling",
    "gross national income per capita (2021)": "gni_per_capita",
    "life expectancy": "life_expectancy",
    "expected years of schooling": "expected_schooling",
    "mean years of schooling": "mean_schooling",
    "gross national income per capita": "gni_per_capita",
    "gni per capita": "gni_per_capita",
}


def predict_from_csv(file_obj):
    df = pd.read_csv(file_obj)
    df.columns = [col.strip().lower() for col in df.columns]

    mapped = {}
    for col in df.columns:
        if col in CSV_COLUMN_MAP:
            mapped[CSV_COLUMN_MAP[col]] = col

    required = [
        "life_expectancy",
        "expected_schooling",
        "mean_schooling",
        "gni_per_capita",
    ]
    missing = [field for field in required if field not in mapped]
    if missing:
        readable = ", ".join(missing)
        raise ValueError(
            f"CSV is missing required columns: {readable}. "
            "Expected columns like Life Expectancy, Expected Years of Schooling, "
            "Mean Years of Schooling, and GNI Per Capita."
        )

    country_col = None
    for candidate in ("country", "nation", "name"):
        if candidate in df.columns:
            country_col = candidate
            break

    results = []
    errors = []

    for idx, row in df.iterrows():
        label = str(row[country_col]) if country_col else f"Row {idx + 1}"
        inputs, validation_errors = validate_inputs(
            row[mapped["life_expectancy"]],
            row[mapped["expected_schooling"]],
            row[mapped["mean_schooling"]],
            row[mapped["gni_per_capita"]],
        )
        if validation_errors:
            errors.append({"row": label, "errors": validation_errors})
            continue

        prediction = predict_hdi(inputs)
        prediction["label"] = label
        results.append(prediction)

    if not results and errors:
        raise ValueError(errors[0]["errors"][0])

    return {"predictions": results, "errors": errors, "total": len(results)}
