from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pickle
import numpy as np
from deepface import DeepFace
from scipy.spatial.distance import cosine

import firebase_admin
from firebase_admin import credentials, firestore

# 🔑 Firebase init
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)
CORS(app)
FACE_DB_PATH = "face_db.pkl"

if os.path.exists(FACE_DB_PATH):
    with open(FACE_DB_PATH, "rb") as f:
        face_db = pickle.load(f)
else:
    face_db = {}

# 🟢 Home
@app.route("/")
def home():
    return "🚀 Server OK"

# 🧪 Test Firebase
@app.route("/test")
def test():
    docs = db.collection("chatbot").stream()
    result = []

    for doc in docs:
        result.append(doc.to_dict())

    return jsonify(result)

# 🤖 Chatbot
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        msg = data.get("message", "").lower().strip()
        lang = data.get("lang", "fr")

        if not msg:
            return jsonify({"reply": "❌ message vide"})

        docs = db.collection("chatbot").stream()

        for doc in docs:
            d = doc.to_dict()

            q_fr = d.get("question_fr", "").lower()
            q_en = d.get("question_en", "").lower()
            q_tn = d.get("question_tn", "").lower()

            # 🔍 matching
            if msg in q_fr or msg in q_en or msg in q_tn:

                if lang == "fr":
                    return jsonify({"reply": d.get("answer_fr", "")})

                elif lang == "en":
                    return jsonify({"reply": d.get("answer_en", "")})

                else:
                    return jsonify({"reply": d.get("answer_tn", "")})

        # ❌ unknown question
        db.collection("unknown_questions").add({
            "question": msg,
            "lang": lang
        })

        return jsonify({
            "reply": "❌ Question non trouvée. Contact admin."
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"reply": "❌ Server error"})
 
@app.route("/add-student", methods=["POST"])
def add_student():
    try:
        name = request.form.get("name")
        prenom = request.form.get("prenom")
        classe = request.form.get("classe")
        email = request.form.get("email")

        files = request.files.getlist("images")

        label = f"{name} {prenom}".strip()
        embeddings = []

        os.makedirs("temp", exist_ok=True)

        for file in files:
            path = f"temp/{file.filename}"
            file.save(path)

            rep = DeepFace.represent(
                img_path=path,
                model_name="Facenet",
                enforce_detection=False,
                detector_backend="skip"
            )

            embeddings.append(rep[0]["embedding"])

        face_db[label] = {
            "classe": classe,
            "email": email,
            "embeddings": embeddings
        }

        with open(FACE_DB_PATH, "wb") as f:
            pickle.dump(face_db, f)

        return jsonify({"message": f"Student {label} added ✅"})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"message": "❌ error"})   

# ➕ Add Q/A (Admin)
@app.route("/add", methods=["POST"])
def add():
    try:
        data = request.get_json()

        db.collection("chatbot").add({
            "question_fr": data.get("question_fr", ""),
            "question_en": data.get("question_en", ""),
            "question_tn": data.get("question_tn", ""),
            "answer_fr": data.get("answer_fr", ""),
            "answer_en": data.get("answer_en", ""),
            "answer_tn": data.get("answer_tn", "")
        })

        return jsonify({"msg": "Ajouté ✅"})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"msg": "❌ erreur"})

# 📥 Get unknown questions
@app.route("/unknown", methods=["GET"])
def unknown():
    docs = db.collection("unknown_questions").stream()
    result = []

    for doc in docs:
        result.append(doc.to_dict())

    return jsonify(result)

# ❌ 404 handler
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found"}), 404

@app.route("/recognize", methods=["POST"])
def recognize():
    try:
        file = request.files["file"]
        path = "temp/test.jpg"
        file.save(path)

        query = DeepFace.represent(
            img_path=path,
            model_name="Facenet",
            enforce_detection=False,
            detector_backend="skip"
        )[0]["embedding"]

        best_match = None
        best_score = 1

        for person, data in face_db.items():
            for ref in data["embeddings"]:
                dist = cosine(query, ref)

                if dist < best_score:
                    best_score = dist
                    best_match = person

        if best_score < 0.4:
            return jsonify({
                "match": best_match,
                "score": float(best_score)
            })
        else:
            return jsonify({
                "match": "unknown",
                "score": float(best_score)
            })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "server error"})

# ▶ Start server
if __name__ == "__main__":
    print("🚀 Server starting...")
    app.run(debug=True)