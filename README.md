# AI Banking Flow

A modern banking SaaS application with AI-powered analytics and dashboard.

## Deployment on Vercel

This project is optimized for deployment on Vercel.

### Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **Environment Variables**: You will need a Gemini API Key.

### Deployment Steps

1.  **Connect to GitHub**: Push your code to a GitHub repository.
2.  **Import Project**: In Vercel, click "New Project" and import your repository.
3.  **Configure Environment Variables**:
    *   Add `VITE_GEMINI_API_KEY` with your Google Gemini API key.
4.  **Deploy**: Click "Deploy". Vercel will automatically detect the Vite framework and use the settings in `vercel.json`.

### Configuration Details

*   **Framework**: Vite
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`
*   **Routing**: Standard SPA routing is configured in `vercel.json` to handle client-side routes.

---
Built with ❤️ by Aditya