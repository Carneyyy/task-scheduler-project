from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ...core.database import get_db
from ...models.user import User
from .auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class NodeCreate(BaseModel):
    name: str
    host: str
    port: int
    node_type: str = "worker"
    status: str = "active"

class NodeUpdate(BaseModel):
    name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    node_type: Optional[str] = None
    status: Optional[str] = None

class NodeResponse(BaseModel):
    id: int
    name: str
    host: str
    port: int
    node_type: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Simple in-memory node storage (in production, use a proper database model)
nodes_db = []

@router.get("/", response_model=List[NodeResponse])
async def get_nodes(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取节点列表"""
    # Filter nodes if status is provided
    if status:
        filtered_nodes = [node for node in nodes_db if node.get("status") == status]
    else:
        filtered_nodes = nodes_db
    
    return filtered_nodes[skip:skip + limit]

@router.post("/", response_model=NodeResponse)
async def create_node(
    node: NodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新节点"""
    new_node = {
        "id": len(nodes_db) + 1,
        **node.dict(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    nodes_db.append(new_node)
    return new_node

@router.get("/{node_id}", response_model=NodeResponse)
async def get_node(
    node_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取单个节点"""
    node = next((n for n in nodes_db if n.get("id") == node_id), None)
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found"
        )
    return node

@router.put("/{node_id}", response_model=NodeResponse)
async def update_node(
    node_id: int,
    node_update: NodeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新节点"""
    node = next((n for n in nodes_db if n.get("id") == node_id), None)
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found"
        )
    
    # Update node fields
    for field, value in node_update.dict(exclude_unset=True).items():
        node[field] = value
    
    node["updated_at"] = datetime.utcnow()
    return node

@router.delete("/{node_id}")
async def delete_node(
    node_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除节点"""
    global nodes_db
    node_index = next((i for i, n in enumerate(nodes_db) if n.get("id") == node_id), None)
    if node_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found"
        )
    
    nodes_db.pop(node_index)
    return {"message": "Node deleted successfully"}

@router.post("/{node_id}/actions")
async def node_actions(
    node_id: int,
    action: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """节点操作"""
    node = next((n for n in nodes_db if n.get("id") == node_id), None)
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found"
        )
    
    if action == "start":
        node["status"] = "active"
    elif action == "stop":
        node["status"] = "inactive"
    elif action == "restart":
        node["status"] = "restarting"
        # In a real implementation, you would restart the node here
        node["status"] = "active"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown action: {action}"
        )
    
    node["updated_at"] = datetime.utcnow()
    return {"message": f"Node {action} action completed", "node_id": node_id}