https://ai.studio/apps/9b950ff4-0458-46a1-aee3-c9fc1e5236ac
<div align="center">

<img src="https://img.shields.io/badge/🏆_DevFusion-Hackathon_2.0-gold?style=for-the-badge&labelColor=1a1a2e&color=f5a623" />
<img src="https://img.shields.io/badge/IIT_Bombay-Presented_At-blue?style=for-the-badge&labelColor=1a1a2e&color=0066cc" />
<img src="https://img.shields.io/badge/Powered_By-Gemini_AI-green?style=for-the-badge&labelColor=1a1a2e&color=4285f4" />

<br/><br/>

```
 ███╗   ██╗███████╗███████╗████████╗███████╗██╗███╗   ██╗██████╗ ███████╗██████╗ 
 ████╗  ██║██╔════╝██╔════╝╚══██╔══╝██╔════╝██║████╗  ██║██╔══██╗██╔════╝██╔══██╗
 ██╔██╗ ██║█████╗  ███████╗   ██║   █████╗  ██║██╔██╗ ██║██║  ██║█████╗  ██████╔╝
 ██║╚██╗██║██╔══╝  ╚════██║   ██║   ██╔══╝  ██║██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗
 ██║ ╚████║███████╗███████║   ██║   ██║     ██║██║ ╚████║██████╔╝███████╗██║  ██║
 ╚═╝  ╚═══╝╚══════╝╚══════╝   ╚═╝   ╚═╝     ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝
```

