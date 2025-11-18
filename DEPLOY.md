# How to Deploy to GitHub Pages

## Option 1: Automatic Deployment (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**
   - The workflow will automatically build and deploy when you push to `main`

3. **Update the repository name in vite.config.ts:**
   - Open `vite.config.ts`
   - Change `REPO_NAME` to match your actual repository name
   - Or the workflow will try to detect it automatically

## Option 2: Manual Deployment

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select the `main` branch and `/dist` folder
   - Click Save

3. **Push the dist folder:**
   ```bash
   git add dist
   git commit -m "Deploy to GitHub Pages"
   git push
   ```

## Important Notes

- **Repository Name:** Make sure the `REPO_NAME` in `vite.config.ts` matches your GitHub repository name
- **API Keys:** Users will still need to enter their own Gemini API key (stored locally in their browser)
- **Build Time:** The automatic deployment takes about 2-3 minutes after you push code

## Testing Locally Before Deploying

Test the production build locally:
```bash
npm run build
npm run preview
```

Then visit `http://localhost:4173` to see how it will look on GitHub Pages.

