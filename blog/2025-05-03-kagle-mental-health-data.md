---
title: Kaggle Mental Health Data
date: 2025-05-03T13:17:00
---
# Mental Health Risk Prediction

Welcome! In this notebook, we’re going to build a machine learning model that tries to predict whether someone is likely to seek mental health treatment based on a survey of folks working in tech.

This is a great dataset because it's a mix of real-world, messy data and important social context. We'll clean things up, explore some patterns, train a few models, and talk about which features matter most.

### Step 1: Imports and Setup

Before we can do anything useful, we need to import some Python libraries to help us work with data, visualize patterns, and train our models. If you're new to this, think of this as getting your tools out of the toolbox.

```python
# Basic packages
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

import warnings

# Suppress harmless warnings
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

# Modeling tools
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve

# Display settings
sns.set(style="whitegrid")
```

### Step 2: Load the Data

Let’s pull in the survey data and take a peek. This will help us understand what kind of information we’re working with — like age, gender, location, and whether someone has sought treatment for mental health.

```python
# Load the dataset

df = pd.read_csv("survey.csv")
df.head()
```

<div class="overflow-x-auto w-full my-6">

  <style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }
    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
  </style>
  <table border="1" class="dataframe min-w-[1000px] text-sm text-left"><div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Timestamp</th>
      <th>Age</th>
      <th>Gender</th>
      <th>Country</th>
      <th>state</th>
      <th>self\_employed</th>
      <th>family\_history</th>
      <th>treatment</th>
      <th>work\_interfere</th>
      <th>no\_employees</th>
      <th>...</th>
      <th>leave</th>
      <th>mental\_health\_consequence</th>
      <th>phys\_health\_consequence</th>
      <th>coworkers</th>
      <th>supervisor</th>
      <th>mental\_health\_interview</th>
      <th>phys\_health\_interview</th>
      <th>mental\_vs\_physical</th>
      <th>obs\_consequence</th>
      <th>comments</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2014-08-27 11:29:31</td>
      <td>37</td>
      <td>Female</td>
      <td>United States</td>
      <td>IL</td>
      <td>NaN</td>
      <td>No</td>
      <td>Yes</td>
      <td>Often</td>
      <td>6-25</td>
      <td>...</td>
      <td>Somewhat easy</td>
      <td>No</td>
      <td>No</td>
      <td>Some of them</td>
      <td>Yes</td>
      <td>No</td>
      <td>Maybe</td>
      <td>Yes</td>
      <td>No</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2014-08-27 11:29:37</td>
      <td>44</td>
      <td>M</td>
      <td>United States</td>
      <td>IN</td>
      <td>NaN</td>
      <td>No</td>
      <td>No</td>
      <td>Rarely</td>
      <td>More than 1000</td>
      <td>...</td>
      <td>Don't know</td>
      <td>Maybe</td>
      <td>No</td>
      <td>No</td>
      <td>No</td>
      <td>No</td>
      <td>No</td>
      <td>Don't know</td>
      <td>No</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2014-08-27 11:29:44</td>
      <td>32</td>
      <td>Male</td>
      <td>Canada</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>No</td>
      <td>No</td>
      <td>Rarely</td>
      <td>6-25</td>
      <td>...</td>
      <td>Somewhat difficult</td>
      <td>No</td>
      <td>No</td>
      <td>Yes</td>
      <td>Yes</td>
      <td>Yes</td>
      <td>Yes</td>
      <td>No</td>
      <td>No</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2014-08-27 11:29:46</td>
      <td>31</td>
      <td>Male</td>
      <td>United Kingdom</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>Yes</td>
      <td>Yes</td>
      <td>Often</td>
      <td>26-100</td>
      <td>...</td>
      <td>Somewhat difficult</td>
      <td>Yes</td>
      <td>Yes</td>
      <td>Some of them</td>
      <td>No</td>
      <td>Maybe</td>
      <td>Maybe</td>
      <td>No</td>
      <td>Yes</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2014-08-27 11:30:22</td>
      <td>31</td>
      <td>Male</td>
      <td>United States</td>
      <td>TX</td>
      <td>NaN</td>
      <td>No</td>
      <td>No</td>
      <td>Never</td>
      <td>100-500</td>
      <td>...</td>
      <td>Don't know</td>
      <td>No</td>
      <td>No</td>
      <td>Some of them</td>
      <td>Yes</td>
      <td>Yes</td>
      <td>Yes</td>
      <td>Don't know</td>
      <td>No</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
