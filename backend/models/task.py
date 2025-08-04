from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum
import uuid

class TaskStatus(enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class TaskPriority(enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class ScheduleCycle(enum.Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"

class ExecutionStatus(enum.Enum):
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class DependencyType(enum.Enum):
    SUCCESS = "SUCCESS"
    COMPLETION = "COMPLETION"
    TIMEOUT = "TIMEOUT"
    MANUAL = "MANUAL"

class DependencyCondition(enum.Enum):
    ALL_SUCCESS = "ALL_SUCCESS"
    ANY_SUCCESS = "ANY_SUCCESS"
    ALL_COMPLETE = "ALL_COMPLETE"
    ANY_COMPLETE = "ANY_COMPLETE"

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    scriptId = Column(String, ForeignKey('scripts.id', ondelete='CASCADE'), nullable=False)
    nodeId = Column(String, ForeignKey('nodes.id', ondelete='SET_NULL'), nullable=True)
    parameters = Column(Text, nullable=False)  # JSON string
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    maxRunTime = Column(Integer, nullable=False)  # seconds
    isConcurrent = Column(Boolean, default=False)
    isCompress = Column(Boolean, default=False)
    notifyOnComplete = Column(Boolean, default=False)
    emailAuthCode = Column(String, nullable=True)
    filePath = Column(String, nullable=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    script = relationship("Script", back_populates="tasks")
    node = relationship("Node", back_populates="tasks")
    schedules = relationship("TaskSchedule", back_populates="task")
    executions = relationship("TaskExecution", back_populates="task")
    dependencies = relationship("TaskDependency", foreign_keys="TaskDependency.taskId", back_populates="task")
    dependents = relationship("TaskDependency", foreign_keys="TaskDependency.dependsOnTaskId", back_populates="dependsOnTask")

class TaskSchedule(Base):
    __tablename__ = "task_schedules"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    taskId = Column(String, ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False)
    cycleType = Column(Enum(ScheduleCycle), nullable=False)
    runTime = Column(String, nullable=False)  # e.g., "09:00"
    isActive = Column(Boolean, default=True)
    lastRunAt = Column(DateTime, nullable=True)
    nextRunAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    task = relationship("Task", back_populates="schedules")

class TaskExecution(Base):
    __tablename__ = "task_executions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    taskId = Column(String, ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False)
    nodeId = Column(String, ForeignKey('nodes.id', ondelete='CASCADE'), nullable=False)
    status = Column(Enum(ExecutionStatus), default=ExecutionStatus.RUNNING)
    startTime = Column(DateTime, default=func.now())
    endTime = Column(DateTime, nullable=True)
    output = Column(Text, nullable=True)  # execution output
    error = Column(Text, nullable=True)  # error message
    cpuUsage = Column(String, nullable=True)
    memoryUsage = Column(String, nullable=True)
    diskUsage = Column(String, nullable=True)
    
    # Relationships
    task = relationship("Task", back_populates="executions")
    node = relationship("Node", back_populates="taskExecutions")

class TaskDependency(Base):
    __tablename__ = "task_dependencies"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    taskId = Column(String, ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False)
    dependsOnTaskId = Column(String, ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False)
    type = Column(Enum(DependencyType), default=DependencyType.SUCCESS)
    condition = Column(Enum(DependencyCondition), default=DependencyCondition.ALL_SUCCESS)
    timeoutMinutes = Column(Integer, nullable=True)  # only for TIMEOUT type
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    task = relationship("Task", foreign_keys=[taskId], back_populates="dependencies")
    dependsOnTask = relationship("Task", foreign_keys=[dependsOnTaskId], back_populates="dependents")