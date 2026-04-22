# MACHINE LEARNING-DRIVEN CUSTOMER CHURN RISK SCORING AND DECISION-SUPPORT DASHBOARD FOR TELECOMMUNICATIONS

---

## 📌 Overview

This project develops a machine learning-driven system for predicting customer churn in the telecommunications sector and transforming those predictions into a practical decision-support tool.

The core problem addressed is not just predicting churn, but making those predictions usable for real-world decision-making. Many churn models stop at reporting accuracy or ROC-AUC scores, which doesn’t help managers decide who to prioritize or what action to take. This project bridges that gap by combining predictive modelling, risk scoring, and an interactive dashboard into one integrated workflow.

Using the IBM Telco Customer Churn dataset, the system processes customer data, generates churn probabilities, converts them into a clear 0–100 risk score, and presents the results through a manager-facing dashboard. This allows retention teams to monitor churn exposure, explore segments, and prioritise high-risk customers effectively.

---

## 🚀 Key Features

- End-to-end churn prediction pipeline (data → model → dashboard)
- Comparison of Logistic Regression and Random Forest models
- Imbalance-aware evaluation using precision, recall, F1-score, ROC-AUC
- Conversion of probabilities into a 0–100 churn risk score
- Risk segmentation into Low, Moderate, High, and Critical
- Interactive dashboard with KPI monitoring and filtering
- Customer prioritisation and export functionality

---

## 🛠 Tech Stack

- Python (pandas, NumPy, scikit-learn)
- matplotlib
- HTML, CSS, JavaScript
- Jupyter Notebook
- Netlify (deployment)

---

## ⚙️ How It Works

1. Data cleaning and preprocessing  
2. Model training (Logistic Regression and Random Forest)  
3. Evaluation using imbalance-aware metrics  
4. Conversion of probabilities into risk scores  
5. Dashboard visualisation and interaction  

---

## 🤖 Machine Learning Details

- Models: Logistic Regression, Random Forest  
- Evaluation: Stratified split + 5-fold CV  
- Final Model: Random Forest  

Key Metrics:
- F1-score: 0.6173  
- ROC-AUC: 0.8363  
- Average Precision: 0.6462  

---

## 📊 Dashboard Functionality

- Portfolio monitoring (KPIs)
- Filtering by contract, tenure, service, and risk band
- Risk distribution and segmentation views
- High-risk customer prioritisation table
- CSV export of filtered data

---

## 📁 Project Structure

```
project/
│
├── notebook/
├── data/
├── outputs/
├── dashboard/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── data.js
│
└── README.md
```

---

## ▶️ Installation / How to Run

1. Clone the repository  
2. Run the notebook  
3. Open index.html in your browser  

---

## 📈 Results / Insights

- Random Forest achieved the best balance of precision and recall  
- Risk scoring improves interpretability  
- High-risk customers can be clearly prioritised  

---

## ⚠️ Limitations

- Single dataset (IBM Telco)  
- No real-time system  
- No causal inference  

---

## 🔮 Future Improvements

- Add advanced models (XGBoost, etc.)
- Real-time scoring API
- Better explainability (SHAP)
- Improved dashboard UX

---

## 👤 Author

Nkechi Ewa Ibemgbo  
Banner ID: B01793956