<p>5 rows × 27 columns</p>
</div>

### Step 3: Clean Up the Data

Real-world data is messy. People enter things differently (“F”, “female”, “Woman”), sometimes leave blanks, or enter nonsense values. This step helps us fix that so the models don’t get confused later.

```python
# Remove invalid ages
df = df[(df['Age'] >= 18) & (df['Age'] <= 65)]

# Normalize gender
df['Gender'] = df['Gender'].str.lower().str.strip()
df['Gender'] = df['Gender'].replace({
    'female': 'Female', 'f': 'Female', 'woman': 'Female',
    'male': 'Male', 'm': 'Male', 'man': 'Male',
    'trans-female': 'Other', 'trans male': 'Other',
    'genderqueer': 'Other', 'non-binary': 'Other'
})
df['Gender'] = df['Gender'].apply(lambda x: x.capitalize() if x in ['Male', 'Female', 'Other'] else 'Other')

# Drop columns with too many missing or irrelevant entries
df = df.drop(columns=['comments', 'state', 'Timestamp'])

# Fill NaNs (can tune later)
df = df.fillna("Unknown")

# Encode target
df['treatment'] = df['treatment'].map({'Yes': 1, 'No': 0})
```

### Step 4: Explore the Data

Now that things are cleaned up, let’s explore! This is where we look for patterns. For example, do certain age groups seek treatment more often? Does gender seem to correlate with mental health support?

```python
sns.countplot(data=df, x='Gender', hue='treatment')
plt.title('Treatment by Gender')
plt.show()

# Age distribution
sns.histplot(df['Age'], bins=20)
plt.title('Age Distribution')
plt.show()
```

    
![Treatment by Gender](/img/uploads/output_7_0.png "Treatment by Gender")
    

    
![Age Distribution](/img/uploads/output_7_1.png "Age Distribution")
    

### Step 5: Feature Engineering

Our machine learning models can’t work directly with words or categories — they need numbers. This is where we convert all our text data (like country or gender) into a format the model can actually understand.

```python
# Encode categorical variables
df_encoded = pd.get_dummies(df.drop('treatment', axis=1), drop_first=True)
X = df_encoded
y = df['treatment']
```

### Step 6: Train a Random Forest Model

Time to build our first model! A Random Forest is basically a bunch of decision trees working together. It’s great for figuring out which features matter most and can handle all kinds of input without needing a ton of tuning.

```python
X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, random_state=42)

# Try Random Forest first
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print(classification_report(y_test, y_pred))
```

                  precision    recall  f1-score   support
    
               0       0.86      0.76      0.81       155
               1       0.79      0.87      0.83       158
    
        accuracy                           0.82       313
       macro avg       0.82      0.82      0.82       313
    weighted avg       0.82      0.82      0.82       313
    

### Step 7: Evaluate the Model

Let’s check how well our Random Forest did. We’ll use things like accuracy, precision, and recall — and we’ll also look at which features were most important in its decisions.

### Understanding the Confusion Matrix and ROC Curve

Once we train a model, we want to know: **how well is it doing?** That’s where evaluation tools like the **confusion matrix** and **ROC curve** come in.

#### Confusion Matrix

This is a table that shows how many predictions the model got right and wrong, split into four categories:

- **True Positives (TP):** We predicted someone would seek treatment, and they did.
- **True Negatives (TN):** We predicted someone wouldn’t seek treatment, and they didn’t.
- **False Positives (FP):** We predicted they would seek treatment, but they didn’t.
- **False Negatives (FN):** We predicted they wouldn’t seek treatment, but they actually did.

Ideally, we want a lot of TPs and TNs, and as few FPs/FNs as possible. This helps us see _where_ the model is making mistakes — does it miss people who actually need treatment? Or does it flag too many who don’t?

#### ROC Curve (Receiver Operating Characteristic)

The ROC curve tells us **how good the model is at distinguishing between the two classes** (treatment vs. no treatment), across different threshold levels.

- The **higher the curve**, the better the model.
- A perfect model hugs the **top-left corner** of the plot.
- A model with no skill at all would just follow the diagonal line.

