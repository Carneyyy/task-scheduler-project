from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import shutil
from ...core.database import get_db
from ...models.user import User
from .auth import get_current_user
from ...core.config import settings
from pydantic import BaseModel

router = APIRouter()

class ScriptCreate(BaseModel):
    name: str
    description: Optional[str] = None
    script_type: str = "python"
    file_path: Optional[str] = None

class ScriptUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    script_type: Optional[str] = None
    file_path: Optional[str] = None

class ScriptResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    script_type: str
    file_path: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Simple in-memory script storage (in production, use a proper database model)
scripts_db = []

@router.get("/", response_model=List[ScriptResponse])
async def get_scripts(
    skip: int = 0,
    limit: int = 100,
    script_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取脚本列表"""
    # Filter scripts if type is provided
    if script_type:
        filtered_scripts = [script for script in scripts_db if script.get("script_type") == script_type]
    else:
        filtered_scripts = scripts_db
    
    return filtered_scripts[skip:skip + limit]

@router.post("/", response_model=ScriptResponse)
async def create_script(
    script: ScriptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新脚本"""
    new_script = {
        "id": len(scripts_db) + 1,
        **script.dict(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    scripts_db.append(new_script)
    return new_script

@router.post("/upload")
async def upload_script(
    file: UploadFile = File(...),
    name: Optional[str] = None,
    description: Optional[str] = None,
    script_type: str = "python",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """上传脚本文件"""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Create upload directory if it doesn't exist
    upload_dir = os.path.join(settings.upload_dir, "scripts")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Create script record
    script_name = name or file.filename
    new_script = {
        "id": len(scripts_db) + 1,
        "name": script_name,
        "description": description,
        "script_type": script_type,
        "file_path": file_path,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    scripts_db.append(new_script)
    
    return new_script

@router.get("/{script_id}", response_model=ScriptResponse)
async def get_script(
    script_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取单个脚本"""
    script = next((s for s in scripts_db if s.get("id") == script_id), None)
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script not found"
        )
    return script

@router.put("/{script_id}", response_model=ScriptResponse)
async def update_script(
    script_id: int,
    script_update: ScriptUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新脚本"""
    script = next((s for s in scripts_db if s.get("id") == script_id), None)
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script not found"
        )
    
    # Update script fields
    for field, value in script_update.dict(exclude_unset=True).items():
        script[field] = value
    
    script["updated_at"] = datetime.utcnow()
    return script

@router.delete("/{script_id}")
async def delete_script(
    script_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除脚本"""
    global scripts_db
    script_index = next((i for i, s in enumerate(scripts_db) if s.get("id") == script_id), None)
    if script_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script not found"
        )
    
    # Delete file if it exists
    script = scripts_db[script_index]
    if script.get("file_path") and os.path.exists(script["file_path"]):
        try:
            os.remove(script["file_path"])
        except Exception as e:
            print(f"Warning: Failed to delete file {script['file_path']}: {e}")
    
    scripts_db.pop(script_index)
    return {"message": "Script deleted successfully"}

@router.get("/{script_id}/download")
async def download_script(
    script_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """下载脚本文件"""
    script = next((s for s in scripts_db if s.get("id") == script_id), None)
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script not found"
        )
    
    file_path = script.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script file not found"
        )
    
    return {"file_path": file_path, "filename": os.path.basename(file_path)}