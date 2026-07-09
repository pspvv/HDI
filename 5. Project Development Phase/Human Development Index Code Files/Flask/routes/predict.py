from flask import Blueprint, render_template, request, jsonify

from ml.predictor import predict_hdi, validate_inputs, predict_from_csv

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/predict", methods=["GET", "POST"])
def predict_page():
    if request.method == "POST":
        inputs, errors = validate_inputs(
            request.form.get("life_expectancy"),
            request.form.get("expected_schooling"),
            request.form.get("mean_schooling"),
            request.form.get("gni_per_capita"),
        )
        if errors:
            return render_template("predict.html", error=errors[0])

        result = predict_hdi(inputs)
        return render_template(
            "result.html",
            hdi_score=result["hdi_score"],
            category=result["category"],
            color=result["color"],
            confidence=result["confidence"],
            components=result["components"],
            life_expectancy=inputs["life_expectancy"],
            expected_schooling=inputs["expected_schooling"],
            mean_schooling=inputs["mean_schooling"],
            gni_per_capita=inputs["gni_per_capita"],
        )

    return render_template("predict.html")


@predict_bp.route("/results")
def results_page():
    return render_template("predict.html", show_results=True)


@predict_bp.route("/api/countries")
def api_countries():
    import pandas as pd
    from pathlib import Path
    try:
        csv_path = Path(__file__).resolve().parent.parent.parent / "Dataset" / "HDI_Cleaned.csv"
        df = pd.read_csv(csv_path)
        df = df.sort_values(by="Country")
        countries_data = []
        for _, row in df.iterrows():
            countries_data.append({
                "country": row["Country"],
                "life_expectancy": float(row["Life Expectancy at Birth (2021)"]),
                "expected_schooling": float(row["Expected Years of Schooling (2021)"]),
                "mean_schooling": float(row["Mean Years of Schooling (2021)"]),
                "gni_per_capita": float(row["Gross National Income Per Capita (2021)"]),
                "hdi_score": float(row["Human Development Index (2021)"])
            })
        return jsonify({"success": True, "countries": countries_data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@predict_bp.route("/api/predict", methods=["POST"])
def api_predict():
    try:
        data = request.get_json(silent=True) or {}
        inputs, errors = validate_inputs(
            data.get("life_expectancy"),
            data.get("expected_schooling"),
            data.get("mean_schooling"),
            data.get("gni_per_capita"),
        )
        if errors:
            return jsonify({"success": False, "errors": errors}), 400

        result = predict_hdi(inputs)
        return jsonify({"success": True, **result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@predict_bp.route("/api/predict/csv", methods=["POST"])
def api_predict_csv():
    try:
        if "file" not in request.files:
            return jsonify({"success": False, "error": "No file uploaded."}), 400

        file = request.files["file"]
        if not file.filename:
            return jsonify({"success": False, "error": "No file selected."}), 400

        if not file.filename.lower().endswith(".csv"):
            return jsonify({"success": False, "error": "Please upload a CSV file."}), 400

        batch = predict_from_csv(file)
        return jsonify({"success": True, **batch})
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
