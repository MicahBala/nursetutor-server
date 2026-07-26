# NurseTutorNG: AI-Powered Concept Mastery for Nursing Students

**NurseTutorNG** is an early-stage, AI-native educational platform being built to help nursing students master difficult concepts, understand complex clinical rationales, and confidently prepare for both semester and final qualifying exams.

*Note: This project is currently in the active prototyping phase. The frontend and backend architectures are running locally and are being prepped for cloud deployment.*

## The Problem being Addressed
Nursing curriculums are incredibly dense, and students frequently struggle to grasp certain highly complex medical concepts. Traditional study materials and lectures often provide standard answers but fail to thoroughly explain the *clinical rationale*, i.e, the specific "why" behind a physiological process or medical decision. When students fail to internalize these difficult concepts, it directly impacts their performance in routine semester exams and jeopardizes their success in final qualifying exams.

## The AI-Native Solution (In Development)
NurseTutorNG is designed to act as an intelligent, personalized tutor to bridge this knowledge gap. Instead of relying purely on static textbooks, the platform integrates advanced Large Language Models to dynamically explain difficult topics/concepts.

**Core AI Features Being Built:**
- **Deep-Dive Rationales:** When a student struggles with a specific topic, the AI breaks down the underlying clinical concept step-by-step, providing a context-aware, easy-to-digest explanation.
- **Dynamic Quiz Generation:** Creates customized questions tailored specifically to the concepts a student finds most difficult to grasp.
- **Concept Simplification:** Allows students to input dense medical texts and receive simplified, localized summaries to aid retention.

## System Architecture & Tech Stack

The platform is built using the MERN stack. Currently running in a local development environment, it is intentionally designed for a seamless transition to Google Cloud.

### 1. Artificial Intelligence
* **Google Gemini:** Serving as the core reasoning engine for generating clinical rationales and simplifying complex medical concepts.

### 2. Backend / Server (Node.js & Express)
* **API Gateway:** Handles routing, authentication, and data flow.
* **AI Orchestration:** Manages prompt engineering, context injection, and API calls to the Google DeepMind/Gemini endpoints.
* **Database (MongoDB):** Designed to store user progress, generated quizzes, and analytics on which concepts prove most difficult.

### 3. Frontend / Client (React.js)
* **User Dashboard:** A clean, responsive interface for students to interact with the AI and take practice quizzes.

### 4. Planned Cloud Infrastructure (Google Cloud Platform)
*As a Google Associate Cloud Engineer (ACE), I am architecting NurseTutor to be deployed securely and efficiently on GCP:*
* **Cloud Run:** For scalable, serverless container deployment of the Node backend.
* **Cloud IAM:** To enforce the principle of least privilege for backend services accessing AI models.

## 🔗 Repository Structure

This project is split into a client and server repositories. You can view the current local development progress here:

* [🖥️ **NurseTutor-Client (Frontend)**](https://github.com/MicahBala/nursetutor-client) - React frontend repository.
* [⚙️ **NurseTutor-Server (Backend)**](https://github.com/MicahBala/nursetutor-server) - Node/Express backend containing the AI integration logic.

## 🚀 Roadmap
- [x] Define system architecture and identify core student pain points
- [x] Design initial database schema and establish MERN foundation
- [x] **Current:** Develop local MVP and integrate Google Gemini API for rationale generation
- [ ] Containerize application and deploy to Google Cloud (Cloud Run)
- [ ] Beta test with a small cohort of local nursing students preparing for semester exams

---
*Developed by a solo technical founder for the Google Africa Applied AI Lab Application.*