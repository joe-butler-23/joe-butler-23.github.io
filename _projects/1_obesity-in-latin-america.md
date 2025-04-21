---
layout: distill
title: Uncovering Patterns in Obesity Risk Factors
description: supervised & unsupervised analysis of obesity risk in Latin America
date: 2025-04-21
category: Msc
importance: 4
chart:
  plotly: true
authors:
  - name: Joe Butler
    url: "https://joe-butler-23.github.io"
toc:
  - name: Summary
  - name: Dataset Exploration
  - name: Unsupervised learning
  - name: Supervised learning 
  - name: Key insights & recommendations
  - name: Technical implementation
---

<style>
/* Button container to space them out */
.button-container {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
}

/* Base button styles */
.button-container .btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #0074D9;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.2s ease;
}

.button-container .btn:hover {
  background-color: #005fa3;
}
</style>

<div class="button-container">
  <!-- GitHub repo button -->
  <a class="btn" href="https://github.com/joe-butler-23/obesity-in-latin-america"
     target="_blank" rel="noopener">
    Github repo
  </a>

  <!-- Download report button -->
  <a class="btn" href="{{ '/assets/files/obesity-report.pdf' | relative_url }}"
     download>
    Download pdf of full report
  </a>
</div>


## Summary

This project demonstrates an end-to-end machine learning workflow analyzing obesity risk factors in a dataset from the UCI Machine Learning Repository. The analysis reveals complex, non-linear relationships between lifestyle factors and obesity through both supervised and unsupervised techniques.

- **Dataset**: 2,111 observations × 17 variables, 77% synthetic data, target = 7-class obesity level
- **Exploration**: Correlation analysis reveals unexpected positive link between vegetable frequency (FCVC) and BMI (ρ = 0.26), negative correlation between physical activity (FAF) and BMI (ρ = -0.18)
- **Unsupervised Learning**: K-Means clustering with PCA dimensionality reduction identifies 4 distinct risk profiles
- **Supervised Learning**: Decision Tree (excluding height/weight) achieves 71% accuracy with macro-F1 ≈ 0.69
- **Key Finding**: Screen time (15.8%) and vegetable consumption (15.4%) emerge as the strongest lifestyle predictors

## Dataset Exploration

The dataset contains 2,111 observations across 17 variables from Mexico, Peru, and Colombia, with approximately 77% synthetic data created via SMOTE. The target variable categorizes individuals into seven BMI-based groups from "Insufficient Weight" to "Obesity Type III."

Key variables include demographic data (age, gender), family history, eating habits (meal frequency, vegetable consumption, snacking patterns), physical activity levels, and transportation modes.

Initial exploration revealed:

- Age distribution is right-skewed (mean ≈ 24.3 years) with limited representation for individuals over 40
- BMI positively correlates with vegetable consumption frequency (FCVC), contradicting expected dietary benefits
- Strong negative correlation between age and screen time (TUE) (ρ = -0.30)
- Family history of overweight approximately doubles obesity rate in binary analysis
- Transportation heavily skewed toward public transit with minimal active transport (<3% cycling/walking)

<div id="correlation-heatmap"></div>

## Unsupervised Learning

K-Means clustering with PCA dimensionality reduction was implemented to identify natural groupings in the multivariate data:

```python
# Preprocessing pipeline with dimensionality reduction
preprocessor = Pipeline([
    ('encoder', OneHotEncoder(drop='first', sparse=False, handle_unknown='ignore')),
    ('scaler', StandardScaler()),
    ('pca', PCA(n_components=0.95))  # Retain 95% variance (9 PCs)
])

# Determine optimal clusters using silhouette score
X_processed = preprocessor.fit_transform(X)
silhouette_scores = [silhouette_score(X_processed, 
                     KMeans(n_clusters=k, random_state=42).fit_predict(X_processed))
                     for k in range(2, 11)]
```

The analysis identified four distinct clusters with unique obesity risk profiles:

