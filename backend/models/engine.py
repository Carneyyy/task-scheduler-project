from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum
import uuid

class EngineType(enum.Enum):
    SPIDER = "SPIDER"
    AUTOMATION = "AUTOMATION"
    DATA_PROCESSING = "DATA_PROCESSING"
    WEB_SCRAPING = "WEB_SCRAPING"
    API_CRAWLING = "API_CRAWLING"

class EngineStatus(enum.Enum):
    IDLE = "IDLE"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    STOPPED = "STOPPED"
    ERROR = "ERROR"
    MAINTENANCE = "MAINTENANCE"

class EnginePriority(enum.Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Engine(Base):
    __tablename__ = "engines"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Enum(EngineType), nullable=False)
    status = Column(Enum(EngineStatus), default=EngineStatus.IDLE)
    version = Column(String, nullable=False, default="1.0.0")
    config = Column(Text, nullable=False)  # JSON string for engine configuration
    parameters = Column(Text, nullable=True)  # JSON string for default parameters
    requirements = Column(Text, nullable=True)  # JSON string for dependencies
    maxInstances = Column(Integer, default=1)
    currentInstances = Column(Integer, default=0)
    maxConcurrency = Column(Integer, default=1)
    priority = Column(Enum(EnginePriority), default=EnginePriority.NORMAL)
    timeout = Column(Integer, nullable=True)  # default timeout in seconds
    retryCount = Column(Integer, default=0)
    retryDelay = Column(Integer, nullable=True)  # retry delay in seconds
    isAvailable = Column(Boolean, default=True)
    isAutoRestart = Column(Boolean, default=False)
    healthCheckInterval = Column(Integer, nullable=True)  # health check interval in seconds
    lastHealthCheck = Column(DateTime, nullable=True)
    lastStartTime = Column(DateTime, nullable=True)
    lastStopTime = Column(DateTime, nullable=True)
    totalRuns = Column(Integer, default=0)
    successfulRuns = Column(Integer, default=0)
    failedRuns = Column(Integer, default=0)
    averageRunTime = Column(Integer, nullable=True)  # average run time in seconds
    tags = Column(Text, nullable=True)  # JSON string for engine tags
    metadata = Column(Text, nullable=True)  # JSON string for additional metadata
    author = Column(String, nullable=True)
    category = Column(String, nullable=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    engineInstances = relationship("EngineInstance", back_populates="engine")
    engineMetrics = relationship("EngineMetric", back_populates="engine")
    engineConfigs = relationship("EngineConfig", back_populates="engine")

class EngineInstance(Base):
    __tablename__ = "engine_instances"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    engineId = Column(String, ForeignKey('engines.id', ondelete='CASCADE'), nullable=False)
    nodeId = Column(String, ForeignKey('nodes.id', ondelete='CASCADE'), nullable=False)
    instanceId = Column(String, nullable=False)  # unique instance identifier
    status = Column(Enum(EngineStatus), default=EngineStatus.IDLE)
    pid = Column(Integer, nullable=True)  # process ID
    port = Column(Integer, nullable=True)  # port number if applicable
    config = Column(Text, nullable=True)  # JSON string for instance-specific config
    startTime = Column(DateTime, default=func.now())
    endTime = Column(DateTime, nullable=True)
    uptime = Column(Integer, nullable=True)  # uptime in seconds
    memoryUsage = Column(String, nullable=True)  # memory usage
    cpuUsage = Column(String, nullable=True)  # CPU usage
    lastHeartbeat = Column(DateTime, nullable=True)
    error = Column(Text, nullable=True)  # error message if failed
    logs = Column(Text, nullable=True)  # instance logs
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=func.now())
    
    # Relationships
    engine = relationship("Engine", back_populates="engineInstances")
    node = relationship("Node")

class EngineMetric(Base):
    __tablename__ = "engine_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    engineId = Column(String, ForeignKey('engines.id', ondelete='CASCADE'), nullable=False)
    instanceId = Column(String, nullable=True)
    metricType = Column(String, nullable=False)  # performance, health, resource, etc.
    metricName = Column(String, nullable=False)
    metricValue = Column(Text, nullable=False)  # JSON string for metric value
    unit = Column(String, nullable=True)  # unit of measurement
    timestamp = Column(DateTime, default=func.now())
    
    # Relationships
    engine = relationship("Engine", back_populates="engineMetrics")

class EngineConfig(Base):
    __tablename__ = "engine_configs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    engineId = Column(String, ForeignKey('engines.id', ondelete='CASCADE'), nullable=False)
    configName = Column(String, nullable=False)
    configValue = Column(Text, nullable=False)  # JSON string for configuration
    description = Column(Text, nullable=True)
    isActive = Column(Boolean, default=True)
    isDefault = Column(Boolean, default=False)
    version = Column(String, nullable=False, default="1.0")
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    engine = relationship("Engine", back_populates="engineConfigs")