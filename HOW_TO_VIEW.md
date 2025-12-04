# 🖥️ How to View the Learning Center Application

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React & React DOM
- React Router
- Vite (build tool)
- Tailwind CSS
- TypeScript
- Lucide Icons

### 2. Start Development Server

```bash
npm run dev
```

This will start the Vite development server (usually on `http://localhost:5173`)

### 3. Open in Browser

The terminal will show you the local URL, typically:
```
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open `http://localhost:5173` in your browser.

---

## 🎯 What You Can View

### Learning Center Routes:
- `/learning/faqs` - FAQ Management
- `/learning/articles` - Knowledge Articles
- `/learning/business-profile` - Business Profile Survey
- `/learning/search` - Vector Search Playground
- `/learning/training` - AI Training
- `/learning/presentation/:id` - Presentation Player

### Campaign Landing Pages:
- `/learn/claim-your-listing` - HOOK-001
- `/learn/seo-reality-check` - EDU-001
- `/learn/command-center-basics` - HOWTO-001

### Other Routes:
- `/` - Presentation Call page
- `/login` - Login page
- `/signup` - Sign up page

---

## ⚠️ Important Notes

### Backend API Not Running
- The frontend will try to call API endpoints
- These will fail until AWS infrastructure is deployed
- You'll see errors in the browser console
- **This is expected** - the UI will still load and display

### Campaign Files
- Landing pages load from `/public/campaigns/`
- Only 3 example campaigns are available
- Missing campaigns will show error messages

### Static Assets
- Campaign JSON files are in `public/campaigns/`
- These are served directly by Vite

---

## 🔧 Troubleshooting

### Port Already in Use
If port 5173 is taken:
```bash
npm run dev -- --port 3000
```

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
npm run build
# Check for type errors
```

---

## 🚀 Preview Production Build

To see how it looks when built:
```bash
npm run build
npm run preview
```

This builds and serves the production version locally.

---

## 📱 Access Remotely

To access from other devices on your network:
```bash
npm run dev -- --host
```

Then use your computer's IP address:
```
http://192.168.x.x:5173
```

---

## ✅ Next Steps

Once you can view it locally:
1. Test all routes
2. Check landing pages
3. Verify UI components
4. Test navigation
5. Deploy to AWS when ready

**Happy viewing!** 🎉


