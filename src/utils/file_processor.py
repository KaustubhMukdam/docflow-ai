import os
import PyPDF2
from docx import Document
from typing import Tuple

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        doc = Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text.strip()
    except Exception as e:
        raise Exception(f"Failed to extract text from DOCX: {str(e)}")

def extract_text_from_txt(file_path: str) -> str:
    """Extract text from TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except Exception as e:
        raise Exception(f"Failed to read TXT file: {str(e)}")

def process_uploaded_file(file_path: str, filename: str) -> Tuple[str, str]:
    """
    Process uploaded file and extract text based on file type
    Returns: (extracted_text, file_type)
    """
    file_extension = filename.lower().split('.')[-1]
    
    if file_extension == 'pdf':
        text = extract_text_from_pdf(file_path)
        file_type = 'pdf'
    elif file_extension in ['docx', 'doc']:
        text = extract_text_from_docx(file_path)
        file_type = 'docx'
    elif file_extension == 'txt':
        text = extract_text_from_txt(file_path)
        file_type = 'txt'
    else:
        raise Exception(f"Unsupported file type: {file_extension}")
    
    if not text or len(text.strip()) == 0:
        raise Exception("No text content found in file")
    
    return text, file_type
