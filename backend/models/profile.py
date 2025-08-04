from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum
import uuid

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    firstName = Column(String, nullable=True)
    lastName = Column(String, nullable=True)
    displayName = Column(String, nullable=True)
    avatar = Column(String, nullable=True)  # URL to avatar image
    bio = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    timezone = Column(String, nullable=True)
    language = Column(String, nullable=True, default="en")
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    company = Column(String, nullable=True)
    jobTitle = Column(String, nullable=True)
    website = Column(String, nullable=True)
    github = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    twitter = Column(String, nullable=True)
    dateOfBirth = Column(DateTime, nullable=True)
    gender = Column(String, nullable=True)
    preferences = Column(Text, nullable=True)  # JSON string for user preferences
    notifications = Column(Text, nullable=True)  # JSON string for notification settings
    privacy = Column(Text, nullable=True)  # JSON string for privacy settings
    isActive = Column(Boolean, default=True)
    isVerified = Column(Boolean, default=False)
    lastLoginAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="profile")

class UserSetting(Base):
    __tablename__ = "user_settings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    key = Column(String, nullable=False)
    value = Column(Text, nullable=False)
    type = Column(String, nullable=True)  # string, number, boolean, json
    description = Column(Text, nullable=True)
    isSystem = Column(Boolean, default=False)
    isEditable = Column(Boolean, default=True)
    category = Column(String, nullable=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="settings")

class UserActivity(Base):
    __tablename__ = "user_activities"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=True)
    resourceId = Column(String, nullable=True)
    metadata = Column(Text, nullable=True)  # JSON string for additional metadata
    ipAddress = Column(String, nullable=True)
    userAgent = Column(String, nullable=True)
    timestamp = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    token = Column(String, nullable=False, unique=True)
    refreshToken = Column(String, nullable=True, unique=True)
    device = Column(String, nullable=True)
    platform = Column(String, nullable=True)
    browser = Column(String, nullable=True)
    ipAddress = Column(String, nullable=True)
    location = Column(String, nullable=True)
    isActive = Column(Boolean, default=True)
    expiresAt = Column(DateTime, nullable=False)
    lastAccessedAt = Column(DateTime, default=func.now())
    createdAt = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")