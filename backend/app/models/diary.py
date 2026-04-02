import uuid
from sqlalchemy import Column, String, Text, Integer, SmallInteger, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Symptom(Base):
    __tablename__ = "symptoms"

    id       = Column(Integer, primary_key=True, autoincrement=True)
    name     = Column(String(255), unique=True, nullable=False)
    category = Column(String(100))

class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    notes      = Column(Text)
    logged_at  = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())

    symptoms = relationship("DiarySymptom", back_populates="entry", cascade="all, delete")

class DiarySymptom(Base):
    __tablename__ = "diary_symptoms"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    diary_entry_id = Column(UUID(as_uuid=True), ForeignKey("diary_entries.id", ondelete="CASCADE"), nullable=False)
    symptom_id     = Column(Integer, ForeignKey("symptoms.id"), nullable=True)
    custom_symptom = Column(String(255), nullable=True)
    severity       = Column(SmallInteger)

    entry = relationship("DiaryEntry", back_populates="symptoms")
