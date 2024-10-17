from fastapi import FastAPI
from routers import wg_config, wg_management, auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust according to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wg_config.router, prefix="/wireguard/config", tags=["configuration"])
app.include_router(wg_management.router, prefix="/wireguard/manage", tags=["management"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Welcome to the WireGuard API Manager"}