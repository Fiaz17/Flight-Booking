import pandas as pd

# Read your CSV
df = pd.read_csv("airports_with_country.csv")

# Select only needed columns
df = df[['name', 'City', 'country_name', 'iata']]

# Drop rows with missing IATA codes if needed
df = df.dropna(subset=['iata'])

# Convert to JSON-like list of objects
records = df.to_dict(orient='records')

# Print formatted output
for r in records:
    print(f'{{ name: "{r["name"]}", City: "{r["City"]}", country_name: "{r["country_name"]}", iata: "{r["iata"]}" }},')

# Optional: save to JSON file
#df.to_json('filtered_airports.json', orient='records', indent=2)#

import pandas as pd
import json

# Load JSON file
with open("filtered_airports.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Convert to DataFrame for convenience
df = pd.DataFrame(data)

# Count entries by 'name'
count = df['name'].count()
print("Total airports:", count)

