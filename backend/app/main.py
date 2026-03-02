from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router # Note the explicit 'app.routes'

app = FastAPI(title="Aero-ResQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route - THIS MUST WORK
@app.get("/")
async def root():
    return {"status": "Aero-ResQ Nerve Center Online"}

# Include the router
app.include_router(router)