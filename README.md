# 🎓 Cognify Classroom

**Cognify Classroom** is an immersive, multi-agent AI classroom simulator designed to bring digital education to life. It features a dynamic interplay between an AI teacher and pupils with distinct learning personalities, offering a unique "Observer Mode" where human users can step into the classroom, join the discussion, and receive personalized attention from the AI agents.

---

## 🎬 Overview
Cognify Classroom transforms static online learning into a living ecosystem. By leveraging advanced Large Language Models (LLMs) and high-fidelity text-to-speech (TTS), the platform simulates a real pedagogical environment where knowledge is not just delivered, but debated, questioned, and explored.

### ✨ Key Features
- **Sophisticated Multi-Agent System**: A cohesive group of AI agents—each with their own learning styles, emotional intelligence, and quirks.
- **Interactive "Observer Mode"**: Join the class as the 5th student. The AI teacher and classmates recognize your participation, answering your questions and reacting to your comments in real-time.
- **Dynamic Blackboard Engine**: Visual "chalk-and-talk" experience where the teacher types out concepts, definitions, and equations in sync with their speech.
- **Premium Glassmorphism UI**: A dark, modern interface built with sleek animations, vibrant highlights, and a focus on visual hierarchy.
- **AI-Driven Analytics**: Post-session evaluations that provide feedback on student engagement, class performance, and conversational sentiment.
- **Multi-Source TTS**: Support for **ElevenLabs** (Premium character voices) and ResponsiveVoice (High-performance web fallback).

---

## 👥 The Cast
Our classroom is populated by unique personas, each bringing a different energy to the learning experience:

### 🍎 The Teacher
- **Mr. Nova**: An encouraging, knowledgeable, and patient mentor. He uses the blackboard to explain complex concepts and ensures every student (including the Observer) is on track.

### 📚 The Students
- **Ali (Fast Learner)**: High engagement, asks deep follow-up questions, and pushes the lesson forward.
- **Kirtan (ESL Student)**: Thoughtful and diligent, often asks for clarifications or context, providing a perspective on accessibility.
- **Tayyab (Class Clown)**: Easily distracted and humor-focused. He keeps the class lighthearted but needs occasional redirection.
- **Rana (The Empath)**: Focuses on the emotional and moral implications of the topic, bringing heart to the discussion.

---

## 🛠️ Technology Stack
- **Framework**: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Vanilla CSS
- **AI Models**: OpenAI GPT-4o / GPT-4o-mini
- **Audio/Voice**: [ElevenLabs API](https://elevenlabs.io/) & [ResponsiveVoice](https://responsivevoice.org/)

---

## 🚀 Getting Started

### 📋 Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- OpenAI API Key
- (Optional) ElevenLabs API Key for premium voices

### 🔧 Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/cognify-classroom.git
   cd cognify-classroom
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_OPENAI_API_KEY=your_openai_key_here
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here
   ```

4. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   *Access the app at [http://localhost:5173](http://localhost:5173)*

---

## 📖 How to Use
1. **Select a Subject**: Choose from Science, History, Ethics, or Art from the landing page.
2. **Define a Topic**: Enter a specific topic you want the class to cover (e.g., "The Solar System" or "Stoic Philosophy").
3. **Launch Classroom**: Watch as Mr. Nova begins the lesson and students start interacting.
4. **Join as Student**: Click the **"🎓 Join as Student"** button at the top. Enter your name and use the input bar at the bottom to talk to the class!
5. **Analyze Results**: Once the session ends, review the AI-generated report card, sentiment analytics, and class highlights.

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ for the future of interactive education.*
