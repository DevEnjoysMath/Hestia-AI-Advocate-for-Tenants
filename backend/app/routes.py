from flask import jsonify
from . import app

@app.route('/')
def home():
    return jsonify({"status": "ok", "message": "Hestia API is running"})

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"}) 