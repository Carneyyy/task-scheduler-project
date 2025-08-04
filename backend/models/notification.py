from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum
import uuid

class NotificationType(enum.Enum):
    EMAIL = "EMAIL"
    SMS = "SMS"
    WEBHOOK = "WEBHOOK"
    SLACK = "SLACK"
    DISCORD = "DISCORD"
    TELEGRAM = "TELEGRAM"
    PUSH = "PUSH"
    SYSTEM = "SYSTEM"

class NotificationStatus(enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"
    DELIVERED = "DELIVERED"
    READ = "READ"

class NotificationPriority(enum.Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(Enum(NotificationType), nullable=False)
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.NORMAL)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    recipient = Column(String, nullable=False)  # email, phone number, webhook URL, etc.
    sender = Column(String, nullable=True)
    subject = Column(String, nullable=True)  # for email notifications
    template = Column(String, nullable=True)  # notification template name
    data = Column(Text, nullable=True)  # JSON string for template data
    attachments = Column(Text, nullable=True)  # JSON string for attachments
    retryCount = Column(Integer, default=0)
    maxRetries = Column(Integer, default=3)
    scheduledAt = Column(DateTime, nullable=True)
    sentAt = Column(DateTime, nullable=True)
    deliveredAt = Column(DateTime, nullable=True)
    readAt = Column(DateTime, nullable=True)
    error = Column(Text, nullable=True)  # error message if failed
    metadata = Column(Text, nullable=True)  # JSON string for additional metadata
    tags = Column(Text, nullable=True)  # JSON string for notification tags
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    notificationLogs = relationship("NotificationLog", back_populates="notification")
    notificationTemplates = relationship("NotificationTemplate", back_populates="notifications")

class NotificationLog(Base):
    __tablename__ = "notification_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    notificationId = Column(String, ForeignKey('notifications.id', ondelete='CASCADE'), nullable=False)
    status = Column(Enum(NotificationStatus), nullable=False)
    message = Column(Text, nullable=False)
    error = Column(Text, nullable=True)
    attempt = Column(Integer, nullable=False)
    sentAt = Column(DateTime, default=func.now())
    response = Column(Text, nullable=True)  # response from notification service
    metadata = Column(Text, nullable=True)  # JSON string for additional metadata
    
    # Relationships
    notification = relationship("Notification", back_populates="notificationLogs")

class NotificationTemplate(Base):
    __tablename__ = "notification_templates"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    type = Column(Enum(NotificationType), nullable=False)
    subject = Column(String, nullable=True)  # for email templates
    content = Column(Text, nullable=False)  # template content with placeholders
    description = Column(Text, nullable=True)
    variables = Column(Text, nullable=True)  # JSON string for template variables
    isActive = Column(Boolean, default=True)
    isDefault = Column(Boolean, default=False)
    version = Column(String, nullable=False, default="1.0")
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    notifications = relationship("Notification", back_populates="notificationTemplates")

class NotificationSetting(Base):
    __tablename__ = "notification_settings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    isEnabled = Column(Boolean, default=True)
    config = Column(Text, nullable=False)  # JSON string for notification configuration
    preferences = Column(Text, nullable=True)  # JSON string for user preferences
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")