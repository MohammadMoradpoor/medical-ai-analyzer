"""Authentication dependencies for FastAPI endpoints"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from ..db.session import get_db
from ..db.models import User
from .security import verify_token

# Security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.
    
    Raises:
        HTTPException: If authentication fails
    """
    # TEMPORARY: For testing, create a mock user if no real users exist
    # This allows frontend testing without authentication
    users_count = db.query(User).count()
    if users_count == 0:
        # Create a temporary test user
        from ..auth.security import get_password_hash
        test_user = User(
            email="test@example.com",
            username="testuser",
            hashed_password=get_password_hash("test123"),
            full_name="Test User",
            is_active=True,
            is_verified=True
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        return test_user
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify token
    token = credentials.credentials
    payload = verify_token(token, token_type="access")
    
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user."""
    return current_user


def optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Optional authentication - returns user if authenticated, None otherwise.
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = verify_token(token, token_type="access")
        
        if payload is None:
            return None
        
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        user = db.query(User).filter(User.id == user_id).first()
        
        if user and user.is_active:
            return user
        
        return None
        
    except Exception:
        return None

