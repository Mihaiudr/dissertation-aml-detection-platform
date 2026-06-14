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

def create_features(df: pd.DataFrame) ->pd.DataFrame:
    df = df.copy()

    #datetime
    df['Full_Date'] = df['Date'].astype(str) + ' ' + df['Time'].astype(str)
    df['Full_Date'] = pd.to_datetime(df['Full_Date'])

    df = df.sort_values(by='Full_Date').reset_index(drop=True)

    #temporal features
    df['Hour'] = df['Full_Date'].dt.hour
    df['DayofWeek'] = df['Full_Date'].dt.day_of_week
    df['DayofMonth'] = df['Full_Date'].dt.day
    df['Month'] = df['Full_Date'].dt.month
    df['isNight'] = df['Hour'].between(0,7).astype(int)
    df['Is_MidMonth'] = np.where((df['DayofMonth'] >= 9) & (df['DayofMonth'] <= 18), 1, 0)

    #bank_location_missmatch
    df['bank_location_missmatch'] = (df['Sender_bank_location'] != df['Receiver_bank_location']).astype(int)

    #receiver_transactions
    df = df.sort_values(by=['Receiver_account', 'Full_Date']).reset_index(drop=True)
    df['Receiver_transactions'] = df.groupby('Receiver_account').cumcount()

    df = df.sort_values(by='Full_Date').reset_index(drop=True)

    #unique_receivers_cum
    df['Unique_Receivers_Cum'] = (df.groupby('Sender_account')['Receiver_account'].expanding().nunique().groupby(level=0).shift(1).reset_index(0, drop=True).fillna(0)).astype(int)
    
    df = df.sort_values(by='Full_Date').reset_index(drop=True)

    #nr_past_interactions
    s_acc = df['Sender_account'].astype(str)
    r_acc = df['Receiver_account'].astype(str)

    df['pair_id'] = np.where(
        df['Sender_account'] < df['Receiver_account'],
        s_acc + '_' + r_acc,
        r_acc + '_' + s_acc
    )
    df['Nr_past_interactions'] = df.groupby('pair_id').cumcount()
    df.drop(columns=['pair_id'], inplace=True)
    
    df = df.sort_values(by='Full_Date').reset_index(drop=True)

    return df

def preprocess_batch(df: pd.DataFrame) -> pd.DataFrame:
    df = create_features(df)
    original_df = df.copy()

    drop_cols = [
        'Sender_account',
        'Receiver_account',
        'Laundering_type',
        'Full_Date',
        'Date',
        'Time',
        'Is_laundering'
    ]
    df_model = df.drop(columns=[c for c in drop_cols if c in df.columns])

    #encode categoricals
    encoded = encoder.transform(df_model[categorical_columns])
    encoded_cols = encoder.get_feature_names_out(categorical_columns)

    encoded_df = pd.DataFrame(
        encoded,
        columns=encoded_cols,
        index=df_model.index
    )

    df_model = df_model.drop(columns=categorical_columns)

    #scale numerical
    df_model[numerical_columns] = scaler.transform(df_model[numerical_columns])

    #concat
    final_df = pd.concat(
        [df_model, encoded_df],
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
   
