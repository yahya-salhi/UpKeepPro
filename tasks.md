# ISO21001-AI-Chatbot

## Project Overview

- This project is a **local AI-powered chatbot** aligned with **ISO 21001** standards (Educational Organizations Management Systems).
- The chatbot **must** deliver consistent, accurate, educational, and accessible information according to **ISO 21001** quality criteria.
- **Main focus**: user-centered design, clarity, accessibility, error tolerance, and quality service.

---

## Frontend Tech Stack

|               Tech                |           Purpose           |
| :-------------------------------: | :-------------------------: |
|             **React**             |     Component-based UI      |
|             **Vite**              |  Fast dev server & bundler  |
|         **Tailwind CSS**          |   Styling (utility-first)   |
|     **TanStack React Query**      | Server state & API requests |
|        **react-hook-form**        |     Forms & validations     |
|        **react-hot-toast**        |        Notifications        |
|           **moment.js**           |    Date/time formatting     |
| **lucide-react**, **react-icons** |            Icons            |

---

## Backend Tech Stack

|           Tech           |            Purpose            |
| :----------------------: | :---------------------------: |
| **Node.js (Express.js)** |      API Server (local)       |
|        **Ollama**        |    Local AI model provider    |
|        **Axios**         | API communication with Ollama |

Backend exposes:

- `POST /chat/send-message` → Send user message, get AI response.
- `GET /chat/history` → Fetch previous conversations.

---

## ISO21001 Requirements (Chatbot Standards)

- Accessibility:
  - Use **ARIA labels** and **full keyboard navigation**.
- Quality of Service:
  - Clear, unambiguous, educationally relevant answers.
  - Professional, polite tone.
- Error Handling:
  - Graceful fallback if AI is unavailable.
- Privacy:
  - No personal user data stored (ISO21001 & GDPR alignment).

---

## Folder Structure
