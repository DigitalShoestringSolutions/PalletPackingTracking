from barcode import EAN13, Code128
from barcode.writer import ImageWriter
from io import BytesIO
import brother_ql
from brother_ql.raster import BrotherQLRaster
from brother_ql.backends.helpers import send
import os
import time
import datetime
# from PIL import Image, ImageDraw, ImageFont
# from PIL import PSDraw
import sys
import json


def sendToPrinter(path):
    ## Printer Set-up
    os.system("sudo chmod +777 /dev/usb/lp0")
    PRINTER_IDENTIFIER = '/dev/usb/lp0'
    printer = BrotherQLRaster('QL-700')

    filename = path
    print_data = brother_ql.brother_ql_create.convert(printer, [filename], '62', dither=True)
    try:
        send(print_data, PRINTER_IDENTIFIER)
    except:
        print("An exception occurred")


def createPNG(ID):
    # Get the current working directory
    print(os.path.exists('/code/barcodes/barcode.png'))
    
    with open('/code/barcodes/barcode.png', 'wb') as f:
        Code128(str(ID), writer=ImageWriter()).write(f)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 myscript.py payload_data")
        sys.exit(1)
    payload_data = sys.argv[1]
    try:
        payload_dict = json.loads(payload_data)
        print("Received payload data:")
        for key, value in payload_dict.items():
            print(f"{key}: {value}")
        createPNG(payload_dict['item_id'])
        # sendToPrinter('./barcodes/barcode.png')

    except json.JSONDecodeError as e:
        print("Error parsing JSON:", e)




if __name__ == "__main__":
    main()