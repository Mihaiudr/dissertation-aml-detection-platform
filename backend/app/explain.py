import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

def generate_alert_explanation(alert: dict) -> str:
    prompt=f"""
Transaction details:

Raw transaction context:
-Sender account:  {alert.get('Sender_account')}
-Receiver account: {alert.get('Receiver_account')}
-Amount: {alert.get('Amount')}
-Payment currency: {alert.get('Payment_currency')}
-Received currency: {alert.get('Received_currency')}
-Sender bank location: {alert.get('Sender_bank_location')}
-Receiver bank location: {alert.get('Receiver_bank_location')}
-Payment type: {alert.get('Payment_type')}
-Full date: {alert.get('Full_Date')}

Model output:
-Prediction: {alert.get('prediction')}
-XGBoost fraud probability: {alert.get('fraud_probability')}
-Review level: {alert.get('risk_level')}

Engineered relational features:
-Bank location mismatch: {alert.get('bank_location_missmatch')}
-Receiver previous transactions: {alert.get('Receiver_transactions')}
-Number of unique receivers a sender interacted with so far: {alert.get('Unique_Receivers_Cum')}
-Past interactions between sender and receiver: {alert.get('Nr_past_interactions')}

Write a concise explanation for a bank investigator.
Explain which factors may have impacted the model flagging the transaction as a fraud.
"""
    
    response = client.responses.create(
        model = 'gpt-5.4-mini-2026-03-17',
        temperature=0,
        instructions=(
            f"""
            You are an AML assistant.
            Explain why the following transaction was flagged by a machine learning model - XGBoost.
            Use the raw transaction context and engineered features as explanation.
            Focus on AML-relevant signals as cross-border movement, bakn-location mismatch, unusual timing, prior interactions, payment type.
            Do not invent facts not present in the input.
            Do not state that the transaction is definitely money laundering.
            Use careful compliance language: 'may indicate', 'could suggest', 'requires review'.
            Keep the explanation concise and useful for a bank investigator.
            Write the explanation in 2-3 sentances.
            """
        ),
        input=prompt,
    )
    return response.output_text