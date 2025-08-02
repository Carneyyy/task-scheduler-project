from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum
import uuid

class ScriptType(enum.Enum):
    PYTHON = "PYTHON"
    SHELL = "SHELL"
    BATCH = "BATCH"
    POWERSHELL = "POWERSHELL"
    JAVASCRIPT = "JAVASCRIPT"

class ScriptStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    DEPRECATED = "DEPRECATED"
    DRAFT = "DRAFT"

class ScriptLanguage(enum.Enum):
    PYTHON = "PYTHON"
    BASH = "BASH"
    BATCH = "BATCH"
    POWERSHELL = "POWERSHELL"
    NODEJS = "NODEJS"

class Script(Base):
    __tablename__ = "scripts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Enum(ScriptType), nullable=False)
    language = Column(Enum(ScriptLanguage), nullable=False)
    version = Column(String, nullable=False, default="1.0.0")
    status = Column(Enum(ScriptStatus), default=ScriptStatus.ACTIVE)
    filePath = Column(String, nullable=False)  # path to script file
    fileName = Column(String, nullable=False)  # script filename
    fileHash = Column(String, nullable=True)  # MD5/SHA256 hash for integrity
    fileSize = Column(Integer, nullable=True)  # file size in bytes
    parameters = Column(Text, nullable=True)  # JSON string for parameter definitions
    requirements = Column(Text, nullable=True)  # JSON string for dependencies
    environment = Column(Text, nullable=True)  # JSON string for environment variables
    timeout = Column(Integer, nullable=True)  # default timeout in seconds
    maxRetries = Column(Integer, nullable=True)  # default max retry count
    tags = Column(Text, nullable=True)  # JSON string for script tags
    metadata = Column(Text, nullable=True)  # JSON string for additional metadata
    author = Column(String, nullable=True)
    category = Column(String, nullable=True)
    isPublic = Column(Boolean, default=False)
    allowConcurrent = Column(Boolean, default=True)
    requireAuth = Column(Boolean, default=True)
    lastModifiedBy = Column(String, nullable=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    tasks = relationship("Task", back_populates="script")
    scriptVersions = relationship("ScriptVersion", back_populates="script")
    scriptExecutions = relationship("ScriptExecution", back_populates="script")

class ScriptVersion(Base):
    __tablename__ = "script_versions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scriptId = Column(String, ForeignKey('scripts.id', ondelete='CASCADE'), nullable=False)
    version = Column(String, nullable=False)
    filePath = Column(String, nullable=False)
    fileHash = Column(String, nullable=True)
    fileSize = Column(Integer, nullable=True)
    changelog = Column(Text, nullable=True)
    isCurrent = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=func.now())
    
    # Relationships
    script = relationship("Script", back_populates="scriptVersions")

class ScriptExecution(Base):
    __tablename__ = "script_executions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scriptId = Column(String, ForeignKey('scripts.id', ondelete='CASCADE'), nullable=False)
    taskId = Column(String, ForeignKey('tasks.id', ondelete='SET NULL'), nullable=True)
    nodeId = Column(String, ForeignKey('nodes.id', ondelete='SET NULL'), nullable=True)
    executionId = Column(String, nullable=True)  # unique execution identifier
    status = Column(String, nullable=False)  # RUNNING, SUCCESS, FAILED, CANCELLED
    startTime = Column(DateTime, default=func.now())
    endTime = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)  # execution duration in seconds
    exitCode = Column(Integer, nullable=True)
    output = Column(Text, nullable=True)  # standard output
    error = Column(Text, nullable=True)  # error output
    parameters = Column(Text, nullable=True)  # JSON string of used parameters
    environment = Column(Text, nullable=True)  # JSON string of used environment
    resourceUsage = Column(Text, nullable=True)  # JSON string of resource metrics
    logs = Column(Text, nullable=True)  # execution logs
    createdAt = Column(DateTime, default=func.now())
    
    # Relationships
    script = relationship("Script", back_populates="scriptExecutions")