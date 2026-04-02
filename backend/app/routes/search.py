from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.diary import DiaryEntry
from app.schemas.search import SearchRequest, SearchResponse
from app.services.pubmed import search_pubmed
from app.models.diary import DiarySymptom
from sqlalchemy import text

router = APIRouter(prefix="/search", tags=["search"])

@router.post("", response_model=SearchResponse)
async def search(
    body: SearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Save to search history
    db.execute(
        text("INSERT INTO search_history (user_id, query) VALUES (:user_id, :query)"),
        {"user_id": str(current_user.id), "query": body.query}
    )
    db.commit()

    results = await search_pubmed(body.query, body.max_results)
    return SearchResponse(query=body.query, total=len(results), results=results)

@router.get("/history")
def get_search_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rows = db.execute(
        text("SELECT query, searched_at FROM search_history WHERE user_id = :user_id ORDER BY searched_at DESC LIMIT 20"),
        {"user_id": str(current_user.id)}
    ).fetchall()
    return [{"query": r.query, "searched_at": r.searched_at} for r in rows]
