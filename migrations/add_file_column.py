"""Add file metadata columns to documents table"""

from sqlalchemy import text
from src.utils.database import engine

def upgrade():
    """Add file columns"""
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE documents 
            ADD COLUMN IF NOT EXISTS file_path VARCHAR(500),
            ADD COLUMN IF NOT EXISTS file_size INTEGER,
            ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);
        """))
        conn.commit()
    print("✅ Migration complete: Added file_path, file_size, file_type columns")

def downgrade():
    """Remove file columns"""
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE documents 
            DROP COLUMN IF EXISTS file_path,
            DROP COLUMN IF EXISTS file_size,
            DROP COLUMN IF EXISTS file_type;
        """))
        conn.commit()
    print("✅ Rollback complete: Removed file columns")

if __name__ == "__main__":
    upgrade()
