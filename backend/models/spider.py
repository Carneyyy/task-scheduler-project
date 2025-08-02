from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum
import uuid

class SpiderType(enum.Enum):
    WEB_SPIDER = "WEB_SPIDER"
    API_SPIDER = "API_SPIDER"

class SpiderStatus(enum.Enum):
    IDLE = "IDLE"
    CRAWLING = "CRAWLING"
    STOPPED = "STOPPED"
    ERROR = "ERROR"

class Spider(Base):
    __tablename__ = "spiders"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Enum(SpiderType), nullable=False)
    status = Column(Enum(SpiderStatus), default=SpiderStatus.IDLE)
    startUrl = Column(Text, nullable=False)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
