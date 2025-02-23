# Time Capsule

## 🚀 Deployment
This project can be accessed at:
🔗 **[https://time-capsule-2-krackhack.netlify.app/](https://time-capsule-2-krackhack.netlify.app/)**

Login Credentials:
- email: ayushmankoley1@gmail.com
- password: qwertyuiop

## 📌 Overview
Time Capsule is a web platform that allows users to create, store, and share digital memories in the form of text, images, and videos. Every memory is time-locked, meaning it can only be accessed after a specified future date. This ensures a unique way to preserve moments, fostering nostalgia and community storytelling while maintaining the anticipation of unlocking memories at the right time.

## 🚀 Features
- **Create & Store Memories** – Users can add text, images, and videos and keep them locked till a specific date.
- **Shared Capsules** – Multiple users can publicly share memory capsules.
- **Structured Timeline** – Memories are chronologically organized for easy navigation.
- **Secure Cloud Storage** – Ensures long-term accessibility and preservation.
- **Responsive UI** – Optimized for both desktop and mobile.

## 🛠 Tech Stack
### **Frontend**
- React (TypeScript) – UI development
- Vite – Build tool
- Tailwind CSS – Styling
- PostCSS – CSS processing

### **Backend & Database**
- Supabase – Authentication, database (PostgreSQL), and storage
- Node.js

### **Other Tools**
- ESLint – Code linting
- Environment Variables (`.env`) – Secure API keys

## 🔧 Installation & Setup

### 1️⃣ **Clone the Repository**
```sh
git clone https://github.com/ayushmankoley/time-capsule-2.0.git
cd time-capsule-2.0
```

### 2️⃣ **Install Dependencies**
```sh
npm install
```

### 3️⃣ **Setup Environment Variables**
Create a `.env` file in the root directory and add your Supabase credentials:
```sh
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4️⃣ **Run Supabase SQL Commands**
Login to your Supabase project, navigate to the SQL Editor, and execute the following SQL commands to set up the required tables:
```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the capsules table
CREATE TABLE capsules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    unlock_date TIMESTAMP NOT NULL,
    is_private BOOLEAN DEFAULT TRUE,
    allow_collaborators BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users ON DELETE SET NULL,
    cover_image TEXT
);

-- Create the capsule_contents table
CREATE TABLE capsule_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE,
    content_type TEXT CHECK (content_type IN ('text', 'image', 'video', 'audio', 'document')),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users ON DELETE SET NULL
);

-- Create the capsule_collaborators table
CREATE TABLE capsule_collaborators (
    capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    role TEXT CHECK (role IN ('viewer', 'contributor')),
    added_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (capsule_id, user_id)
);

-- Create a storage bucket for capsule contents
SELECT create_bucket('capsule-content', true);

-- Create a storage bucket for capsule images (optional)
SELECT create_bucket('capsule-images', true);
```

### 5️⃣ **Start the Development Server**
```sh
npm run dev
```

### Project Structure
```
time-capsule-2.0/
│── node_modules/
│── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   ├── hooks/
│   │   ├── useStorage.ts
│   ├── lib/
│   |   ├── supabase.ts
│   ├── pages/
│   │   ├── Auth.tsx
│   │   ├── CreateCapsule.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Home.tsx
│   │   ├── ViewCapsule.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── capsuleStore.ts
│   ├── types/
│   │   ├── database.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── default-cover.jpeg
│   ├── timecapsulelogo2.jpg
│   ├── timecapsulelogo3.svg
│── .env
│── .gitignore
│── eslint.config.js
│── favicon.png
│── index.html
│── package-lock.json
│── package.json
│── postcss.config.js
│── README.md
│── tailwind.config.js
│── tsconfig.app.json
│── tsconfig.json
│── tsconfig.node.json
│── vite.config.ts

```

## 🚀 Code Summary
- **User Authentication**: `Auth.tsx` (via Supabase)  
- **Creating Capsules**: `CreateCapsule.tsx` (users add text, images, videos)  
- **Viewing Capsules**: `ViewCapsule.tsx` (users access unlocked memories)  
- **Dashboard**: `Dashboard.tsx` (overview of all created capsules)  
- **State Management**: `authStore.ts` & `capsuleStore.ts` (State store)  
- **Storage Handling**: `useStorage.ts` (managing file uploads via Supabase)  
- **Database Schema**: `database.ts` (TypeScript types for database structure)  

## 📜 License
This project is licensed under the MIT License.

## 📧 Contact
For any queries, reach out at [ayushmankoley1@gmail.com](mailto:ayushmankoley1@gmail.com).
