from flask import Flask, request, jsonify
from encryption_module import encrypt_message
from flask_cors import CORS  # ✨ Enable CORS

app = Flask(__name__)
CORS(app)  # ✨ Allow cross-origin requests (e.g., from your HTML on port 5500)

@app.route('/encrypt', methods=['POST'])
def encrypt_property():
    # Get the data from the frontend
    property_name = request.json.get('property_name')
    password = request.json.get('password')
    
    # Encrypt the property name
    encrypted_data = encrypt_message(property_name, password)
    
    return jsonify(encrypted_data)

if __name__ == "__main__":
    app.run(debug=True)
