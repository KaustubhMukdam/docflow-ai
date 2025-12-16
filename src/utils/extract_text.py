#!/usr/bin/env python3
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from src.utils.file_processor import process_uploaded_file

def main():
    if len(sys.argv) != 2:
        print("Usage: extract_text.py <file_path>", file=sys.stderr)
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    # Extract filename from path
    filename = os.path.basename(file_path)
    
    try:
        extracted_text, file_type = process_uploaded_file(file_path, filename)
        print(extracted_text)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
