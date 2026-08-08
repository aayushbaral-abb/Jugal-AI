<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React Logo" width="60" height="60" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="TypeScript Logo" width="60" height="60" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vitejs/vitejs-original.svg" alt="Vite Logo" width="60" height="60" />
</p>

<h1 align="center">Jugal-AI</h1>

<p align="center">
  A fully client-side AI interface built with <strong>React</strong>, <strong>TypeScript</strong>, and <strong>Vite</strong>. Powered by the Google Gemini API with zero backend server dependency.
</p>

<p align="center">
  <a href="https://jugalteam.github.io/Jugal-AI/"><strong>🌐 View Live App</strong></a>
</p>

---

## 🔑 How It Works (Bring Your Own API Key)

This project operates **entirely in the browser** without a backend server. To keep your API usage secure and private:

1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Launch the app and enter your **Gemini API Key** in the setup modal/input field.
3. The key is stored locally in your browser (`localStorage`) and is **never** sent to any third-party backend servers.
4. Once saved, you can begin interacting with the AI instantly!

---

## 🛠️ Tech Stack & Dependencies

* **Frontend Framework:** React with TypeScript
* **Build Tool:** Vite
* **AI Engine:** Google Gemini API (`@google/genai`)
* **Storage:** Browser `localStorage` for client-side API key persistence
* **Styling & UI Components:** Custom modular styling and reusable React components

---

## 📁 Project Structure

```text
.
├── components/      # React components (chat, API key modal, input, layout)
├── services/        # Client-side Gemini API service wrapper
├── App.tsx          # Main application component & state management
├── constants.ts      # App configurations and system instructions
├── index.html       # HTML entry point
├── index.tsx        # React entry point
├── types.ts         # TypeScript interface definitions
├── vite.config.ts   # Vite configuration settings
└── package.json     # Project dependencies and script commands
