from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum
import uuid

class NodeStatus(enum.Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    BUSY = "BUSY"
    ERROR = "ERROR"
    MAINTENANCE = "MAINTENANCE"

class NodeHealth(enum.Enum):
    HEALTHY = "HEALTHY"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    UNKNOWN = "UNKNOWN"

class Node(Base):
    __tablename__ = "nodes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    host = Column(String, nullable=False)
    port = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(NodeStatus), default=NodeStatus.OFFLINE)
    health = Column(Enum(NodeHealth), default=NodeHealth.UNKNOWN)
    isAvailable = Column(Boolean, default=True)
    maxConcurrentTasks = Column(Integer, default=1)
    currentTaskCount = Column(Integer, default=0)
    cpuCores = Column(Integer, nullable=True)
    memoryGB = Column(Integer, nullable=True)
    diskGB = Column(Integer, nullable=True)
    osType = Column(String, nullable=True)  # Windows, Linux, macOS
    osVersion = Column(String, nullable=True)
    pythonVersion = Column(String, nullable=True)
    lastHeartbeat = Column(DateTime, nullable=True)
    lastHealthCheck = Column(DateTime, nullable=True)
    tags = Column(Text, nullable=True)  # JSON string for node tags
    metadata = Column(Text, nullable=True)  # JSON string for additional metadata
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    tasks = relationship("Task", back_populates="node")
    taskExecutions = relationship("TaskExecution", back_populates="node")
    nodeMetrics = relationship("NodeMetric", back_populates="node")

class NodeMetric(Base):
    __tablename__ = "node_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nodeId = Column(String, ForeignKey('nodes.id', ondelete='CASCADE'), nullable=False)
    cpuUsage = Column(String, nullable=False)  # percentage
    memoryUsage = Column(String, nullable=False)  # percentage
    diskUsage = Column(String, nullable=False)  # percentage
    networkIO = Column(String, nullable=True)  # bytes in/out
    diskIO = Column(String, nullable=True)  # bytes read/write
    processCount = Column(Integer, nullable=True)
    loadAverage = Column(String, nullable=True)  # system load average
    temperature = Column(String, nullable=True)  # CPU temperature
    uptime = Column(String, nullable=True)  # system uptime
    timestamp = Column(DateTime, default=func.now())
    
    # Relationships
    node = relationship("Node", back_populates="nodeMetrics")