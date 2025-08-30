import os
from dotenv import load_dotenv
import cloudinary
from cloudinary.uploader import upload

load_dotenv()

def upload_file(file, folder):
    cloudinary.config(
        cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
        api_key=os.environ.get("CLOUDINARY_API_KEY"),
        api_secret=os.environ.get("CLOUDINARY_API_SECRET")
    )

    result = upload(file, folder=folder, resource_type="auto")
    return result["secure_url"]
