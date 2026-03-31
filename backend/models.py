from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class CodeSubmission(BaseModel):
    code: str
    language: str

class FeedbackItem(BaseModel):
    line: Optional[int]
    type: str
    message: str
    suggestion: str

class ScoreScores(BaseModel):
    quality: int
    readability: int
    performance: int

class ReviewResultResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    language: str
    original_code: str
    refactored_code: str
    scores: ScoreScores
    feedback: List[FeedbackItem]