The **AUC score** (Area Under the Curve) summarizes this — it ranges from 0.5 (random guessing) to 1.0 (perfect classifier). In this project, our best model got close to 0.9 — which means it's doing a pretty solid job!

```python
# Confusion Matrix
sns.heatmap(confusion_matrix(y_test, y_pred), annot=True, fmt='d')
plt.title('Confusion Matrix')
plt.show()

# Feature Importance
importances = pd.Series(model.feature_importances_, index=X.columns).sort_values(ascending=False)
importances.head(10).plot(kind='barh')
plt.title('Top 10 Feature Importances')
plt.show()

# ROC Curve
y_prob = model.predict_proba(X_test)[:, 1]
fpr, tpr, _ = roc_curve(y_test, y_prob)
plt.plot(fpr, tpr, label=f"ROC Curve (AUC = {roc_auc_score(y_test, y_prob):.2f})")
plt.plot([0, 1], [0, 1], linestyle='--')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve')
plt.legend()
plt.show()
```

    
![Confusion Matrix](/img/uploads/output_13_0.png "Confusion Matrix")
    

    
![To 10 Features](/img/uploads/output_13_1.png "To 10 Features")
    

    
![ROC Curve](/img/uploads/output_13_2.png "ROC Curve")
    

### Step 8: Try Other Models

Let’s test two other models for comparison:

- **Logistic Regression** is a solid, simple model that often works well on survey-style data.
- **XGBoost** is a more powerful and modern model that often wins competitions — let’s see how it stacks up!

```python
from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression

# Logistic Regression
logreg = LogisticRegression(max_iter=1000)
logreg.fit(X_train, y_train)
log_pred = logreg.predict(X_test)
print("Logistic Regression:\n", classification_report(y_test, log_pred))

# XGBoost
xgb = XGBClassifier(eval_metric='logloss')
xgb.fit(X_train, y_train)
xgb_pred = xgb.predict(X_test)
print("XGBoost:\n", classification_report(y_test, xgb_pred))
```

    Logistic Regression:
                   precision    recall  f1-score   support
    
               0       0.90      0.77      0.83       155
               1       0.80      0.91      0.85       158
    
        accuracy                           0.84       313
       macro avg       0.85      0.84      0.84       313
    weighted avg       0.85      0.84      0.84       313
    
    XGBoost:
                   precision    recall  f1-score   support
    
               0       0.84      0.75      0.79       155
               1       0.78      0.85      0.82       158
    
        accuracy                           0.81       313
       macro avg       0.81      0.80      0.80       313
    weighted avg       0.81      0.81      0.80       313
    

### Step 9: Explainability with SHAP

So our models made predictions… but **why** did they make those predictions?
SHAP helps us break open the black box and show how each feature pushes a prediction up or down. It’s like asking the model to show its work.

```python
import shap

# Setup
explainer = shap.Explainer(xgb)
shap_values = explainer(X_test)

# Summary Plot (global feature importance)
shap.summary_plot(shap_values, X_test)

# Dependence Plot (how a feature influences the output)
feature_name = "Age"
shap.dependence_plot(feature_name, shap_values.values, X_test)
```

    
![SHAP Values](/img/uploads/output_17_0.png "SHAP Values")
    

    
![SHAP Value for Age](/img/uploads/output_17_1.png "SHAP Value for Age")
    

### Bonus: Compare Model Performance Visually

Now that we’ve tested a few models, let’s compare them side by side using a bar chart. This gives us a quick sense of which one had the best overall accuracy and how close the others came.

```python
# Compare model performance visually

model_names = ['Random Forest', 'Logistic Regression', 'XGBoost']
accuracies = []

# Recalculate or retrieve scores
from sklearn.metrics import accuracy_score

# Predict again if needed
rf_acc = accuracy_score(y_test, model.predict(X_test))
log_acc = accuracy_score(y_test, logreg.predict(X_test))
xgb_acc = accuracy_score(y_test, xgb.predict(X_test))

accuracies = [rf_acc, log_acc, xgb_acc]

# Plot
plt.figure(figsize=(8, 5))
plt.bar(model_names, accuracies, color=["#6A5ACD", "#20B2AA", "#FFA500"])
plt.ylim(0, 1)
plt.title("Model Accuracy Comparison")
plt.ylabel("Accuracy Score")
for i, acc in enumerate(accuracies):
    plt.text(i, acc + 0.02, f"{acc:.2f}", ha='center')
plt.show()
```

    
![Model Accuracy Comparison](/img/uploads/output_19_0-1.png "Model Accuracy Comparison")
    

