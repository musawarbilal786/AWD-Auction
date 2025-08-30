import requests
import os
from dotenv import load_dotenv

load_dotenv()

def validated_location(location):
    address = location.address if location.address else ""
    city = location.city.name if location.city else ""
    state = location.state.name if location.state else ""
    country = location.state.country.name if location.state and location.state.country else ""

    return f"{address} {city} {state}, {country}"


def calculate_distance(origin, destination):
    origin_location = validated_location(origin)
    destination_location = validated_location(destination)

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    api_key = os.environ.get("GOOGLE_API_KEY")

    params = {
        "origins": origin_location,
        "destinations": destination_location,
        "key": api_key
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        print("data", data)

        if "rows" in data and len(data["rows"]) > 0:
            elements = data["rows"][0]["elements"]

            if len(elements) > 0:
                distance = elements[0].get("distance").get("text") if elements[0].get("distance") else None
                duration = elements[0].get("duration").get("text") if elements[0].get("duration") else None
                print(f"Distance: {distance}")
                print(f"Duration: {duration}")

                return distance, duration
            else:
                return None
        else:
            return None
    else:
        return None
