from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import enum
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://docflow:docflow123@localhost:5432/docflow_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DocumentType(enum.Enum):
    LOAN_APPLICATION = "loan_application"
    LEGAL_CONTRACT = "legal_contract"
    GRANT_APPLICATION = "grant_application"
    INSURANCE_CLAIM = "insurance_claim"

class DocumentStatus(enum.Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    FAILED = "failed"

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String, unique=True, index=True)
    filename = Column(String)
    document_type = Column(SQLEnum(DocumentType))
    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.UPLOADED)
    file_path = Column(String)
    
    # AI Processing Results
    extracted_text = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    risk_score = Column(Float, nullable=True)
    classification = Column(Text, nullable=True)
    
    # Approval
    reviewer_id = Column(String, nullable=True)
    reviewer_comments = Column(Text, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Metadata
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

# Create tables
if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
