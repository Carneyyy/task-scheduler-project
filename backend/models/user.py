from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import uuid

# Association tables
user_role_table = Table(
    'user_roles', Base.metadata,
    Column('id', String, primary_key=True, default=lambda: str(uuid.uuid4())),
    Column('userId', String, ForeignKey('users.id', ondelete='CASCADE')),
    Column('roleId', String, ForeignKey('roles.id', ondelete='CASCADE'))
)

role_permission_table = Table(
    'role_permissions', Base.metadata,
    Column('id', String, primary_key=True, default=lambda: str(uuid.uuid4())),
    Column('roleId', String, ForeignKey('roles.id', ondelete='CASCADE')),
    Column('permissionId', String, ForeignKey('permissions.id', ondelete='CASCADE'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    password = Column(String, nullable=False)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    roles = relationship("Role", secondary=user_role_table, back_populates="users")
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    settings = relationship("UserSetting", back_populates="user")

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    users = relationship("User", secondary=user_role_table, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permission_table, back_populates="roles")

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    roles = relationship("Role", secondary=role_permission_table, back_populates="permissions")

class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey('users.id', ondelete='CASCADE'))
    roleId = Column(String, ForeignKey('roles.id', ondelete='CASCADE'))
    
    # Relationships
    user = relationship("User", backref="user_roles")
    role = relationship("Role", backref="role_users")

class RolePermission(Base):
    __tablename__ = "role_permissions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    roleId = Column(String, ForeignKey('roles.id', ondelete='CASCADE'))
    permissionId = Column(String, ForeignKey('permissions.id', ondelete='CASCADE'))
    
    # Relationships
    role = relationship("Role", backref="role_permissions")
    permission = relationship("Permission", backref="permission_roles")