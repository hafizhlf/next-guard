from pydantic import BaseModel
from typing import List
from datetime import datetime

class WGInterface(BaseModel):
    name: str
    private_key: str
    address: str
    listen_port: int


class WGPeer(BaseModel):
    id: int
    name: str
    public_key: str
    allowed_ips: str
    ip_address: str
    lastSeen: datetime


class WGConfig(BaseModel):
    interface: WGInterface
    peers: List[WGPeer]
