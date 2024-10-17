from fastapi import APIRouter, HTTPException, status
import subprocess

router = APIRouter()

WIREGUARD_INTERFACE = "wg0"  # Set your interface name here

def execute_command(command: str):
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True)
        return result.stdout.decode().strip()
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Command failed: {e.stderr.decode().strip()}")

@router.post("/start")
async def start_wireguard():
    command = f"wg-quick up {WIREGUARD_INTERFACE}"
    output = execute_command(command)
    return {"status": "started", "interface": WIREGUARD_INTERFACE, "output": output}

@router.post("/stop")
async def stop_wireguard():
    command = f"wg-quick down {WIREGUARD_INTERFACE}"
    output = execute_command(command)
    return {"status": "stopped", "interface": WIREGUARD_INTERFACE, "output": output}

@router.post("/restart")
async def restart_wireguard():
    stop_command = f"wg-quick down {WIREGUARD_INTERFACE}"
    start_command = f"wg-quick up {WIREGUARD_INTERFACE}"
    stop_output = execute_command(stop_command)
    start_output = execute_command(start_command)
    return {"status": "restarted", "interface": WIREGUARD_INTERFACE,
            "output": {"stop": stop_output, "start": start_output}}
