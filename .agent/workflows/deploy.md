---
description: How to deploy the Amour application to production
---

To deploy the application, follow these steps:

### 1. Deploy Supabase Edge Functions
// turbo
1. Run the deployment command:
   ```bash
   npm run deploy
   ```

2. Set your production secrets in Supabase:
   ```bash
   supabase secrets set FLUTTERWAVE_SECRET_KEY=your_production_secret GEMINI_API_KEY=your_gemini_api_key
   ```

### 2. Deploy Frontend to Vercel
1. Install Vercel CLI if you haven't:
   ```bash
   npm i -g vercel
   ```

2. Deploy from the project root:
   ```bash
   vercel
   ```

3. Configure Environment Variables in the Vercel Dashboard for your project:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_FLUTTERWAVE_PUBLIC_KEY`

4. Redeploy to apply variables:
   ```bash
   vercel --prod
   ```
