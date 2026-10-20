import os
import base64
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # Limit uploads to 8 MB

def get_client():
    """Create a Gemini API client using the key stored in .env."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is missing. Add it to your .env file.")
    return genai.Client(api_key=api_key)

@app.get("/")
def index():
    """Show the main website page."""
    return render_template("index.html")

@app.post("/api/explain")
def explain():
    """Receive an image, ask Gemini to explain it, and return the answer as JSON."""
    if "image" not in request.files:
        return jsonify({"error": "Please capture or upload an image first."}), 400

    image = request.files["image"]
    if not image.filename:
        return jsonify({"error": "The image file is empty."}), 400

    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if image.mimetype not in allowed:
        return jsonify({"error": "Please use a JPG, PNG, WEBP, or GIF image."}), 400

    question = request.form.get("question", "").strip()
    if len(question) > 500:
        return jsonify({"error": "Please keep your question under 500 characters."}), 400

    image_bytes = image.read()
    if not image_bytes:
        return jsonify({"error": "The uploaded image is empty."}), 400

    # Convert the photo bytes into a format Gemini can accept.
    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type=image.mimetype
    )

    prompt = (
        "You are LittleLens, a friendly explainer for curious children. "
        "Look carefully at the image. Explain what can reasonably be identified "
        "using simple words a five-year-old can understand. Be warm, clear, and accurate. "
        "Do not pretend to know details that cannot be seen. If unsure what an object is, say so. "
        "Avoid dangerous instructions. Keep the whole answer concise. "
        "Include all three section :"
        " 1)What is it?"
        " 2)How does it work?"
        " 3) Fun Fact."
        "Write 2–3 simple sentences for each section.Complete every section."
        " Do not stop after the first heading"
    )

    if question:
        prompt += f"\n\nThe user's follow-up question is: {question}"

    try:
        client = get_client()
        model_name = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
        response = client.models.generate_content(
            model=model_name,
            contents=[prompt, image_part],
            config=types.GenerateContentConfig(
                temperature=0.5,
                max_output_tokens=800
            )
        )

        explanation = response.text or "I couldn't create an explanation for that image. Please try again."
        return jsonify({"explanation": explanation})

    except Exception:
        # Full error details go to the terminal, not to the public browser.
        app.logger.exception("Gemini image explanation failed")
        return jsonify({
            "error": "Gemini couldn't explain that image. Check your API key, model name, quota, and internet connection, then try again."
        }), 500

@app.errorhandler(413)
def too_large(_error):
    return jsonify({"error": "That image is too large. Please choose an image under 8 MB."}), 413

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)