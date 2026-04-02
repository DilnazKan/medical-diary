from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 10

class PaperResult(BaseModel):
    pubmed_id: str
    title: str
    authors: List[str]
    published_date: str
    source: str
    url: str

class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[PaperResult]
