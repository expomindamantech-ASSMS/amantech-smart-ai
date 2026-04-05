# 🧠 AmanTech Smart AI (ASS AI)
### Ghana's Premier AI-Powered Education Platform

Built specifically for Ghana's NaCCA curriculum, supporting teachers and learners with AI-powered tools.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📚 Lesson Plans | NaCCA-aligned, GES-standard lesson plans in minutes |
| 📝 Assessments | BECE/WASSCE exam questions + marking schemes |
| 🔬 Research & Projects | AI research assistant with Ghana curriculum context |
| 🎮 Educational Games | Curriculum-aligned classroom games |
| 📅 Calendar & Timetable | School schedules + Ghana 3-term academic calendar |
| 📊 Report Cards | GES-format report cards with PDF download |
| 🖼️ Images & Media | AI image analysis for educational content |
| 🎙️ Voice Notes | Record, transcribe and process audio with AI |
| 👑 Admin Dashboard | User management, subscriptions, broadcast notifications |

---

## 💳 Subscription Plans (Paystack / GHS)

| Plan | Price | Duration |
|------|-------|----------|
| Free Trial | GH₵0 | 5 requests |
| Daily | GH₵7 | 1 day |
| Weekly | GH₵15 | 7 days |
| Monthly | GH₵55 | 30 days |
| Yearly | GH₵450 | 365 days |

---

## 🚀 DEPLOYMENT GUIDE (Step-by-Step)

### STEP 1: Get Your API Keys

#### A) Back4App (Free Backend)
1. Go to https://back4app.com and create a free account
2. Click "Build new app" → name it `amantech-smart-ai`
3. Go to **App Settings → Security & Keys**
4. Copy:
   - **Application ID** → `REACT_APP_BACK4APP_APP_ID`
   - **JavaScript Key** → `REACT_APP_BACK4APP_JS_KEY`

5. **Set up Back4App classes** (go to Dashboard → your app → Database):
   - The following classes are created automatically when users interact with the app:
     - `_User` (built-in) — users with fields: `name`, `email`, `entriesUsed`, `subscriptionExpiry`, `plan`, `isAdmin`
     - `Entry` — stores AI-generated content
     - `Payment` — stores payment records
     - `Notification` — stores user notifications
     - `AppSettings` — stores admin settings

6. **Set up Back4App ACL (Security):**
   - In Dashboard → Security → Class-Level Permissions:
     - `Entry`: Set public create = off, public read = off (users only access their own)
     - `Notification`: Set public read = off
     - `Payment`: Set public read = off

#### B) Google Gemini API Key (FREE)
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"** → select a Google Cloud project (or create one)
4. Copy the key → `REACT_APP_GEMINI_API_KEY`

> ✅ Gemini 2.0 Flash is **free** with generous daily limits — no billing required to get started!

#### C) Paystack
1. Go to https://dashboard.paystack.com
2. Create account and complete business verification
3. Go to **Settings → API Keys & Webhooks**
4. Copy the **Public Key** (use `pk_test_...` for testing first)
5. Copy → `REACT_APP_PAYSTACK_PUBLIC_KEY`

---

### STEP 2: Set Up Project Locally

```bash
# Clone or download the project
git clone https://github.com/YOUR_USERNAME/amantech-smart-ai.git
cd amantech-smart-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local and fill in your API keys
nano .env.local   # or open in VS Code
```

Your `.env.local` should look like:
```
REACT_APP_BACK4APP_APP_ID=abc123xyz
REACT_APP_BACK4APP_JS_KEY=def456uvw
REACT_APP_GEMINI_API_KEY=AIzaSy...
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_...
```

```bash
# Test locally
npm start
# App opens at http://localhost:3000
```

---

### STEP 3: Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: AmanTech Smart AI"

# Create a repo on GitHub (github.com → New repository)
# Name it: amantech-smart-ai

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/amantech-smart-ai.git
git branch -M main
git push -u origin main
```

> ⚠️ Make sure `.env.local` is in `.gitignore` (it already is) — NEVER push API keys to GitHub!

---

### STEP 4: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New → Project"**
3. Select your `amantech-smart-ai` repository
4. Vercel auto-detects it as a React app

5. **IMPORTANT: Add Environment Variables** in Vercel:
   - Click "Environment Variables" section
   - Add each key from your `.env.local`:
     ```
     REACT_APP_BACK4APP_APP_ID     = your_value
     REACT_APP_BACK4APP_JS_KEY     = your_value  
     REACT_APP_GEMINI_API_KEY      = your_value
     REACT_APP_PAYSTACK_PUBLIC_KEY = your_value
     ```

6. Click **"Deploy"** 🚀

7. Your app will be live at: `https://amantech-smart-ai.vercel.app`

---

### STEP 5: Admin Access

1. Sign up with `amarnahf@gmail.com` — this email gets automatic admin access
2. Go to `/admin` to see the admin dashboard
3. Go to `/admin/settings` to upload your AI logo

---

### STEP 6: Go Live with Paystack

1. Once you've tested with `pk_test_...` key, go to Paystack dashboard
2. Complete business verification to get live keys
3. Update `REACT_APP_PAYSTACK_PUBLIC_KEY` in Vercel to `pk_live_...`
4. Redeploy

---

## 📱 Mobile PWA (Install to Home Screen)

The app works as a PWA (Progressive Web App):
- On Android Chrome: tap menu → "Add to Home Screen"
- On iOS Safari: tap Share → "Add to Home Screen"
- On Desktop Chrome: click the install icon in the address bar

---

## 🔧 Back4App Cloud Code (Auto-notifications)

Add this Cloud Code in Back4App (Dashboard → Cloud Code → main.js) to auto-notify users when subscription is expiring:

```javascript
// Back4App Cloud Code - runs daily
Parse.Cloud.job("checkExpiringSubscriptions", async (request) => {
  const query = new Parse.Query(Parse.User);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  
  query.greaterThan("subscriptionExpiry", tomorrow);
  query.lessThan("subscriptionExpiry", dayAfter);
  
  const users = await query.find({ useMasterKey: true });
  
  for (const user of users) {
    const Notification = Parse.Object.extend("Notification");
    const n = new Notification();
    n.set("userId", user.id);
    n.set("message", "⏰ Your subscription expires tomorrow! Renew now to keep access to AmanTech Smart AI.");
    n.set("type", "warning");
    n.set("read", false);
    await n.save(null, { useMasterKey: true });
  }
  
  return `Notified ${users.length} users`;
});
```

Schedule it to run daily in Back4App → Cloud Code → Scheduled Jobs.

---

## 🛠 Tech Stack

- **Frontend**: React 18 + React Router v6
- **Backend**: Back4App (Parse Server)
- **AI**: Google Gemini 2.0 Flash (free tier)
- **Payments**: Paystack (GHS)
- **Styling**: Tailwind CSS + Custom CSS
- **PDF**: jsPDF
- **Deployment**: Vercel + GitHub

---

## 📂 Project Structure

```
src/
├── config/        # API keys & configuration
├── context/       # React contexts (Auth)
├── hooks/         # Custom hooks (Paystack, feature access)
├── services/      # Backend & AI services
├── components/    # Reusable UI components
│   ├── ui/        # Buttons, cards, modals, etc.
│   └── layout/    # Sidebar + navigation layout
└── pages/         # All page components
```

---

## 🆘 Support

Admin email: amarnahf@gmail.com

---

*Built with ❤️ for Ghana's Education System*
