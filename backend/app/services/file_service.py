"""File upload and management service"""

import os
import uuid
import aiofiles
from fastapi import UploadFile
from typing import Optional
from datetime import datetime


class FileService:
    """Service for handling file uploads and storage"""
    
    def __init__(self):
        self.upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
        self._ensure_upload_directory()
    
    def _ensure_upload_directory(self):
        """Ensure upload directory exists"""
        if not os.path.exists(self.upload_dir):
            os.makedirs(self.upload_dir, exist_ok=True)
    
    async def save_uploaded_file(self, file: UploadFile, user_id: str) -> str:
        """
        Save uploaded file to disk.
        
        Args:
            file: Uploaded file
            user_id: ID of the user uploading the file
            
        Returns:
            File path where file was saved
        """
        # Create user-specific directory
        user_dir = os.path.join(self.upload_dir, user_id)
        if not os.path.exists(user_dir):
            os.makedirs(user_dir, exist_ok=True)
        
        # Generate unique filename
        file_ext = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(user_dir, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        return file_path
    
    def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from disk.
        
        Args:
            file_path: Path to file to delete
            
        Returns:
            True if file was deleted, False otherwise
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            print(f"Error deleting file: {str(e)}")
            return False
    
    def get_file_size(self, file_path: str) -> Optional[int]:
        """Get file size in bytes"""
        try:
            if os.path.exists(file_path):
                return os.path.getsize(file_path)
            return None
        except Exception:
            return None

