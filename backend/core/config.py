from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # App settings
    app_name: str = "Task Scheduler API"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # Database
    database_url: str = "sqlite:///./task_scheduler.db"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    backend_cors_origins: list = ["http://localhost:3000", "http://localhost:3001"]
    
    # File upload
    upload_dir: str = "./uploads"
    max_file_size: int = 100 * 1024 * 1024  # 100MB
    
    # Redis (for Celery)
    redis_url: str = "redis://localhost:6379"
    
    # AI SDK
    z_ai_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()