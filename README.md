# Portfolio CMS - Next.js + Supabase + Vercel

A modern, full-stack portfolio website built with Next.js 15, Supabase, and deployed on Vercel. Features a custom CMS for managing projects and pages with real-time updates.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Real-time Database**: Supabase for data management and authentication
- **Custom CMS**: Admin panel for managing projects and pages
- **SEO Optimized**: Dynamic sitemap, robots.txt, and meta tags
- **Performance**: Optimized for Core Web Vitals and mobile experience
- **Deployment Ready**: Configured for Vercel with edge functions

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Icons**: Custom SVG icons
- **Forms**: Tagify for enhanced input fields

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes (sitemap, robots)
│   ├── pages/             # Dynamic page routes
│   ├── projects/          # Project detail pages
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/                   # Utilities and configurations
├── public/                # Static assets
└── vercel.json           # Vercel configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd 2k25-portfolio-custom-cms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### Supabase Configuration

1. Create a new Supabase project
2. Set up the following tables:

#### Projects Table
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  content JSONB,
  image_url VARCHAR(500),
  category VARCHAR(100),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Pages Table
```sql
CREATE TABLE pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content JSONB,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

3. Import your existing projects using the provided script:
   ```bash
   node import_projects_to_supabase.cjs
   ```

## 🚀 Deployment

### Vercel Deployment

This project is optimized for Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Set these in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `GOOGLE_SITE_VERIFICATION` (optional)
- `ADMIN_PASSWORD_HASH` (for admin access)

## 📱 Features

### Admin Panel
- Secure admin interface at `/admin`
- Create, edit, and delete projects
- Manage pages and content
- Real-time preview

### SEO Optimization
- Dynamic sitemap generation
- Robots.txt configuration
- Meta tags and Open Graph
- Structured data

### Performance
- Image optimization
- Code splitting
- Edge functions
- Caching strategies

## 🔧 Customization

### Styling
- Modify `app/globals.css` for global styles
- Update Tailwind configuration in `tailwind.config.ts`
- Customize components in the `components/` directory

### Content Management
- Add new project fields in the database schema
- Update admin forms in `components/PageEditor.jsx`
- Modify display components for new content types

### SEO
- Update metadata in `app/layout.tsx`
- Modify sitemap generation in `app/api/sitemap/route.ts`
- Add structured data for better search results

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Check TypeScript errors and missing dependencies
2. **Supabase Connection**: Verify environment variables and project status
3. **Image Loading**: Ensure images are in the `public/` directory
4. **Admin Access**: Check password hash configuration

### Getting Help

- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Review Vercel and Supabase documentation
- Check browser console for client-side errors

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the deployment guide
- Review the troubleshooting section

---

Built with ❤️ using Next.js, Supabase, and Vercel
