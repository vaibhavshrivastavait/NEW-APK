#!/usr/bin/env python3
"""
Simple FastAPI backend for MHT Assessment preview
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="MHT Assessment API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Allow all origins for development (no HTTPS restrictions)
        "http://localhost:3000",
        "http://localhost:8001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "MHT Assessment API is running", "status": "healthy"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "mht-assessment-api"}

@app.get("/api/patients")
async def get_patients():
    return {
        "patients": [
            {"id": 1, "name": "Jane Doe", "age": 45, "status": "active"},
            {"id": 2, "name": "Mary Smith", "age": 52, "status": "completed"}
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)