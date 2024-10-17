from pydantic import BaseModel
from typing import List

class WGInterface(BaseModel):
    private_key: str
    address: str
    listen_port: int

class WGPeer(BaseModel):
    public_key: str
    allowed_ips: str

class WGConfig(BaseModel):
    interface: WGInterface
    peers: List[WGPeer]
