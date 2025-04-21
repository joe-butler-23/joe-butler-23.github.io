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

<div id="pca-plot" style="width:100%;height:600px;"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  function groupBy(arr, keyFn) {
    return arr.reduce((acc, x) => {
      const k = keyFn(x);
      (acc[k] = acc[k] || []).push(x);
      return acc;
    }, {});
  }

  fetch('{{ "/assets/data/pca_data.json" | relative_url }}')
    .then(r => r.json())
    .then(data => {
      const clusters = groupBy(data, d => d.Cluster);
      const traces = Object.entries(clusters).map(([cluster, pts]) => ({
        x: pts.map(p => +p.PC1),
        y: pts.map(p => +p.PC2),
        text: pts.map(p => p.ObesityClass),
        mode: 'markers',
        type: 'scatter',
        name: `Cluster ${cluster}`,
        marker: { size: 6 },
        hovertemplate:
          'Cluster: %{name}<br>' +
          'Class: %{text}<br>' +
          'PC1: %{x:.2f}<br>' +
          'PC2: %{y:.2f}<extra></extra>'
      }));

      const layout = {
        title: 'PCA + K-Means Clusters',
        xaxis: { title: 'Principal Component 1' },
        yaxis: { title: 'Principal Component 2' },
        legend: { title: { text: 'Cluster' } },
        hovermode: 'closest',
        margin: { t: 50, b: 50, l: 50, r: 50 }
      };

      Plotly.newPlot('pca-plot', traces, layout, { responsive: true });
    })
    .catch(console.error);
});
</script>

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
