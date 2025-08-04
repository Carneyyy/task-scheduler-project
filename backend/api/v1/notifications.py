from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ...core.database import get_db
from ...models.user import User
from .auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str = "info"
    is_read: bool = False

class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    notification_type: Optional[str] = None
    is_read: Optional[bool] = None

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime
    updated_at: datetime
    user_id: int

    class Config:
        from_attributes = True

# Simple in-memory notification storage (in production, use a proper database model)
notifications_db = []

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = 0,
    limit: int = 100,
    notification_type: Optional[str] = None,
    is_read: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取通知列表"""
    # Filter notifications
    filtered_notifications = notifications_db.copy()
    
    if notification_type:
        filtered_notifications = [n for n in filtered_notifications if n.get("notification_type") == notification_type]
    
    if is_read is not None:
        filtered_notifications = [n for n in filtered_notifications if n.get("is_read") == is_read]
    
    return filtered_notifications[skip:skip + limit]

@router.post("/", response_model=NotificationResponse)
async def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新通知"""
    new_notification = {
        "id": len(notifications_db) + 1,
        **notification.dict(),
        "user_id": current_user.id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    notifications_db.append(new_notification)
    return new_notification

@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取单个通知"""
    notification = next((n for n in notifications_db if n.get("id") == notification_id), None)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notification

@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: int,
    notification_update: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新通知"""
    notification = next((n for n in notifications_db if n.get("id") == notification_id), None)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Update notification fields
    for field, value in notification_update.dict(exclude_unset=True).items():
        notification[field] = value
    
    notification["updated_at"] = datetime.utcnow()
    return notification

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除通知"""
    global notifications_db
    notification_index = next((i for i, n in enumerate(notifications_db) if n.get("id") == notification_id), None)
    if notification_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notifications_db.pop(notification_index)
    return {"message": "Notification deleted successfully"}

@router.post("/batch/mark-read")
async def mark_notifications_read(
    notification_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """批量标记通知为已读"""
    marked_count = 0
    for notification in notifications_db:
        if notification.get("id") in notification_ids:
            notification["is_read"] = True
            notification["updated_at"] = datetime.utcnow()
            marked_count += 1
    
    return {"message": f"Marked {marked_count} notifications as read"}

@router.delete("/batch")
async def delete_notifications_batch(
    notification_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """批量删除通知"""
    global notifications_db
    initial_count = len(notifications_db)
    notifications_db = [n for n in notifications_db if n.get("id") not in notification_ids]
    deleted_count = initial_count - len(notifications_db)
    
    return {"message": f"Deleted {deleted_count} notifications"}