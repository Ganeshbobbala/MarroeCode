from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import review

app = FastAPI(
    title="AI Code Reviewer API",
    description="A full-stack AI-powered application that performs static analysis and ML-based code reviews.",
    version="1.0.0"
)

# CORS configured for localhost React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Serve static files from the React dist folder
frontend_dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

app.include_router(review.router, prefix="/api")

# Mount assets directory for styles/scripts
app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_path, "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # If the path starts with /api, we should probably have let the router handle it
    # but this is a fallback for SPA routing (React Router)
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="API route not found")
    
    # Check if file exists in dist (for icons, favicon, etc)
    file_path = os.path.join(frontend_dist_path, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
        
    # Return index.html for all other routes to support client-side routing
    index_path = os.path.join(frontend_dist_path, "index.html")
    return FileResponse(index_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
