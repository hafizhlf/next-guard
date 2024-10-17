from pydantic import BaseModel
from typing import List

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
    lastSeen: str


class WGConfig(BaseModel):
    interface: WGInterface
    peers: List[WGPeer]
