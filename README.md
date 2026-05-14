# 🧠 ThreadWise
### AI-Powered Intelligent Email Aggregator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green)
![React](https://img.shields.io/badge/React-v19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-cyan)


> **ThreadWise** is a modern, full-stack email client that unifies your inboxes and uses **Local AI (LLMs)** to categorize, index, and understand your communications. Say goodbye to information overload.
---

## 📸 Screenshots

### 🧠 AI & Dashboard
| **Unified Inbox Feed** | **AI Chat Assistant (RAG)** |
|:---:|:---:|
| ![Dashboard](assets/dashboard.png) | ![AI Assistant](assets/assistant.png) |
| *Smart feed with auto-categorization* | *Ask questions to your inbox contextually* |

### ⚡ Smart Features
| **Secure Mailbox Connection** | **Email Details Modal** |
|:---:|:---:|
| ![Connect Mailbox](assets/connect.png) | ![Email Details](assets/mail.png) |
| *Securely link Gmail via App Passwords* | *Read full emails without leaving the feed* |

### 🔍 Search & Auth
| **Instant Search** | **User Registration** | **Secure Login** |
|:---:|:---:|:---:|
| ![Search](assets/search.png) | ![Register](assets/register.png) | ![Login](assets/login.png) |
| *Find any email instantly with Elasticsearch* | *Secure Registration* | *Secure Login* | 

---

## 🚀 Why ThreadWise?
Modern email is broken. We have too many accounts and too much noise. ThreadWise solves this by:
1.  **Unifying Accounts:** Connect multiple Gmail accounts via secure IMAP.
2.  **Local Privacy:** Uses **Ollama** to run AI models locally on your machine—your data never leaves your specialized backend.
3.  **User-Steerable AI:** Define your own custom keywords for "Interested" or "Spam" categories, dynamically adjusting the AI's behavior to your specific needs.
4.  **Real-Time Background Sync:** A Node.js background worker automatically fetches and categorizes new emails, while the React frontend silently polls for updates without interrupting your workflow.
5.  **Chat with Data:** Uses **RAG (Retrieval Augmented Generation)** so you can ask "Did I get any job offers?" and get an instant answer.
---

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black) | **Vite + React 19**. Fast, component-based UI. |
| **Styling** | ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) | **Tailwind v4**. Utility-first styling for a modern look. |
| **Backend** | ![Nodejs](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) | **Express.js**. REST API handling auth and logic. |
| **Database** | ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white) | **MongoDB Atlas**. Stores user profiles and encrypted credentials. |
| **Search Engine** | ![Elasticsearch](https://img.shields.io/badge/-Elasticsearch-005571?logo=elasticsearch&logoColor=white) | **Elasticsearch**. Indexed storage for full-text search. |
| **AI / LLM** | ![Ollama](https://img.shields.io/badge/-Ollama-000000?logo=ollama&logoColor=white) | **Llama 3.2**. Local inference for email classification. |
| **Auth** | ![Google](https://img.shields.io/badge/-Google_OAuth-4285F4?logo=google&logoColor=white) | **Passport.js**. Secure Google Login & JWT Sessions. |

---

## ✨ Key Features

* **🔐 Secure Authentication:** Hybrid login system supporting standard Email/Password (with regex validation) and **Google OAuth**. Credentials are AES-encrypted before database storage.
* **⚙️ Background Auto-Sync:** A `node-cron` worker automatically processes IMAP streams in the background, tagging emails and saving them to Elasticsearch.
* **🧠 Chat with Inbox (RAG):** A floating AI assistant that answers questions based on your email context using local LLMs.
* **🤖 Customizable AI Rules:** Users can input specific keywords via a Settings panel to override standard AI behavior and retroactively re-label existing emails.
* **🔎 Full-Text Search:** Elasticsearch index allows for finding any email by keyword instantly.
* **🔔 Interactive Notifications:** Real-time `react-hot-toast` alerts notify you of sync completion and explicitly highlight new, high-priority emails.
---

## ⚙️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
* **Node.js** (v18 or higher)
* **Docker Desktop** (For running Elasticsearch)
* **Ollama** (Installed locally for AI features)
* **MongoDB Atlas** account

---

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/threadwise.git](https://github.com/yourusername/threadwise.git)
cd threadwise
```


### 2. Backend Setup

```bash
cd server
npm install
```

### Create a .env file in the server folder:

#### Code snippet
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SLACK_WEBHOOK_URL=your_slack_webhook (optional)
WEBHOOK_SITE_URL=your_webhook_site_url (optional)
```

### Start the Backend:

```bash
npm run server
```

### 3. Frontend Setup

#### Open a new terminal.

```bash
cd threadwise
cd client
npm install
npm run dev
```

### 4. Infrastructure Setup
#### Start Elasticsearch (Docker):

```bash
docker run --name threadwise-es -d -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.11.1
```
#### Start Local AI (Ollama):

```bash
ollama run llama3.2
```

**📖 Usage Guide**

* **Register:** Create an account or sign in with Google.

* **Connect:** Go to "Link Mailbox". Enter your Gmail address and App Password (Not your login password!).

* **Set Rules:** Click the Gear icon to define what keywords constitute an "Interested" or "Spam" email for you.

* **Wait:** The background worker will automatically fetch emails, send them to Ollama for tagging based on your rules, and save them to Elasticsearch.

* **Search & Chat:** Use the top bar to filter emails instantly, or open the AI Chat Bubble to ask questions about your inbox.


---


## 🔮 Roadmap

[x] User Authentication (JWT + OAuth)

[x] IMAP Integration

[x] Local AI Classification

[x] Full-Text Search

[x] Chat with Inbox (RAG)

[x] Dynamic AI Rules & Retroactive Labeling

[x] Background Auto-Sync & Silent Frontend Polling

[x] Account Management (Delete/Logout)

🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.