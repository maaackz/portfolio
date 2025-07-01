# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Connect your repository
3. **Supabase Project**: Set up your database
4. **Domain** (optional): For custom domain

## Step 1: Prepare Your Repository

1. Ensure all changes are committed to your repository
2. Make sure your repository is public or you have a Vercel Pro account

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub/GitLab/Bitbucket repository
4. Vercel will auto-detect Next.js framework
5. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (if your Next.js app is in the root)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to configure your project
```

## Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
GOOGLE_SITE_VERIFICATION=your_google_site_verification_code
ADMIN_PASSWORD_HASH=your_hashed_admin_password
```

3. Set environment to **Production** (and optionally **Preview** for branch deployments)

## Step 4: Configure Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update your DNS settings:
   - Add a CNAME record pointing to `cname.vercel-dns.com`
   - Or add an A record pointing to `76.76.19.19`

## Step 5: Verify Deployment

1. Check your deployment URL (e.g., `https://your-project.vercel.app`)
2. Test all functionality:
   - Home page loads correctly
   - Projects page works
   - Admin panel is accessible
   - Images load properly
   - SEO meta tags are present

## Step 6: Performance Optimization

### Enable Vercel Analytics (Optional)

1. Go to **Settings** → **Analytics**
2. Enable Vercel Analytics for performance insights

### Configure Edge Functions (Optional)

For better performance, consider moving API routes to Edge Functions:

```typescript
// app/api/example/route.ts
export const runtime = 'edge';
```

## Step 7: Monitoring and Maintenance

### Set up Monitoring

1. **Vercel Analytics**: Monitor performance and user behavior
2. **Error Tracking**: Consider integrating Sentry or similar
3. **Uptime Monitoring**: Use Vercel's built-in monitoring

### Regular Maintenance

1. **Dependency Updates**: Keep packages updated
2. **Security Audits**: Run `npm audit` regularly
3. **Performance Monitoring**: Check Core Web Vitals

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables are set correctly
   - Verify all dependencies are in `package.json`
   - Check for TypeScript errors

2. **Environment Variables Not Working**:
   - Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
   - Redeploy after adding new environment variables

3. **Image Loading Issues**:
   - Check `next.config.ts` image domains configuration
   - Ensure images are in the `public` directory

4. **Supabase Connection Issues**:
   - Verify Supabase URL and keys are correct
   - Check Supabase project is active and accessible

### Getting Help

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: Available in dashboard
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## Post-Deployment Checklist

- [ ] Site loads without errors
- [ ] All pages are accessible
- [ ] Images and assets load correctly
- [ ] Admin panel works (if applicable)
- [ ] SEO meta tags are present
- [ ] Sitemap is accessible at `/sitemap.xml`
- [ ] Robots.txt is accessible at `/robots.txt`
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable (check Lighthouse)
- [ ] Environment variables are secure
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] Analytics are tracking (if applicable)

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **Admin Access**: Use strong passwords and consider rate limiting
3. **CORS**: Configure CORS properly for API routes
4. **Content Security Policy**: Consider adding CSP headers
5. **Regular Updates**: Keep dependencies updated for security patches 