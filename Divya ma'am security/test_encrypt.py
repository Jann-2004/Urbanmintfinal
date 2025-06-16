from flask import Flask, request, jsonify
from encryption_module import encrypt_message
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/encrypt', methods=['POST'])
def encrypt_properties():
    password = request.json.get('password')

    # 🔐 Your purchased properties
    property_names = [
        "Lucknow - UP Land",
        "Sankar - Bengaluru Land",
        "Manu - Patna Land",
        "Thannu - Ghaziabad Land",
        "Jack - Thane School Land",
        "Adishesh - Visakhapatnam School",
        "Urban Nest 2BHK - Bangalore",
        "Bangalore Elite Land - Bangalore",
        "Villa Paradise in Delhi - Delhi",
        "Land Paradise in Mumbai - Mumbai",
        "Commercial Paradise in Mumbai - Mumbai",
        "Mumbai Elite Villa - Mumbai",
        "Land Paradise in Mumbai - Mumbai",
        "Bangalore Elite Villa - Bangalore"
    ]

    encrypted_list = []

    for name in property_names:
        encrypted = encrypt_message(name, password)
        encrypted_list.append({
            "original": name,
            "ciphertext": encrypted['ciphertext'],
            "salt": encrypted['salt'],
            "iv": encrypted['iv']
        })

    return jsonify(encrypted_list)

if __name__ == "__main__":
    app.run(debug=True)
