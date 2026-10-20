# LittleLens — AI-Powered Image Understanding

## Overview

LittleLens is an AI-powered web application that helps users understand and explore the world through images. Users can upload an image or capture one using their device's camera, ask questions about its contents, and receive clear, accessible explanations powered by Google's Gemini AI.

By combining computer vision capabilities with natural language understanding, LittleLens makes exploring images more interactive and informative. Whether someone wants to identify an object, understand a scene, or learn more about something they have captured, LittleLens provides a simple interface for visual discovery.

## Features

- **Image Upload:** Upload images directly from your device for analysis.
- **Camera Capture:** Capture images through your device's camera.
- **AI-Powered Image Analysis:** Uses Google's Gemini API to interpret image contents and answer questions.
- **Interactive Questioning:** Ask questions related to the uploaded or captured image.
- **Accessible Explanations:** Presents information in clear, easy-to-understand language.
- **Interactive User Interface:** Provides image previews, suggested questions, and dynamically displayed AI responses.
- **Custom Visual Design:** Features a colorful interface, illustrated elements, and custom typography.
- **Responsive Layout:** Designed to provide a consistent experience across supported screen sizes.

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| Flask | Web application framework |
| Google Gemini API | Image understanding and AI-generated explanations |
| HTML5 | Page structure |
| CSS3 | Styling, layout, and responsive design |
| JavaScript | Frontend interactions and API communication |
| python-dotenv | Environment variable management |

## Project Structure

```text
littlelens/
├── app.py
├── .env
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── style.css
    ├── script.js
    └── fonts/
        └── PadleCandy.otf
```

The `.env` file stores configuration values and should not be committed to version control.

## How It Works

1. The user uploads an image or captures one using the camera.
2. The application displays a preview of the selected image.
3. The user enters a question or chooses one of the suggested questions.
4. JavaScript sends the image and question to the Flask backend.
5. Flask processes the request and communicates with the Gemini API.
6. Gemini analyzes the image and generates a relevant response.
7. The frontend displays the explanation to the user.

## Getting Started

### Prerequisites

Before running LittleLens, ensure you have:

- Python installed on your system.
- pip, the Python package installer.
- A Google Gemini API key.
- A modern web browser.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/littlelens.git
cd littlelens
```

Replace `YOUR-USERNAME` with your GitHub username and adjust the repository name if necessary.

### 2. Create a Virtual Environment

On Windows:

```bash
python -m venv .venv
.venv\Scripts\activate
```

On macOS or Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

If a `requirements.txt` file is included in the repository, install the dependencies using:

```bash
pip install -r requirements.txt
```

Otherwise, install the packages required by your backend implementation. For example, a project using Flask, python-dotenv, and the Google Gen AI SDK may require:

```bash
pip install flask python-dotenv google-genai
```

Verify the imports in `app.py` and install the appropriate SDK for the Gemini API implementation used in your project.

### 4. Configure Environment Variables

Create a `.env` file in the same directory as `app.py` and add the following configuration:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model
```

Replace the placeholders with your actual Gemini API key and a model supported by your account and API configuration.

You can obtain an API key from [Google AI Studio](https://aistudio.google.com/).

**Security note:** Never expose your API key in frontend JavaScript or commit the `.env` file to a public repository.

### 5. Run the Application

With the virtual environment activated, execute:

```bash
python app.py
```

Open the local address displayed in the terminal. For a typical Flask development server, this is:

```text
http://127.0.0.1:5000
```

The LittleLens interface should now be accessible in your browser.


## Project Objective

LittleLens aims to make image understanding more accessible through a simple, interactive interface powered by generative AI. It bridges visual input and natural language explanations, allowing users to explore images and learn more about what they see.

