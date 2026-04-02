#For now put a simple test version first,
#   so the app runs even before Google API:

def get_nearby_doctors(lat, lng):
    return {
        "message": "Doctors endpoint works",
        "lat": lat,
        "lng": lng
    }