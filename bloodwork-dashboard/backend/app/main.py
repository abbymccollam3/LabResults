from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from app.routes import bloodwork

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# if __name__ == "__main__":
#     print(f"URL: {os.getenv("SUPABASE_URL")}")
#     print(f"Key: {os.getenv("SUPABASE_KEY")}")

# Include routers
app.include_router(bloodwork.router, prefix="/bloodwork", tags=["bloodwork"]) 