```plotly
{
  "data": [
    {
      "x": [1.5481, 0.5300, -0.7621, -1.2624, 0.5427, 1.4545, 1.7198, 0.6082, -0.4059, 0.3320, -2.4638, -0.0762, -0.0661, -1.4537, 1.1441, 0.2125, -0.5944, 2.4193, 0.3274, 1.8180, -0.0434, 0.5552, 0.6877, 2.1666, -0.2529, 0.6685, 1.1411, 0.9772, -0.8909, 0.22397, -0.6290, 2.4561, -0.5165, 0.2653, 0.2932, 1.6128, 2.2415, 2.2379, 0.7047, -1.4149, 0.5280, 0.8179, 2.0531, 0.6920, -0.4295, 2.6116, -1.0044, -0.5659, 0.6971, 2.2319, 0.8277, 3.2305, 1.6493, 0.7521, 0.2508, 0.7008, 1.1816, 1.8140, 1.4684, -0.8802, 0.7342, 0.4603, 1.7478, 1.0879, 1.7374, 1.7051, -0.1064, 0.3857, -0.7681, -0.3850, 1.0746, -0.0862, 0.5282, -1.2936, -0.3317, 0.3534, 1.5759, -0.0248, 0.1206, 1.1474, 1.4604, -0.5528, 0.6263, 0.6236, 0.3407, 1.2528, -0.5776, -0.4271, 1.0151, 0.10898, 0.2286, 1.3510, -2.6861, 1.4499, 1.1429, 0.4729, 0.3679, 3.6803, 3.6803, -0.2925, 2.1317, 0.8512, 1.1945, 0.4382, 1.1408, 2.1196, 2.1196, -0.2628, -1.5622, 0.0812, -0.0431, 3.1433, 1.4683, 2.4145, 1.6919, 0.6737, 0.3154, 0.3842, 1.1826, -0.2466, 0.9874, -0.7114, 0.4425, 1.1416, 0.2286, 0.1462, 0.6835, 1.0411, 0.8535, -0.7351, 1.3904, 1.8435, 0.3447, 0.3065, -1.1190, 0.1252, -0.3008, 0.2067, -1.4656, 0.8891, -1.5956, -1.1138, 0.1784, 1.7361, -0.1880, 1.0190, 1.3703, 1.0702, 1.4502, 0.2131, 0.09495, 0.5059, 2.8346, -0.8835, -0.2154, 1.1771, 2.6720, 0.5207, 0.7896, 1.3470, -0.4416, 0.1193, 0.6763, -1.5633, -0.0079, 1.1156, 0.5591, -1.4134, 3.2808, 0.49596, 0.51671, 1.6502, 2.2983, 1.2354, -1.60499, 1.4185, 0.02880, -0.01398, 1.0168, 2.0666, -0.04566, 0.9483, -0.04921, 2.00798, 0.30654, 2.6486, -1.9866, -0.58495, -0.09312, 1.16393, -0.33297, -0.71711, 2.8972, 1.4801, -0.31036, 0.40668, -0.48923, 1.22382, 0.02564, -1.28078, 1.98016, -1.41369, -1.46396, 2.28654, 3.34285, -1.66897, 2.8972, -0.47974, 0.17613, 1.33331, 1.34172, 1.33553, 0.74319, -0.10478, -0.37912, 2.79247, 2.44810, 1.28131, -0.39612, 0.02399, -0.91932, 1.48519, 3.09272, -0.19798, 0.33527, -0.60267, 1.12818, 0.09771, 0.22593, 0.00095, -0.69846, 2.60353, 1.08556, 0.95029, -0.69083, 1.91597, 2.46765, -0.39660, 2.38882, -1.01871, 0.06639, -3.44298, 0.10053, 2.20274, -1.41922, -1.05588, -3.03172, 0.14287, 0.33449, 2.22388, 2.03664, 1.64345, 2.63570, -1.34118, 1.74530, 0.04516, 1.70187, -0.05545],
      "y": [-0.5667, -0.8464, -1.4775, 0.2923, 0.7678, 0.8743, 0.6386, -1.3812, -0.5602, -1.1269, -1.4919, -1.4417, -0.6184, 0.5812, -0.1292, -1.2105, 0.8958, 1.8565, 1.6498, 0.9558, -2.4933, 4.3155, 0.3455, -0.8657, -0.9092, -3.3738, -1.4118, -1.6241, -1.8654, -2.1085, -0.7117, 1.5144, -0.9986, 2.3226, -1.0598, -1.9819, -0.5258, -0.2296, -0.8767, -1.1819, -0.0941, -0.0685, -0.0763, -1.0829, -1.3902, -0.1505, -1.6459, -1.5259, 0.1014, 0.1922, -0.2406, 0.3852, -1.4964, -0.9967, -0.8587, 0.0207, -0.2671, -0.4888, -0.4640, -3.1302, -2.1665, -2.2939, 0.6393, -1.3725, -1.0631, -0.9309, -1.6004, 0.0465, 1.2776, -0.8687, -1.0561, -1.2711, -0.2649, -2.1950, -0.2786, -0.4826, -0.0395, 0.4887, -0.1908, 0.2944, 0.3022, 1.0896, -0.2959, -0.7274, -0.0883, 0.2274, -0.2717, -0.0327, -0.1558, 0.1367, 0.2835, -0.2476, 1.9984, -0.0680, -0.2239, 0.4888, -1.1031, 1.1655, 1.1655, -1.9739, 1.1377, 0.0816, -0.8881, -0.0517, 2.34596, 0.04996, 0.04996, -0.4188, -2.6554, -0.5017, -0.2241, 0.9474, -0.7804, -0.5846, -0.4640, -0.8416, -2.3652, -1.2927, -0.9878, -1.1620, -1.0385, -1.6027, -0.2353, 0.8077, 1.0445, -0.1064, -0.5426, 0.1557, 0.5829, -0.1432, -1.4512, -0.1085, -1.8608, 2.9842, 1.1502, 0.1601, -0.8739, 2.52097, -0.2596, -0.4605, -1.04356, -0.4755, -0.4431, 2.63693, -2.5653, 0.11526, -1.6965, 2.61835, 1.20006, 1.61655, -0.83899, 0.04651, 1.26823, 0.65824, -0.8687, -1.0561, -1.2711, 0.04651, ...],
      "mode": "markers",
      "type": "scatter",
      "name": "Cluster 0",
      "marker": { "size": 6 },
      "text": ["Normal_Weight", "Normal_Weight", ...],
      "hovertemplate": "Cluster: %{name}<br>Class: %{text}<br>PC1: %{x:.2f}<br>PC2: %{y:.2f}<extra></extra>"
    },
    {
      /* Cluster 1 trace with full x, y, text arrays */
    },
    {
      /* Cluster 2 trace with full x, y, text arrays */
    },
    {
      /* Cluster 3 trace with full x, y, text arrays */
    }
  ],
  "layout": {
    "title": "PCA + K‑Means Clusters",
    "xaxis": { "title": "Principal Component 1" },
    "yaxis": { "title": "Principal Component 2" },
    "legend": { "title": { "text": "Cluster" } },
    "hovermode": "closest"
  }
}
```