### **Your AI-Powered Home, Found.**
*Talk to NestFinder. Describe your dream home. Get it.*

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Try_NestFinder-brightgreen?style=for-the-badge)](https://aistudio.google.com/apps/9b950ff4-0458-46a1-aee3-c9fc1e5236ac)
[![GitHub](https://img.shields.io/badge/📁_GitHub-samrudh--nux/Nestfinder-black?style=for-the-badge)](https://github.com/samrudh-nux/Nestfinder)
[![Hackathon](https://img.shields.io/badge/DevFusion_2.0-gold?style=for-the-badge)](https://devfusion.iitb.ac.in)

<br/>

---

</div>

##  Built for DevFusion: The Developers Hackathon 2.0 — IIT Bombay
>  Built a conversational AI agent that redefines how people search for their next home — no filters, no forms, no friction. Just a conversation.

---

## 🔥 The Problem

Finding a home is one of the most stressful, time-consuming, and emotionally draining experiences a person can go through.

Current real estate platforms bombard you with:
- ❌ Endless dropdowns and filter menus
- ❌ Irrelevant listings that don't match your real needs
- ❌ Zero understanding of *context* ("I need a quiet neighborhood near good schools")
- ❌ No intelligent follow-up — just static search results

**People don't think in filters. They think in stories.**

---

## 💡 Our Solution — NestFinder

**NestFinder** is a Gemini-powered conversational AI assistant that lets you describe your ideal home in plain, natural language and surfaces the most relevant listings intelligently.

Just say things like:

> *"I'm looking for a 2BHK flat in Pune, pet-friendly, near a metro station, under ₹25,000/month"*

> *"Show me quiet 3-bedroom houses in Bangalore suitable for a family with kids, with a park nearby"*

NestFinder **understands context**, **asks follow-up questions**, and **narrows down** the perfect match — just like talking to a real estate expert who actually listens.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗣️ **Conversational Search** | Natural language input — describe your home like you'd tell a friend |
| 🧠 **Gemini AI Core** | Powered by Google's Gemini model for deep language understanding |
| 🔁 **Multi-turn Dialogue** | Remembers context across messages — no repeating yourself |
| 📍 **Location Intelligence** | Understands landmarks, city zones, and proximity requirements |
| 💰 **Budget Awareness** | Parses price ranges, rent vs buy, and negotiation hints |
| 🐾 **Preference Parsing** | Pet-friendly, furnished, parking, floor preferences — all understood |
| ⚡ **Instant Results** | Real-time streaming responses powered by Google AI Studio |
| 📱 **Responsive UI** | Works beautifully across desktop and mobile |

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      NESTFINDER STACK                       │
├─────────────────┬───────────────────────────────────────────┤
│  AI / LLM       │  Google Gemini (via AI Studio)            │
│  Platform       │  Google AI Studio App Hosting             │
│  Language       │  Python / JavaScript                      │
│  UI             │  AI Studio Web Interface + Custom Frontend│
│  APIs           │  Gemini API (gemini-2.0-flash)            │
│  Deployment     │  Google Cloud / AI Studio                 │
└─────────────────┴───────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- A [Google AI Studio](https://aistudio.google.com) account
- A Gemini API Key

### 1. Clone the Repository

```bash
git clone https://github.com/samrudh-nux/Nestfinder.git
cd Nestfinder
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up Your API Key

```bash
# Create a .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

Or export it directly:

```bash
export GEMINI_API_KEY="your_api_key_here"
```

### 4. Run the App

```bash
python app.py
```

Then open your browser at `http://localhost:8080`

### 🌐 Or Use the Live Demo

Just visit the hosted version directly — no setup required:

👉 **[https://ai.studio/apps/9b950ff4-0458-46a1-aee3-c9fc1e5236ac)**

---

## 🧠 How It Works

```
User Input (Natural Language)
         │
         ▼
┌─────────────────────┐
│   NestFinder Chat   │  ← You describe your dream home
│       Interface     │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   Gemini AI Model   │  ← Understands intent, location, budget,
│  (Context-Aware)    │     amenities, lifestyle needs
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Listing Matcher /  │  ← Filters and ranks the most relevant
│  Property Engine    │     homes based on parsed preferences
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   Results + Next    │  ← Presents matches, asks follow-ups,
│   Turn Dialogue     │     refines search further
└─────────────────────┘
```

---

## 📸 Screenshots

> *(Add your screenshots here)*

| Conversation View | Results Panel | Mobile View |
|---|---|---|
| `[screenshot_1.png]` | `[screenshot_2.png]` | `[screenshot_3.png]` |

---

## 🎯 Hackathon Journey

| Stage | Details |
|---|---|
|  **Event** | DevFusion: The Developers Hackathon 2.0 |
| ⏱️ **Duration** | 24 Hours |
| 💡 **Idea to Demo** | Conceived, built, and deployed in one night |
| 🎯 **Problem Domain** | AI / Real Estate / Conversational Interfaces |
| 🧰 **Core Tech** | Google Gemini API + AI Studio |

### What We Learned

- How to architect a multi-turn conversational AI agent from scratch
- Prompt engineering for domain-specific real estate queries
- Deploying AI-powered apps on Google AI Studio at speed
- The power of constraint — 24 hours forces clarity of vision

---

## 🗺️ Roadmap

- [ ] 🔌 Integrate live listing APIs (MagicBricks, 99acres, Housing.com)
- [ ] 🗺️ Interactive map view with neighborhood overlays
- [ ] 📊 Price trend analysis powered by Gemini
- [ ] 🔔 Smart alerts — notify when a matching listing appears
- [ ] 🤝 Agent connect — schedule visits directly from the chat
- [ ] 🌐 Multilingual support (Hindi, Tamil, Telugu, Kannada, Marathi)
- [ ] 📱 Native mobile app (Android + iOS)

---

## 👨‍💻 Team

| Name | Role | GitHub |
|---|---|---|
| **Samrudh** | AI/ML + Full Stack | [@samrudh-nux](https://github.com/samrudh-nux) |
| *(Add teammate)* | *(Role)* | *(@handle)* |
| *(Add teammate)* | *(Role)* | *(@handle)* |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
# Fork it
git fork https://github.com/samrudh-nux/Nestfinder

# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m "Add: some amazing feature"

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---


<div align="center">

**Built with ❤️ at IIT Bombay in 24 hours**

*DevFusion: The Developers Hackathon 2.0*

<br/>

[![Try Live](https:https://ai.studio/apps/9b950ff4-0458-46a1-aee3-c9fc1e5236ac)

<br/>

*If you like this project, please ⭐ star the repo — it helps more than you know!*

</div>
