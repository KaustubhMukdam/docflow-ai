import sys
import base64
import json

def file_to_base64(file_path):
    """Convert file to base64 string"""
    with open(file_path, 'rb') as file:
        file_data = file.read()
        base64_data = base64.b64encode(file_data).decode('utf-8')
        return base64_data

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python file_to_base64.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    filename = file_path.split('\\')[-1].split('/')[-1]
    
    base64_data = file_to_base64(file_path)
    
    # Create JSON payload
    payload = {
        "filename": filename,
        "document_type": "loan_application",
        "file_data": base64_data
    }
    
    # Save to file
    output_file = f"docs/payloads/upload_{filename.replace('.', '_')}.json"
    with open(output_file, 'w') as f:
        json.dump(payload, f)
    
    print(f"✅ Base64 payload saved to: {output_file}")
    print(f"📊 File size: {len(base64_data)} characters")
