from app.rent_checker import is_in_rpz

# Test addresses with Eircodes
test_addresses = [
    "A96HRR3",
    "Test Address A96HRR3",
    "123 Main St, Dublin",
    "Apt 31 Carraig Bui, Johnstown Road, Cabinteely",
    "D02X285",
    "A property in Wicklow A96 HRR3",
    "My address is A96 HRR3",
    "Property in Dublin with code D02 X285",
    "A96HRR3 is my Eircode",
    "A96 HRR3",
    "D02 X285"
]

print("Testing RPZ detection with various addresses:")
print("-" * 50)

for address in test_addresses:
    result = is_in_rpz(address)
    print(f"Address: {address}")
    print(f"Is in RPZ: {result}")
    print("-" * 50) 