<div align="center">

  <img src="5. Project Development Phase/Human Development Index Code Files/Flask/static/hdi_logo.png" alt="HDI Predictor Logo" width="160"/>

  # 🌌 Human Development Index Predictor

  **A Flask-powered Machine Learning web app that predicts the UN Human Development Index (HDI) from country-level indicators — with a stunning galaxy-themed UI.**

  [![Python](https://img.shields.io/badge/Python-3.9%2B-blue?style=flat-square&logo=python)](https://python.org)
  [![Flask](https://img.shields.io/badge/Flask-3.x-black?style=flat-square&logo=flask)](https://flask.palletsprojects.com)
  [![Scikit-learn](https://img.shields.io/badge/Scikit--learn-ML-orange?style=flat-square&logo=scikit-learn)](https://scikit-learn.org)
  [![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview

The **HDI Predictor** uses a Linear Regression model (R² = **0.9582**) trained on real-world United Nations data to instantly predict a country's Human Development Index score. Enter four simple indicators and get:

- 🎯 **Predicted HDI score** with confidence level
- 📊 **Interactive radar & bar charts** (Chart.js)
- 🏷️ **Development tier classification** (Very High / High / Medium / Low)
- 🌍 **Country auto-fill** from 190+ countries
- 📂 **Batch CSV prediction** via drag-and-drop

---

## 🗂️ Project Structure & SDLC Lifecycle

This repository is structured around a complete 8-phase Systems Development Lifecycle (SDLC) representing the journey from initial brainstorming to final demonstration.

```
HDI/
│
├── 1. Brainstorming & Ideation/              # Phase 1: Problem statements & empathy maps
│   ├── Brainstorming- Idea Generation.pdf
│   ├── Define Problem Statements Template.pdf
│   └── Empathy Map Canvas.pdf
│
├── 2. Requirement Analysis/                  # Phase 2: User stories, maps & requirements
│   ├── Customer Journey Map HDI.pdf
│   ├── Data Flow Diagrams and User Stories.pdf
│   ├── Filled_Technology_Stack_HDI.pdf
│   └── Solution Requirements HDI.pdf
│
├── 3. Project Design Phase/                  # Phase 3: Solution architecture & designs
│   ├── Project Design Phase - fit templte.pdf
│   ├── Project Design Phase - proposed solution.pdf
│   └── Project Design Phase- solution arcitecture.pdf
│
├── 4. Project Planning Phase/                # Phase 4: Project plans & planning logic
│   ├── Planning logic.pdf
│   ├── Project Planning Phase - templete.pdf
│   └── Technology Stack - Template.pdf
│
├── 5. Project Development Phase/             # Phase 5: Code layout & codebase directory
│   ├── Code Layout Readability Reusability.pdf
│   ├── Coding and Solution.pdf
│   ├── GenAI Functional & Performance Testing.pdf
│   │
│   └── Human Development Index Code Files/   # ← Application Source Code Root
│       ├── Dataset/                          # Datasets (raw & preprocessed)
│       │   ├── HDI.csv                       # Raw UN dataset
│       │   └── HDI_Cleaned.csv               # Preprocessed, imputed dataset
│       │
│       ├── Flask/                            # Flask Web Application
│       │   ├── app.py                        # Entry point & app factory
│       │   ├── HDI.pkl                       # Pickled scikit-learn Linear Regression model
│       │   ├── ml/                           # Machine Learning predictions module
│       │   │   ├── __init__.py
│       │   │   └── predictor.py              # Single/batch prediction & data validation
│       │   ├── routes/                       # Flask blueprints (routes)
│       │   │   ├── home.py                   # Landing page Blueprint
│       │   │   ├── predict.py                # Prediction and APIs blueprint
│       │   │   └── about.py                  # Technology stack Blueprint
│       │   ├── static/                       # CSS, Javascript assets, Logo, Templates
│       │   └── templates/                    # Jinja2 HTML layouts (Galaxy themed)
│       │
│       └── Training/                         # Model development and notebooks
│           └── HumDevIndex.ipynb             # Jupyter Notebook for preprocessing & training
│
├── 6.Project Testing/                        # Phase 6: Performance tests & compliance reports
│   ├── Performance Testing Report.pdf
│   └── Solution Requirements.pdf
│
├── 7.Project Documentation/                  # Phase 7: Project final documentation
│   ├── Final Report Template.pdf
│   └── project Executables & Documentation.pdf
│
├── 8.Project Demonstration/                  # Phase 8: Demonstration plans & channels
│   ├── Communication channel.pdf
│   ├── Demonstration Proposed Features.pdf
│   └── Project demo planning .pdf
│
└── README.md                                 # Project README (This file)
```

---

## ✨ Application Features

| Feature | Details |
|---|---|
| **Single Prediction** | Input Life Expectancy, Expected Schooling, Mean Schooling, and GNI per Capita to instantly estimate the HDI. |
| **Batch CSV Prediction** | Drag and drop a CSV file to evaluate predictions for multiple nations at once. |
| **Country Auto-fill** | Populate standard indicators instantly from a database of 190+ countries. |
| **Visual Charting** | Radar charts showing relative index scores and bar charts highlighting input deviations. |
| **Galaxy UI** | CSS-animated starfield, twinkling animations, nebulas, and glowing glassmorphic panels. |
| **Full Responsiveness** | Fully compatible across mobile, tablet, and desktop viewports. |

---

## 🧠 Machine Learning Model Details

The ML model trained for this solution is a **Linear Regression** model, which fits the standard United Nations calculation methodology perfectly.

| Property | Value |
|---|---|
| **Algorithm** | Linear Regression (`sklearn.linear_model.LinearRegression`) |
| **R² Score** | **0.9582** |
| **Mean Absolute Error (MAE)** | **0.0216** |
| **Root Mean Squared Error (RMSE)** | **0.0326** |
| **Mean Squared Error (MSE)** | **0.0011** |
| **Data Split** | 80% Train (156 samples), 20% Test (39 samples) |
| **Input Features** | Life Expectancy, Expected Schooling, Mean Schooling, GNI Per Capita |
| **Target Variable** | Human Development Index (2021) |
| **Model Serialization** | Python Pickle (`HDI.pkl`) |

### Input Feature Metrics
- **Life Expectancy at Birth (2021)**: Estimated range 40 – 90 years.
- **Expected Years of Schooling (2021)**: Average years of school expected, range 0 – 25 years.
- **Mean Years of Schooling (2021)**: Average years of school completed, range 0 – 15 years.
- **Gross National Income Per Capita (2021)**: Log-transformed income indices, range 100 – 100,000+ USD.

### Output Tier Classification
- **Very High Development**: HDI Score $\ge$ 0.800
- **High Development**: HDI Score between 0.700 and 0.799
- **Medium Development**: HDI Score between 0.550 and 0.699
- **Low Development**: HDI Score < 0.550

---

## 🛠️ Technology Stack

- **Backend**: Flask (Python 3.x)
- **Machine Learning**: Scikit-learn, Pandas, NumPy, Seaborn (for EDA heatmaps)
- **Frontend CSS**: Tailwind CSS (CDN-delivered utility framework)
- **Visualization**: Chart.js 4.x (Radar and Bar charts)
- **Typography**: Google Fonts (Plus Jakarta Sans)
- **Serialization**: Python standard `pickle`

---

## ⚙️ Setup and Running Guide

Follow these steps to set up and run the project locally.

### 1 · Clone the Repository
```bash
git clone https://github.com/pspvv/HDI.git
cd HDI
```

### 2 · Create and Activate a Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3 · Install Dependencies
Install all required libraries using pip:
```bash
pip install flask scikit-learn pandas numpy matplotlib seaborn
```

### 4 · Run the Web Server
Navigate to the Flask application path inside **Phase 5** and run the entrypoint:
```bash
cd "5. Project Development Phase\Human Development Index Code Files\Flask"
python app.py
```

### 5 · Open in Browser
Visit `http://localhost:5000` to interact with the application.

---

## 🌐 API Routes Reference

| Route | Method | Description |
|---|---|---|
| `/` | GET | Home landing page |
| `/predict` | GET/POST | Single prediction form input and response renderer |
| `/about` | GET | Technical stack details & about section |
| `/api/countries` | GET | Fetches pre-populated country indicators list from `HDI_Cleaned.csv` |
| `/api/predict` | POST | Expects JSON payload and returns prediction estimates |
| `/api/predict/csv` | POST | Expects multipart CSV file for batch updates |

---

## 👤 Author
- **Sandeep** — [GitHub Profile](https://github.com/pspvv)

---

## 📄 License
This project is licensed under the **MIT License**.
