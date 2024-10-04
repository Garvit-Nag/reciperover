# run.py
from app import create_app
from flask import Flask, jsonify
from flask_cors import CORS
import json

app = create_app()
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/form-data')
def get_form_data():
    with open('form_data.json', 'r') as file:
        data = json.load(file)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)