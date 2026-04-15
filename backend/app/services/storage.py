from supabase import create_client
from app.core.config import settings

BUCKET = "medical-files"

_client = None

def get_storage():
    global _client
    if _client is None:
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        # Create bucket if it doesn't exist
        try:
            _client.storage.create_bucket(BUCKET, options={"public": False})
        except Exception:
            pass  # Bucket already exists
    return _client.storage.from_(BUCKET)


def upload_file(file_bytes: bytes, path: str, content_type: str) -> str:
    """Upload file to Supabase Storage and return its path."""
    storage = get_storage()
    storage.upload(path, file_bytes, {"content-type": content_type, "upsert": "true"})
    return path


def get_signed_url(path: str, expires_in: int = 3600) -> str:
    """Generate a temporary signed URL for a file (valid for 1 hour by default)."""
    storage = get_storage()
    result = storage.create_signed_url(path, expires_in)
    return result["signedURL"]


def delete_file(path: str):
    """Delete a file from Supabase Storage."""
    storage = get_storage()
    storage.remove([path])
