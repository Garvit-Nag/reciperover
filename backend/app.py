from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

df = pd.read_csv('recipes3hai.csv')

@app.route('/')
def home():
    return "<p>Hello, World :)</p>"

@app.route('/search', methods=['GET'])
def search_recipes():
    query = request.args.get('q', '').lower()
    if query:
        results = df[df['Name'].str.lower().str.contains(query)]
        response = results.to_dict(orient='records')
    else:
        response = df.to_dict(orient='records')
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)