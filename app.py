from flask import Flask, request, jsonify
import os
from PIL import Image
import io
import imghdr
from werkzeug.utils import secure_filename
import time

app = Flask(__name__)

# Create a folder to save uploaded images
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Max file size limit
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB limit

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'image' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Validate the file type
    if not imghdr.what(file):
        return jsonify({"error": "Invalid image file"}), 400

    # Check file size
    if file.content_length > MAX_FILE_SIZE:
        return jsonify({"error": "File too large"}), 400

    # Secure the filename
    safe_filename = secure_filename(file.filename)

    # Save the image with a unique filename
    filename, extension = os.path.splitext(safe_filename)
    unique_filename = f"{filename}_{int(time.time())}{extension}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(file_path)

    # Open the image and perform AI processing here
    image = Image.open(file_path)
    # Perform your AI inspection here

    image_url = f"http://127.0.0.1:5000/uploads/{unique_filename}"
    return jsonify({"message": "File uploaded successfully", "file_path": file_path, "image_url": image_url}), 200

if __name__ == '__main__':
    app.run(debug=True)
