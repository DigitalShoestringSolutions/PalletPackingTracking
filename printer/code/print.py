import barcode
from barcode import EAN13, Code128
from barcode.writer import ImageWriter
from io import BytesIO
import brother_ql
from brother_ql.raster import BrotherQLRaster
from brother_ql.backends.helpers import send
import os
import time
import datetime
from PIL import Image, ImageDraw, ImageFont
import sys
import json
import usb.core
import usb.util


def find_brother_ql_printer():
    # Search for the Brother QL printer by its vendor and product ID
    dev = usb.core.find(idVendor=0x04f9, idProduct=0x209b)

    if dev is None:
        raise ValueError("Brother QL printer not found!")

    return dev

def sendToPrinter(path):
    ## Printer Set-up
    
    # ~ dev = find_brother_ql_printer()
    # ~ print(dev)
    
    
    PRINTER_IDENTIFIER = '/dev/usb/lp0'    
    printer = BrotherQLRaster('QL-700')

    print_data = brother_ql.brother_ql_create.convert(printer, [path], '62', dither=True)
    
    print(f'Print Data {print_data}')
    print(path)
    try:
        send(print_data, PRINTER_IDENTIFIER)
    except(e):
        print("An exception occurred")
        print(e)


def createPNG(ID, output_path):
    bc_type = 'Code128' 
    options = dict(module_height=10, quiet_zone=5,font_size=5,text_distance=1,background='white',foreground='black',center_text=False, format='PNG')    
    BC = barcode.get_barcode_class(bc_type)
    BC(str(ID), writer=ImageWriter()).save(output_path, options)


def create_formatted_label(barcode_path, date_packed, product, pallet_no, output_path, customer=" "):
    print("Creating label image...")
    try:
        # Load the barcode image
        barcode_image = Image.open(barcode_path)

        # Assuming the example label dimensions based on the barcode size and the provided sample
        label_width = barcode_image.width 
        label_height = int(barcode_image.height * 2.5)
        print(label_width)

        # Create a new image with white background
        label_image = Image.new('RGB', (label_width, label_height), 'white')
        
        # Paste the barcode onto the new image, centered
        barcode_x = (label_width - barcode_image.width) // 2
        barcode_y = label_height - barcode_image.height
        label_image.paste(barcode_image, (barcode_x, barcode_y))

        # Set up the font for the text
        font_path = "/code/fonts/DejaVuSans-Bold.ttf"  # Adjust this path to your font file
        font_size = int(label_width * 0.1)  # Adjust size to your liking
        font = ImageFont.truetype(font_path, font_size)
        font_small = ImageFont.truetype(font_path, int(font_size * 0.5))
        
        # Initialize ImageDraw to add text to the image
        draw = ImageDraw.Draw(label_image)
        
        # Define text positions based on the provided layout
        pallet_no_position = (10, int(label_height * 0.05))
        pallet_no2_position = (10, int(label_height * 0.125))
        date_packed_position = (10, int(label_height * 0.15))
        date_packed2_position = (10, int(label_height * 0.225))
        customer_position = (10, int(label_height * 0.25))
        customer2_position = (10, int(label_height * 0.275))
        product_position = (10, int(label_height * 0.35))
        product2_position = (10, int(label_height * 0.425))

        # Add text to the image
        draw.text(pallet_no_position, f"PALLET NO.", fill="black", font=font)
        draw.text(pallet_no2_position, f"{pallet_no}", fill="black", font=font_small)
        draw.text(date_packed_position, f"DATE PACKED:", fill="black", font=font)
        draw.text(date_packed2_position, f"{date_packed}", fill="black", font=font_small)
        draw.text(customer_position, f"TO:", fill="black", font=font)
        draw.text(customer2_position, f"{customer}", fill="black", font=font_small)
        draw.text(product_position, f"PRODUCT:", fill="black", font=font)
        for item in product:
            draw.text(product2_position, item, fill="black", font=font_small)
            product2_position = (product2_position[0], product2_position[1] + int(label_height * 0.03))  # Adjust the vertical position        
        # Save the new image
        label_image.save(output_path)
        
        print( "Label image created successfully.")
    except Exception as e:
        print( str(e))

# To use the function, you would call it with the barcode image path and the information you want on the label:
# create_formatted_label(barcode_path, date_packed, customer, product, pallet_no, output_path)




def main():
    if len(sys.argv) < 2:
        print("Usage: python3 myscript.py payload_data")
        sys.exit(1)
    try:
        payload_data = sys.argv[1]
        payload_dict = json.loads(payload_data)
        print("Received payload data:")
        for key, value in payload_dict.items():
            print(f"{key}: {value}")
        createPNG(payload_dict['item_id'],'/code/barcodes/barcode' )
        create_formatted_label('/code/barcodes/barcode.png', payload_dict['timestamp'], payload_dict['product'], payload_dict['item_id'], '/code/barcodes/label.png', "")
        sendToPrinter('/code/barcodes/label.png')
        sendToPrinter('/code/barcodes/label.png')
        

    except json.JSONDecodeError as e:
        print("Error parsing JSON:", e)




if __name__ == "__main__":
    main()
