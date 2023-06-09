from PIL import Image
import os
import sys

def rotate_image_with_orientation(image_path):
    image = Image.open(image_path)
    try:
        if hasattr(image, '_getexif'):  # Check if the image has EXIF data
            exif_data = image._getexif()
            print(exif_data)
            if exif_data is not None:
                orientation = exif_data.get(274)  # Retrieve the orientation tag (274)
                if orientation and orientation != 1:  # Rotate if the orientation is not 1 (no rotation)
                    if orientation == 3:
                        image = image.rotate(180, expand=True)
                    elif orientation == 6:
                        image = image.rotate(270, expand=True)
                    elif orientation == 8:
                        image = image.rotate(90, expand=True)
    except Exception as e:
        print("Error rotating image: " + str(e))
        pass  # Handle any errors gracefully
    image.save(image_path+".jpg", quality=100)
    return image_path+".jpg"


def convertImagesToWebp(obj):
    print("convertImage:",obj)
    img = Image.open(f"{obj}")
    imgName = obj.split("/")[-1]
    if "." in imgName:
        imgName = imgName.split(".")[0]
    path = str(obj).replace(imgName, "")
    imgName = rotate_image_with_orientation(obj)
    imgName = imgName.split("/")[-1]
    img = Image.open(f"{imgName}")
    img.save(f"{path + str(imgName).replace('.jpg','')}_org.webp", "webp", quality=10)
    height = img.height
    width = img.width

    ratio = height / width
    height = 300
    width = height / ratio

    img = img.resize((int(width), int(height)), Image.LANCZOS)
    img.save(f"{path + str(imgName).replace('.jpg','')}.webp", "webp", quality=10)
    os.remove(f"{imgName}")
    os.remove(f"{obj}")

convertImagesToWebp(sys.argv[1])