| Cluster | Primary Obesity Class | Key Characteristics (top z-scores) |
| ------- | --------------------- | ---------------------------------- |
| C0 | Overweight Level I | Fewer meals (NCP), frequent snacking (CAEC), public transport use |
| C1 | Normal Weight | Frequent snacking & high-calorie foods but higher physical activity |
| C2 | Obesity Type III | Family history, high-calorie foods, significant vegetable intake |
| C3 | Overweight Level II | Higher age, family history, high-calorie foods |

Cluster 2's strong association with Obesity Type III despite significant vegetable intake highlights the complex interplay between genetic and behavioral factors that challenge simplistic obesity risk models.

## Supervised Learning

Decision tree analysis employed a three-tiered approach to isolate lifestyle factors' influence:

```python
# Three modeling approaches with progressive feature exclusion
models = {
    'full_model': DecisionTreeClassifier(random_state=42).fit(X_train, y_train),
    'no_anthropometric': DecisionTreeClassifier(random_state=42).fit(X_train_no_anthro, y_train),
    'lifestyle_only': DecisionTreeClassifier(random_state=42).fit(X_train_lifestyle, y_train)
}

# Hyperparameter optimization for final model
param_grid = {
    'max_depth': [None, 5, 10, 15, 20],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4, 8]
}

optimized_tree = GridSearchCV(
    DecisionTreeClassifier(random_state=42),
    param_grid=param_grid,
    cv=5,
    scoring='accuracy'
).fit(X_train_lifestyle, y_train).best_estimator_
```

The modeling results showed:
- Full dataset model: 93% accuracy (height/weight dominate)
- No anthropometrics: 75% accuracy (clusters emerge as top predictor)
- Lifestyle factors only: 71% accuracy (macro-F1 = 0.69)

Feature importance analysis identified the top five lifestyle predictors:
1. Screen time (TUE): 15.8%
2. Vegetable consumption (FCVC): 15.4%
3. Water intake (CH2O): 12.8%
4. Number of main meals (NCP): 11.1%
5. Physical activity frequency (FAF): 10.0%

The confusion matrix revealed strong classification performance for Obesity Type III (F1 = 0.96) but weaker discrimination for the Overweight categories.

## Key Insights

The analysis yielded several actionable insights:

1. **Screen time as a risk amplifier**: The decision tree revealed that high vegetable consumption's typically protective effect is neutralized when combined with high screen time, suggesting sedentary behavior amplifies dietary risk factors

2. **Family history significance**: Family history of obesity emerged as a strong predictor across multiple clusters, approximately doubling obesity risk

3. **Complex factor interactions**: The counterintuitive positive correlation between vegetable consumption and BMI highlights the need for multivariate analysis rather than univariate approaches

4. **Active transport opportunity**: The heavy skew toward public transportation (with minimal cycling/walking) suggests potential for interventions promoting active transport

5. **Age-specific patterns**: Distinct risk profiles emerged across age groups, with different behavioral factors dominating at different life stages

## Technical Implementation

The analysis employed rigorous data science methodology throughout:

- **Data preprocessing**: Categorical encoding (one-hot, ordinal), z-score normalization
- **Feature engineering**: BMI calculation, categorical transformations, PCA dimensionality reduction
- **Model validation**: Cross-validation, silhouette scoring, confusion matrices, precision-recall analysis
- **Hyperparameter tuning**: Grid search for optimal decision tree parameters
- **Pipeline construction**: scikit-learn pipelines to prevent data leakage
- **Environment**: Python 3.12 with NumPy, pandas, scikit-learn, Matplotlib, Seaborn

The implementation addresses several technical challenges:
- Appropriate encoding of categorical variables
- Mitigating the dominance of anthropometric measurements
- Quantifying the relative importance of lifestyle factors

The complete code, including notebooks for each analysis phase, is available in the GitHub repository linked below.

<d-footnote>Full code and interactive visualizations available at: [github.com/joe-butler-23/obesity-in-latin-america](https://github.com/joe-butler-23/obesity-in-latin-america)</d-footnote>
