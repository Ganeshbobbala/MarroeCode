from fastapi import FastAPI
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

app.include_router(review.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "AI Code Reviewer API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
