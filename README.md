# LittleLens — Explain Like I'm Five Camera

An AI-powered website that captures or uploads an image and asks Google Gemini to explain it in child-friendly language.

## Requirements
- Python 3.10+
- A Gemini API key from Google AI Studio
- Access to the model selected in `.env`

## Run locally (Windows / VS Code)

1. Extract the ZIP and open the `littlelens` folder in VS Code.
2. Open the VS Code terminal in that folder.
3. Create and activate a virtual environment:

```powershell
py -m venv .venv
.venv\Scripts\activate
```

4. Install dependencies:

```powershell
pip install -r requirements.txt
```

5. In Google AI Studio, create an API key. Copy `.env.example` to a file named `.env` and set your key:

```env
GEMINI_API_KEY=your_real_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Use a vision-capable model that is currently available to your account. Model names and free-tier availability can change.

6. Start the app:

```powershell
python app.py
```

7. Open `http://127.0.0.1:5000` in your browser.

Camera permissions work on localhost in modern browsers. A deployed site needs HTTPS.

## How it works
- Browser JavaScript captures or uploads a photo and sends it to `/api/explain`.
- Flask validates the upload, reads the photo and optional question, then sends both to Gemini.
- Gemini returns an explanation, which the frontend displays.
- The app does not save uploaded photos in its own database.

## Security and costs
- Keep your key in `.env`; never put it in JavaScript or commit it to GitHub.
- API use is separate from the Gemini/Google AI Studio web interface and may have quotas or charges depending on the model/account.
- Check current Gemini API pricing, rate limits, and data-use terms.
- This starter app is for local development. Before public deployment, turn off Flask debug mode and add appropriate rate limiting.
- AI can make mistakes. Do not rely on it for medical, safety-critical, or other high-stakes identification.
