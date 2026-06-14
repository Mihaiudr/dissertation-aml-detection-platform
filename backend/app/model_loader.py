import joblib
from pathlib import Path
from xgboost import XGBClassifier

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR/'models'

#Load models
xgb_model = XGBClassifier()
xgb_model.load_model(MODEL_DIR/'best_xgb_model.json')

encoder = joblib.load(MODEL_DIR/'encoder.pkl')
scaler = joblib.load(MODEL_DIR/'scaler.pkl')
feature_columns = joblib.load(MODEL_DIR/'feature_columns.pkl')
numerical_columns = joblib.load(MODEL_DIR/'numerical_columns.pkl')
categorical_columns = joblib.load(MODEL_DIR/'categorical_columns.pkl')

print('Models loaded successfully')
