# UFSBD Hérault Website

## Overview

This is a full-stack web application for the Union Française pour la Santé Bucco-Dentaire (UFSBD) Hérault section. The application serves as a platform for dental health professionals to share information, manage content, and provide services to the community. It features a modern React frontend with a Node.js/Express backend, using PostgreSQL as the database and Supabase for authentication and storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state

## Key Components

### Frontend Architecture
- **React Router**: Client-side routing with protected routes
- **shadcn/ui**: Component library built on Radix UI primitives
- **TipTap Editor**: Rich text editor for blog content creation
- **Form Handling**: React Hook Form with Zod validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **Database Layer**: Drizzle ORM with connection pooling via Neon serverless
- **Storage Interface**: Abstracted storage layer for database operations
- **Route Organization**: Modular route structure in `server/routes.ts`

### Database Schema
The application uses the following main entities:
- **Users**: Authentication and role management (user, author, doctor, admin)
- **Posts**: Blog articles with approval workflow
- **Contact Submissions**: Contact form submissions
- **Gallery Images**: Image management system
- **Organigram Members**: Organization structure management
- **Events**: Calendar and event management

### Authentication & Authorization
- **Supabase Auth**: Handles user authentication and session management
- **Role-based Access**: Four user roles with different permissions
- **Protected Routes**: Client-side route protection based on user roles
- **JWT Tokens**: Secure token-based authentication

## Data Flow

1. **User Authentication**: Users sign in through Supabase Auth
2. **Content Creation**: Authors create blog posts using the rich text editor
3. **Content Approval**: Admins review and approve submitted content
4. **Public Access**: Approved content is displayed on the public blog
5. **File Management**: Images and media are stored in Supabase Storage
6. **Contact Forms**: Contact submissions are stored in the database

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection via Neon
- **@supabase/supabase-js**: Authentication and storage services
- **drizzle-orm**: Type-safe database ORM
- **@tiptap/**: Rich text editor extensions
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: Accessible UI primitives

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across the application
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Backend bundling for production

### Third-party Services
- **Supabase**: Backend-as-a-Service for auth and storage
- **Neon**: Serverless PostgreSQL hosting
- **Resend**: Email service integration (configured but not actively used)

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend
- **tsx**: TypeScript execution for backend development
- **Database Migrations**: Drizzle Kit for schema management

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles the server code
- **Database**: Connection pooling with environment-based configuration
- **Static Serving**: Express serves built frontend assets

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SUPABASE_URL & SUPABASE_ANON_KEY**: Supabase configuration
- **VITE_RESEND_API_KEY**: Email service configuration
- **NODE_ENV**: Environment detection for development features

The application is designed to be deployment-ready for platforms like Replit, with proper environment variable handling and production optimizations.