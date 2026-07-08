from flask import Flask, render_template

from ml.predictor import get_model
from routes.home import home_bp
from routes.predict import predict_bp
from routes.about import about_bp


def create_app():
    app = Flask(__name__)
    app.config["GITHUB_URL"] = (
        "https://github.com/pspvv/HDI"
    )

    app.register_blueprint(home_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(about_bp)

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template("index.html"), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template("index.html"), 500

    try:
        get_model()
        print("[OK] Model loaded successfully!")
    except Exception as e:
        print(f"[ERROR] Error loading model: {e}")

    return app


app = create_app()


if __name__ == "__main__":
    print("=" * 60)
    print("HDI Predictor Web Application")
    print("=" * 60)
    print("\n[OK] Flask app initialized successfully!")
    print("[OK] Starting server at http://localhost:5000")
    print("\nPress Ctrl+C to stop the server\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
