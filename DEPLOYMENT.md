# Deployment Guide for Portfolio CMS

This guide explains how to deploy the Portfolio CMS to Render.

## Prerequisites

- A Render account
- Git repository with your code

## Environment Variables

The following environment variables need to be set in Render:

- `SESSION_SECRET`: A secure random string for session encryption (Render will auto-generate this)
- `NODE_ENV`: Set to `production`
- `PORT`: Render will automatically set this

## Deployment Steps

1. **Connect your repository to Render:**
   - Go to your Render dashboard
   - Click "New +" and select "Web Service"
   - Connect your Git repository

2. **Configure the service:**
   - **Name**: `portfolio-cms` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or your preferred plan)

3. **Set Environment Variables:**
   - `NODE_ENV`: `production`
   - `SESSION_SECRET`: Let Render auto-generate this

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

## Local Development

To run the application locally:

1. Install dependencies:
   ```bash
   npm run install-all
   ```

2. Create a `.env` file in the root directory:
   ```
   SESSION_SECRET=your-secret-key-for-development
   PORT=5000
   NODE_ENV=development
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `client/`: React frontend application
- `server/`: Express backend API
- `server/data/`: JSON data files for content
- `render.yaml`: Render deployment configuration

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/sections`: Get all sections
- `GET /api/projects`: Get all projects
- `GET /api/structure`: Get site structure
- `POST /api/login`: Admin login
- `GET /api/test`: Health check endpoint

## Troubleshooting

- If the build fails, check that all dependencies are properly listed in package.json files
- If the app doesn't start, verify the start command and port configuration
- Check Render logs for detailed error messages 