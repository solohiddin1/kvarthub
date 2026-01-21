import nyckel
print("Invoking Nyckel function...")
credentials=nyckel.Credentials(client_id="trd4g01z92vbml5l6657qwkcrj3760i6", client_secret="880d7elwoiwuw5p39kfxjfhx71cxwut9kp2eksesk9j7zpfmtzxlkkntq3661ozt")
response = nyckel.invoke("house-presence-identifier", "https://www.nyckel.com/assets/example.jpg", credentials)
print("Invocation sent.")
print("Response received:")
print(response)
print("Label Name:", response.get("labelName"))
print("Confidence:", response.get("confidence"))
# Expected output:
# Invocation sent.
# Response received:
# {'labelName': 'House Present', 'labelId': 'label_2n5  a7za51n329v0l', 'confidence': 0.95}