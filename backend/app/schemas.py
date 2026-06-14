from typing import Optional

from pydantic import BaseModel, EmailStr


class PredictionResponse(BaseModel):
    total_transactions: int
    total_alerts: int
    normal_transactions: int


class AlertItem(BaseModel):
    transaction_id: Optional[int] = None
    sender_account: str
    receiver_account: str
    amount: float
    fraud_probability: float


class UserCreate(BaseModel):
    first_name: str
    second_name: str
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserRead(BaseModel):
    id: int
    first_name: str
    second_name: str
    username: str
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str