### AUC Score Comparison

While accuracy tells us how many predictions were correct overall, **AUC (Area Under the ROC Curve)** gives us a better sense of how well the model separates the two classes (people who sought treatment vs. those who didn’t).

Higher AUC means the model is better at distinguishing between the positive and negative cases — and in this case, we can see that **XGBoost came out on top**, just edging out the others. AUC is especially helpful when the dataset is a little imbalanced.

```python
# Visual comparison of AUC scores

from sklearn.metrics import roc_auc_score

# Get probabilities
rf_auc = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])
log_auc = roc_auc_score(y_test, logreg.predict_proba(X_test)[:, 1])
xgb_auc = roc_auc_score(y_test, xgb.predict_proba(X_test)[:, 1])

auc_scores = [rf_auc, log_auc, xgb_auc]
model_names = ['Random Forest', 'Logistic Regression', 'XGBoost']

# Plot AUC
plt.figure(figsize=(8, 5))
plt.bar(model_names, auc_scores, color=["#9370DB", "#3CB371", "#FFA07A"])
plt.ylim(0, 1)
plt.title("Model AUC Score Comparison")
plt.ylabel("ROC AUC Score")
for i, auc in enumerate(auc_scores):
    plt.text(i, auc + 0.02, f"{auc:.2f}", ha='center')
plt.show()
```

    
![Model AUC Score Comparison](/img/uploads/output_21_0.png "Model AUC Score Comparison")
    

### Step 10: Wrap-up and Summary

To finish things off, we’ll summarize what we found, which model performed best, and which features seemed to matter most. This is the kind of summary you could drop in a blog post or report.

```python
from IPython.display import Markdown, display
from sklearn.metrics import roc_auc_score

def print_summary():
    # Calculate AUC scores for all models
    auc_scores = {
        "Random Forest": roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]),
        "Logistic Regression": roc_auc_score(y_test, logreg.predict_proba(X_test)[:, 1]),
        "XGBoost": roc_auc_score(y_test, xgb.predict_proba(X_test)[:, 1])
    }
    
    best_model = max(auc_scores, key=auc_scores.get)
    best_score = auc_scores[best_model]

    # Select feature importance source based on best model
    if best_model == "Random Forest":
        feature_importances = pd.Series(model.feature_importances_, index=X.columns)
    elif best_model == "XGBoost":
        feature_importances = pd.Series(xgb.feature_importances_, index=X.columns)
    else:
        # Logistic regression doesn't have the same type of feature importance,
        # so we use coefficients as a proxy
        coef = pd.Series(logreg.coef_[0], index=X.columns)
        feature_importances = coef.abs()  # use absolute value of coefficients

    top_features = feature_importances.sort_values(ascending=False).head(5)

    # Print dynamic summary
    display(Markdown("## Project Summary: Mental Health Risk Prediction"))
    display(Markdown("- Dataset: [OSMI Mental Health in Tech Survey](https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey)"))
    display(Markdown("- **Target**: Whether a person has sought mental health treatment"))
    display(Markdown("- **Models used**: Random Forest, Logistic Regression, XGBoost"))
    display(Markdown(f"- **Best AUC Score**: {best_score:.2f} ({best_model})"))
    display(Markdown(f"- **Top Features** ({'Feature Importances' if best_model != 'Logistic Regression' else 'Absolute Coefficients'}):"))
    
    for feat, val in top_features.items():
        display(Markdown(f"  - **{feat}**: {val:.3f}"))

print_summary()
```

## Project Summary: Mental Health Risk Prediction

- Dataset: [OSMI Mental Health in Tech Survey](https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey)
- **Target**: Whether a person has sought mental health treatment
- **Models used**: Random Forest, Logistic Regression, XGBoost
- **Best AUC Score**: 0.91 (Logistic Regression)
- **Top Features** (Absolute Coefficients):
- **work\_interfere\_Often**: 3.108
- **work\_interfere\_Sometimes**: 2.499
- **work\_interfere\_Unknown**: 2.146
- **work\_interfere\_Rarely**: 2.062
- **family\_history\_Yes**: 0.873
