import pandas as pd
import numpy as np

from app.model_loader  import (
    xgb_model,
    encoder,
    scaler,
    feature_columns,
    numerical_columns,
    categorical_columns
)


def preprocess_batch(df: pd.DataFrame) -> pd.DataFrame:
    original_df = df.copy()

    #encode categoricals
    encoded = encoder.transform(df[categorical_columns])
    encoded_cols = encoder.get_feature_names_out(categorical_columns)

    encoded_df = pd.DataFrame(
        encoded,
        columns=encoded_cols,
        index=df.index
    )

    df = df.drop(columns=categorical_columns)

    #scale numerical
    df[numerical_columns] = scaler.transform(df[numerical_columns])

    #concat
    final_df = pd.concat(
        [df, encoded_df],
        axis=1
    )

    #final_df = final_df.reindex(columns=feature_columns, fill_value=0)

    return final_df, original_df


def predict_batch(df: pd.DataFrame):
    x, original_df = preprocess_batch(df) 

    probs = xgb_model.predict_proba(x)[:,1]
    preds = xgb_model.predict(x)

    results = original_df.copy()
    results['fraud_probability'] = probs
    results['prediction'] = np.where(preds == 1, 'Fraud', 'Normal')
    total_alerts = int((preds == 1).sum())

    summary = {
        'total_transactions': int(len(results)),
        'total_alerts':total_alerts,
        'normal_transactions': int(len(results) - total_alerts)
    }

    alerts = (results[results['prediction'] == 'Fraud'].sort_values('fraud_probability', ascending=False))

    return summary, alerts
   
