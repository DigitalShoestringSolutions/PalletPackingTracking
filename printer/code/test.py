import sys
import json


# Check if at least one argument (the payload) is provided
if len(sys.argv) < 2:
    print("Usage: python3 myscript.py payload_data")
    sys.exit(1)

# The first argument (sys.argv[1]) contains the payload data
payload_data = sys.argv[1]

print(type(payload_data))
print(payload_data)


try:
    # Parse the JSON string into a Python dictionary
    payload_dict = json.loads(payload_data)
    print(payload_dict)


    # Print each key-value pair
    print("Received payload data:")
    for key, value in payload_dict.items():
        print(f"{key}: {value}")

except json.JSONDecodeError as e:
    print("Error parsing JSON:", e)

