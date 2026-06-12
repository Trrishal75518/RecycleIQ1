from flask import Flask, render_template, jsonify
from data import cities

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/cities")
def get_cities():
    return jsonify(list(cities.keys()))

@app.route("/api/data/<city>")
def get_city(city):
    return jsonify(cities.get(city, {}))

@app.route("/api/ai/<city>")
def ai(city):

    city_data = cities.get(city, {})

    high = 0
    medium = 0

    for zone in city_data.values():

        if zone["risk"] == "High":
            high += 1

        elif zone["risk"] == "Medium":
            medium += 1

    if high >= 2:
        insight = f"🚨 {city} has multiple high-risk zones. Immediate waste collection is recommended."

    elif medium >= 3:
        insight = f"⚠ {city} has rising waste pressure. Recycling optimization suggested."

    else:
        insight = f"✅ {city} waste system is stable and operating efficiently."

    return jsonify({
        "insight": insight
    })

if __name__ == "__main__":
    app.run(debug=True)