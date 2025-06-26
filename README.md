YapApp
YapApp is a real-time chat application built with Next.js, TailwindCSS, Zustand, Redis, and Pusher.
It supports secure Google authentication, features dynamic chat pages, message storage, and real-time updates—all with a modern and responsive UI.

🚀 Live Demo
https://yapapp.vercel.app

🛠️ Tech Stack
Frontend: Next.js (App Router), TailwindCSS, DaisyUI, Zustand
Backend: Server Actions, Redis (Upstash), Pusher, Auth.js
✨ Features
Google Sign-In with Auth.js for secure authentication
Real-time messaging powered by Pusher
Persistent message storage via Redis
Client-side state management with Zustand
Responsive UI with support for light and dark modes
(Planned) Push notifications for instant updates
📦 Installation
bash
git clone https://github.com/Taher-Ali94/YapApp-Next.git
cd YapApp-Next
npm install
npm run dev
Environment Variables
Create a .env.local file in the root directory and add the following (replace with your own values):

Code
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
💻 Usage
Visit http://localhost:3000 after starting the development server.
Sign in with your Google account.
Start chatting in real time with other users!
🤝 Contributing
Contributions are welcome! Please open an issue or pull request for suggestions, bug reports, or improvements.

