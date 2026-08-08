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

## 🔑 How It Works (Client-Side API Key)

This project operates **100% on the client side** without any backend server infrastructure.

Whether running the app locally or visiting the live site:
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Enter your **Gemini API Key** directly in the app interface.
3. The key is stored locally in your browser (`localStorage`) and is **never** transmitted to any external backend server.

---

## 🛠️ Tech Stack & Dependencies

* **Frontend Framework:** React with TypeScript
* **Build Tool:** Vite
* **AI Engine:** Google Gemini API (`@google/genai`)
* **Storage:** Browser `localStorage` for client-side API key persistence
* **Styling & UI:** Custom React components and stylesheets

---

## 📁 Project Structure

```text
.
├── components/      # UI components (chat interface, API key modal, input)
├── services/        # Gemini API service wrapper
├── App.tsx          # Main application setup and state management
├── constants.ts      # Configurations and system prompts
├── index.html       # HTML entry point
├── index.tsx        # React root bootstrap
├── types.ts         # TypeScript interface definitions
├── vite.config.ts   # Vite bundler configuration
└── package.json     # Project dependencies and npm scripts
