import asyncio
import logging
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.db.database import Base
from app.models import user, repository, review  # Ensure models are imported

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    try:
        # Create engine
        engine = create_async_engine(settings.DATABASE_URL, echo=True)
        
        # Create all tables
        async with engine.begin() as conn:
            logger.info("Dropping all tables...")
            await conn.run_sync(Base.metadata.drop_all)
            logger.info("Creating all tables...")
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Database initialization successful!")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        
if __name__ == "__main__":
    asyncio.run(init_db())
