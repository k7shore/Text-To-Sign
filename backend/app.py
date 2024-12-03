import os
import shutil
import cv2
import subprocess
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Folder paths
IMAGES_FOLDER = os.path.abspath("images")
TEMP_FOLDER = os.path.abspath("temp")
VIDEO_FOLDER = os.path.abspath("video")

# Ensuring temp and video folders exist
os.makedirs(TEMP_FOLDER, exist_ok=True)
os.makedirs(VIDEO_FOLDER, exist_ok=True)

@app.route('/generate_sign_images', methods=['POST'])
def generate_sign_images():
     # Clear the temp folder
    for file in os.listdir(TEMP_FOLDER):
        file_path = os.path.join(TEMP_FOLDER, file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error clearing file {file_path}: {e}")

    data = request.json
    text = data.get('text', '').upper()
    
    if not text:
        return jsonify({'error': 'Text is required'}), 400
    
    image_paths = []
    
    # Process each character in the text
    for char in text:
        if char.isalpha():  # Only process alphabetic characters
            image_path = os.path.join(IMAGES_FOLDER, f"{char}.png")
            if os.path.exists(image_path):
                temp_path = os.path.join(TEMP_FOLDER, f"{char}.png")
                shutil.copy(image_path, temp_path)
                image_paths.append(f"/temp/{char}.png")
            else:
                print(f"Image not found for: {char}")
    
    if not image_paths:
        return jsonify({'error': 'No valid images found for the input text'}), 400
    
    return jsonify({'imagePaths': image_paths})

def optimize_video(input_video_path, output_video_path):
    try:
        ffmpeg_command = [
            "ffmpeg", "-i", input_video_path,
            "-vcodec", "libx264", "-preset", "fast", "-crf", "23",
            "-acodec", "aac", "-b:a", "128k",
            "-movflags", "+faststart", "-y", output_video_path 
        ]
        
        subprocess.run(ffmpeg_command, check=True)
        print(f"Video optimized successfully: {output_video_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg optimization failed: {e}")
        return False

@app.route('/generate_video', methods=['POST'])
def generate_video():
    # Get image paths from the 'temp' folder
    image_files = sorted([f for f in os.listdir(TEMP_FOLDER) if f.endswith(".png")])
    if not image_files:
        return jsonify({"error": "No images found to generate video"}), 400
    
    # Path for the output video file
    video_path = os.path.join(VIDEO_FOLDER, "sign_language_video.mp4")
    final_video_path = os.path.join(VIDEO_FOLDER, "sign_language_video2.mp4")
    # OpenCV video writer settings
    frame_size = (640, 480)  # Adjust to the size of your images
    fps = 1  # Frame per second (1 image per second)

    # Create the VideoWriter object with the 'mp4v' codec
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # 'mp4v' is commonly supported in browsers
    video_writer = cv2.VideoWriter(video_path, fourcc, fps, frame_size)

    # Process each image in the temp folder and add to video
    for img_file in image_files:
        img_path = os.path.join(TEMP_FOLDER, img_file)
        img = cv2.imread(img_path)
        
        # Resize if necessary
        img_resized = cv2.resize(img, frame_size)
        
        # Write frame to video
        video_writer.write(img_resized)

    video_writer.release()
    #optimize_video(video_path,video_path)
    try:
        ffmpeg_command = [
            "ffmpeg", "-i", video_path,
            "-vcodec", "libx264", "-preset", "fast", "-crf", "23",
            "-acodec", "aac", "-b:a", "128k",
            "-movflags", "+faststart", "-y", final_video_path
        ]
        subprocess.run(ffmpeg_command, check=True)
        print(f"Video optimized successfully: {final_video_path}")
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg optimization failed: {e}")
        return jsonify({"error": "Video optimization failed"}), 500
    # Return the video URL
    return jsonify({"video_url": f"/video/{os.path.basename(final_video_path)}"})


@app.route('/temp/<filename>')
def get_temp_image(filename):
    return send_from_directory(TEMP_FOLDER, filename)

@app.route('/video/<filename>')
def get_video(filename):
    return send_from_directory(VIDEO_FOLDER, filename)

if __name__ == "__main__":
    app.run(debug=True)
