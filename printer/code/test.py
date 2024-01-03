import sys
import json


# Check if at least one argument (the payload) is provided
if len(sys.argv) < 2:
    print("Usage: python3 myscript.py payload_data")
    sys.exit(1)

payload_data = sys.argv[1]

print(type(payload_data))
print(payload_data)


try:
    payload_dict = json.loads(payload_data)
    print(payload_dict)
    print("Received payload data:")
    for key, value in payload_dict.items():
        print(f"{key}: {value}")

except json.JSONDecodeError as e:
    print("Error parsing JSON:", e)

# Generate Barcode
# Generate PNG Image
# Print PNG Image
