import uuid
from sqlalchemy import Column, String, Text, Integer, Date, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title       = Column(String(255), nullable=False)
    record_type = Column(String(100), nullable=False)  # blood, scan, xray, consultation, other
    visit_date  = Column(Date, nullable=False)
    doctor_name = Column(String(255))
    clinic_name = Column(String(255))
    notes       = Column(Text)
    created_at  = Column(DateTime, server_default=func.now())

    files = relationship("MedicalFile", back_populates="record", cascade="all, delete")

class MedicalFile(Base):
    __tablename__ = "medical_files"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    record_id    = Column(UUID(as_uuid=True), ForeignKey("medical_records.id", ondelete="CASCADE"), nullable=False)
    file_name    = Column(String(255), nullable=False)
    file_url     = Column(Text, nullable=False)
    file_type    = Column(String(50))
    file_size_kb = Column(Integer)
    uploaded_at  = Column(DateTime, server_default=func.now())

    record = relationship("MedicalRecord", back_populates="files")
