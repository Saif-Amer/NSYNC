import cv2
import dlib
import numpy as np
import os

# Load the pre-trained shape predictor model
PREDICTOR_PATH = "shape_predictor_68_face_landmarks.dat"  # Update with your model path

# Initialize dlib's face detector and create a shape predictor
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(PREDICTOR_PATH)

# Function to extract mouth landmarks
def extract_mouth(landmarks):
    # The mouth landmarks are from 48 to 67 in the 68 landmarks model
    mouth_points = []
    for i in range(60, 68):
        mouth_points.append((landmarks.part(i).x, landmarks.part(i).y))
    return np.array(mouth_points, dtype=np.int32)

# Read the image
image_path = "/Users/aidantyler/Desktop/NSYNC-2/uploads/captured_image.jpg"  # Update with your image path
image = cv2.imread(image_path)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Detect faces in the image
faces = detector(gray)

for face in faces:
    # Get the landmarks for the face
    landmarks = predictor(gray, face)

    # Extract mouth points
    mouth = extract_mouth(landmarks)

    # Create a mask for the mouth
    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    cv2.fillConvexPoly(mask, mouth, 255)  # Fill the mouth area with white on the mask

    # Extract the mouth region from the image
    mouth_region = cv2.bitwise_and(image, image, mask=mask)
    
    # Get bounding box of the mouth region
    x, y, w, h = cv2.boundingRect(mouth)
    cv2.polylines(image, [mouth], isClosed=True, color=(0, 255, 0), thickness=2)
    
    # Crop the mouth region from the original image
    mouth_crop = mouth_region[y:y+h, x:x+w]

    # Path to save the cropped mouth region in the uploads folder
    output_path = os.path.join("/Users/aidantyler/Desktop/NSYNC-2/uploads", "extracted_mouth.jpg")

    # Save the cropped mouth image to the uploads folder
    cv2.imwrite(output_path, mouth_crop)

# Display the output
cv2.imshow("Mouth Detection", image)
cv2.waitKey(0)
cv2.destroyAllWindows()
