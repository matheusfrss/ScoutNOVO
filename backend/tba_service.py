import requests

API_KEY = "SUA_API_KEY"

BASE_URL = "https://www.thebluealliance.com/api/v3"

headers = {
    "X-TBA-Auth-Key": API_KEY
}

# ======================
# RANKINGS
# ======================

def get_rankings(event_key):

    url = f"{BASE_URL}/event/{event_key}/rankings"

    response = requests.get(url, headers=headers)

    return response.json()

# ======================
# SCOUT SCORE IA
# ======================

def calculate_scout_score(team, opr):

    wins = team["record"]["wins"]
    losses = team["record"]["losses"]
    matches = team["matches_played"]

    score = (
        opr * 0.6 +
        wins * 8 -
        losses * 4 +
        matches
    )

    return round(score, 2)

# ======================
# OPRS
# ======================

def get_oprs(event_key):

    url = f"{BASE_URL}/event/{event_key}/oprs"

    response = requests.get(url, headers=headers)

    return response.json()