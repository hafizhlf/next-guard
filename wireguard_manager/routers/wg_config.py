from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .auth import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY
import os
import subprocess
import nacl
from jose import JWTError, jwt
from nacl.public import PrivateKey
from models.wg_models import WGConfig, WGInterface, WGPeer
from datetime import datetime

router = APIRouter()

# CONFIG_PATH = "/etc/wireguard/wg0.conf"  # Make sure this path is correct and writable
CONFIG_PATH = "./test_data/wg0.conf"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def _check_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

@router.get("/generate-config")
async def generate_config():
    private_key = await _generate_wireguard_private_key()
    public_key = await _generate_wireguard_private_key()
    config = WGConfig(
        interface=WGInterface(name="Host 1", private_key=private_key, address="10.0.0.1/24", listen_port="51820"),
        peers=[
            WGPeer(id=1, name="Client 1", allowed_ips="10.0.0.0/24", public_key=public_key, ip_address="10.0.0.2", lastSeen=datetime.now()),
            WGPeer(id=2, name="Client 2", allowed_ips="10.0.0.0/24", public_key=public_key, ip_address="10.0.0.3", lastSeen=datetime.now())
        ])
    res = await _generate_config(config=config)
    return res

@router.get("/read-config", response_model=WGConfig)
async def read_config():
    try:
        with open(CONFIG_PATH, "r") as config_file:
            content = config_file.read()
            # Parse content to WGConfig model as needed (simplified example)
            # Assuming you have a function parse_config that converts text to WGConfig
            config = parse_config(content)
            return config
    except IOError as e:
        print(f"Failed to read config: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Could not read WireGuard configuration")

@router.get("/list-peers")
async def list_peers(token: str = Depends(oauth2_scheme)):
    _check_token(token)

    peers = []

    try:
        with open(CONFIG_PATH, "r") as config_file:
            lines = config_file.readlines()
            # Simple parsing logic for peers
            for line in lines:
                if line.startswith("PublicKey"):
                    peer_info = {"public_key": line.split('=')[1].strip()}
                    peers.append(peer_info)
    except IOError as e:
        print(f"Failed to read config: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Could not read WireGuard configuration")

    public_key = await _generate_wireguard_private_key()
    peers = [
        WGPeer(id=1, name="Client 1", allowed_ips="10.0.0.0/24", public_key=public_key, ip_address="10.0.0.2", lastSeen=datetime.now()),
        WGPeer(id=2, name="Client 2", allowed_ips="10.0.0.0/24", public_key=public_key, ip_address="10.0.0.3", lastSeen=datetime.now())
    ]

    for peer in peers:
        peer.lastSeen = peer.lastSeen.strftime("%A, %B %d, %Y %H:%M:%S")

    return {"peers": peers}

def parse_config(config_text: str) -> WGConfig:
    interface = None
    peers = []
    current_peer = None

    for line in config_text.splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue  # Skip empty lines and comments

        if line.startswith("[Interface]"):
            current_peer = None
            continue
        elif line.startswith("[Peer]"):
            if current_peer:
                peers.append(current_peer)
            current_peer = {}
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()

        if current_peer is None:  # Reading interface configuration
            if key == "PrivateKey":
                private_key = value
            elif key == "Address":
                address = value
            elif key == "ListenPort":
                listen_port = int(value)
        else:  # Reading peer configuration
            if key == "PublicKey":
                current_peer['public_key'] = value
            elif key == "AllowedIPs":
                current_peer['allowed_ips'] = value

    if current_peer:
        peers.append(current_peer)

    # Create WGConfig using parsed data
    wg_interface = WGInterface(private_key=private_key, address=address, listen_port=listen_port)
    wg_peers = [WGPeer(**peer) for peer in peers]  # Construct list of WGPeer objects

    return WGConfig(interface=wg_interface, peers=wg_peers)

async def _generate_wireguard_private_key():
    private_key = PrivateKey.generate()
    return private_key.encode(encoder=nacl.encoding.Base64Encoder).decode()

async def _generate_wireguard_private_key():
    result = subprocess.run(['wg', 'genkey'], capture_output=True, text=True, check=True)
    return result.stdout.strip()

async def _generate_config(config: WGConfig):
    # Construct the WireGuard configuration file content
    config_content = f"[Interface]\n"
    config_content += f"PrivateKey = {config.interface.private_key}\n"
    config_content += f"Address = {config.interface.address}\n"
    config_content += f"ListenPort = {config.interface.listen_port}\n\n"

    for peer in config.peers:
        config_content += "[Peer]\n"
        config_content += f"PublicKey = {peer.public_key}\n"
        config_content += f"AllowedIPs = {peer.allowed_ips}\n\n"

    # Define your directory and file path
    directory = "./test_data"
    config_path = f"{directory}/wg0.conf"

    # Ensure the directory exists
    if not os.path.exists(directory):
        os.makedirs(directory)  # Create the directory if it doesn't exist

    # Write the configuration to the designated file path
    try:
        with open(config_path, "w") as config_file:
            config_file.write(config_content)
        # Adjust file permissions to secure the private key
        os.chmod(config_path, 0o600)
    except IOError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Could not write WireGuard configuration")

    return {"status": "Config created successfully", "path": config_path}
