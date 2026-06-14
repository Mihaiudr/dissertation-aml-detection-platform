# AML Guard

AML Guard is my dissertation thessis. It consists in an analysis of the SAML-D dataset and an exploration of the best classification models for AML transactions, with XGBoost and GNN being the most competitive models. 
The dissertation also consists in a proof of concept web application for anti-money laundering transaction screening. It allows analysts to upload transaction datasets, detect suspicious activity using the XGBoost model, review flagged alerts, and generate AI-assisted investigation explanations.

## Features

- JWT username/password authentication
- Batch CSV transaction scoring
- XGBoost suspicious transaction detection
- Alert review table with filters and pagination
- Investigator view for individual alert analysis
- AI-generated AML explanations
- Dashboard with transaction metrics and country alert map
- Dockerized frontend and backend

## Tech Stack

- Frontend: React, Vite
- Backend: FastAPI, SQLAlchemy
- Machine Learning: XGBoost
- Database: SQLite locally, PostgreSQL-ready for deployment
- Containerization: Docker, Docker Compose

## Local Development

### Backend

```bash
cd backend
uvicorn app.main:app --reload