from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.core.database import get_db
from backend.models.spider import Spider, SpiderType, SpiderStatus
from backend.api.v1.auth import get_current_user
from backend.models.user import User
from pydantic import BaseModel

router = APIRouter()

class SpiderBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: SpiderType
    startUrl: str
    isActive: bool = True

class SpiderCreate(SpiderBase):
    pass

class SpiderUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[SpiderType] = None
    startUrl: Optional[str] = None
    isActive: Optional[bool] = None

class SpiderResponse(SpiderBase):
    id: str
    status: SpiderStatus
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[SpiderResponse])
async def get_spiders(
    skip: int = 0,
    limit: int = 100,
    type: Optional[SpiderType] = None,
    status: Optional[SpiderStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Spider)
    
    if type:
        query = query.filter(Spider.type == type)
    if status:
        query = query.filter(Spider.status == status)
    
    spiders = query.offset(skip).limit(limit).all()
    return spiders

@router.get("/{spider_id}", response_model=SpiderResponse)
async def get_spider(
    spider_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    spider = db.query(Spider).filter(Spider.id == spider_id).first()
    if not spider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spider not found"
        )
    return spider

@router.post("/", response_model=SpiderResponse)
async def create_spider(
    spider: SpiderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_spider = Spider(**spider.dict())
    db.add(db_spider)
    db.commit()
    db.refresh(db_spider)
    return db_spider

@router.put("/{spider_id}", response_model=SpiderResponse)
async def update_spider(
    spider_id: str,
    spider_update: SpiderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    spider = db.query(Spider).filter(Spider.id == spider_id).first()
    if not spider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spider not found"
        )
    
    update_data = spider_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(spider, field, value)
    
    spider.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(spider)
    return spider

@router.delete("/{spider_id}")
async def delete_spider(
    spider_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    spider = db.query(Spider).filter(Spider.id == spider_id).first()
    if not spider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spider not found"
        )
    
    db.delete(spider)
    db.commit()
    return {"message": "Spider deleted successfully"}

@router.post("/{spider_id}/start")
async def start_spider(
    spider_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    spider = db.query(Spider).filter(Spider.id == spider_id).first()
    if not spider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spider not found"
        )
    
    if spider.status == SpiderStatus.CRAWLING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Spider is already running"
        )
    
    spider.status = SpiderStatus.CRAWLING
    spider.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(spider)
    
    # TODO: Implement actual spider starting logic
    return {"message": "Spider started successfully", "spider_id": spider_id}

@router.post("/{spider_id}/stop")
async def stop_spider(
    spider_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    spider = db.query(Spider).filter(Spider.id == spider_id).first()
    if not spider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spider not found"
        )
    
    if spider.status != SpiderStatus.CRAWLING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Spider is not running"
        )
    
    spider.status = SpiderStatus.STOPPED
    spider.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(spider)
    
    # TODO: Implement actual spider stopping logic
    return {"message": "Spider stopped successfully", "spider_id": spider_id}

@router.get("/{spider_id}/status")
async def get_spider_status(
    spider_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    spider = db.query(Spider).filter(Spider.id == spider_id).first()
    if not spider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spider not found"
        )
    
    return {
        "spider_id": spider_id,
        "status": spider.status,
        "name": spider.name,
        "type": spider.type,
        "updated_at": spider.updatedAt
    }