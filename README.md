# UFSBD Hérault Website

A modern web application for the Union Française pour la Santé Bucco-Dentaire (UFSBD) Hérault section, built with React and Node.js.

## 🚀 Features

- **Blog Management System**: Create, edit, and manage dental health articles
- **User Authentication**: Role-based access control (user, author, doctor, admin)
- **Admin Dashboard**: Complete content management interface
- **Contact System**: Integrated contact form with database storage
- **Gallery Management**: Image upload and management system
- **Organization Chart**: Dynamic team structure visualization
- **Calendar Events**: Event scheduling and management
- **Responsive Design**: Mobile-first approach with modern UI

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for state management
- **TipTap** rich text editor
- **React Router DOM** for navigation

### Backend
- **Node.js** with Express
- **PostgreSQL** database with Neon
- **Drizzle ORM** for database operations
- **TypeScript** throughout the stack

### Services
- **Supabase** for authentication and file storage
- **Resend** for email services
- **Replit** hosting platform

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ufsbd-herault-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Add your environment variables:
DATABASE_URL=your_postgresql_connection_string
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Authentication and role management
- **Posts**: Blog articles with approval workflow
- **Contact Submissions**: Contact form messages
- **Gallery Images**: Image management system
- **Organigram Members**: Organization structure
- **Events**: Calendar and event management

## 🔐 User Roles

- **User**: Basic access to public content
- **Author**: Can create and submit blog posts
- **Doctor**: Medical professional with posting privileges
- **Admin**: Full system access and content management

## 🚀 Deployment

This project is configured for deployment on Replit:

1. Connect your GitHub repository to Replit
2. Set up environment variables in Replit Secrets
3. The application will automatically build and deploy

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open database studio

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

UFSBD Hérault - ufsbd34@ufsbd.fr

Project Link: [https://github.com/yourusername/ufsbd-herault-website](https://github.com/yourusername/ufsbd-herault-website)