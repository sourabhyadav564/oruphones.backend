from PIL import Image
import os
import sys

def convertImagesToWebp(obj):
    print("convertImage:",obj)
    img = Image.open(f"{obj}")
    imgName = obj.split("/")[-1]
    if "." in imgName:
        imgName = imgName.split(".")[0]
    path = str(obj).replace(imgName, "")
    img.save(f"{path + imgName}_org.webp", "webp", quality=10)
    height = img.height
    width = img.width

    ratio = height / width
    height = 300
    width = height / ratio

    img = img.resize((int(width), int(height)), Image.LANCZOS)
    img.save(f"{path + imgName}.webp", "webp", quality=10)
    os.remove(f"{obj}")

convertImagesToWebp(sys.argv[1])

