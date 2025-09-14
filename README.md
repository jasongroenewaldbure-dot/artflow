# ArtFlow - Art Marketplace Platform

A robust, scalable art marketplace platform inspired by Artsy's architecture and performance, built with React, TypeScript, and Vite.

## 🚀 Features

### Core Marketplace Features
- **Artwork Discovery**: Advanced search and filtering system
- **Artist Profiles**: Comprehensive artist pages with portfolios
- **User Management**: Collector, artist, and gallery roles
- **Transaction System**: Secure payment processing
- **Image Management**: Optimized image handling and processing

### Security & Performance
- **Input Validation**: Comprehensive data validation with Zod
- **Rate Limiting**: API rate limiting and abuse prevention
- **Caching**: Intelligent caching for optimal performance
- **Image Optimization**: Automatic image resizing and format optimization
- **Security Headers**: CSP, CSRF protection, and XSS prevention

### Design System
- **Brush Design System**: Custom dark-themed design system
- **Responsive Design**: Mobile-first responsive layout
- **Accessibility**: WCAG compliant components
- **Performance**: Lazy loading, virtual scrolling, and bundle optimization

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **React Helmet** - SEO and meta management
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Supabase** - Database and authentication
- **Prisma** - Database ORM
- **Sharp** - Image processing

### Styling
- **CSS Custom Properties** - Design tokens
- **CSS Modules** - Scoped styling
- **Responsive Design** - Mobile-first approach

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Vitest** - Testing framework

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── marketplace/     # Marketplace-specific components
│   └── ui/             # Generic UI components
├── routes/             # Page components
│   └── marketplace/    # Marketplace pages
├── services/           # API and business logic
│   ├── api.ts         # API client and endpoints
│   ├── security.ts    # Security utilities
│   └── performance.ts # Performance optimizations
├── brush/             # Design system
│   ├── tokens.ts      # Design tokens
│   ├── theme.css      # Global styles
│   └── BrushProvider.tsx
└── utils/             # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ (required for Prisma)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd artflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_BUCKET=artworks
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `SUPABASE_BUCKET` | Storage bucket name | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `SENTRY_DSN` | Sentry error tracking | No |

### Database Schema

The platform uses the following main entities:
- **Users**: Collectors, artists, galleries, admins
- **Artworks**: Art pieces with metadata
- **Profiles**: Extended user profiles
- **Transactions**: Payment and sales records
- **Favorites**: User artwork preferences

## 🎨 Design System

### Brush Design Tokens

```typescript
const brushTokens = {
  colors: {
    black100: '#000000',
    white100: '#FFFFFF',
    primary: '#6e1fff',
    accent: '#0eda83',
    danger: '#f7625a'
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px'
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  }
}
```

### Component Usage

```tsx
import { Button } from '@/components/ui/Button'

<Button variant="primary" size="lg">
  Click me
</Button>
```

## 🔒 Security Features

### Input Validation
- Zod schemas for all API endpoints
- XSS prevention with input sanitization
- SQL injection prevention

### Authentication
- JWT-based authentication
- Role-based access control
- Session management

### Rate Limiting
- API rate limiting (100 req/min default)
- Strict rate limiting for sensitive operations
- IP-based tracking

### Security Headers
- Content Security Policy (CSP)
- CSRF protection
- X-Frame-Options
- X-Content-Type-Options

## ⚡ Performance Features

### Image Optimization
- Automatic WebP conversion
- Responsive image sizing
- Lazy loading
- Blur placeholders

### Caching
- API response caching
- Image caching
- Static asset caching

### Bundle Optimization
- Code splitting
- Lazy loading
- Tree shaking
- Bundle analysis

### Monitoring
- Web Vitals tracking
- Performance metrics
- Error tracking
- Memory usage monitoring

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview

# Build and start production server
npm run build && npm run start
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Docker
```bash
# Build Docker image
docker build -t artflow .

# Run container
docker run -p 3000:3000 artflow
```

### Manual Deployment
1. Build the application: `npm run build`
2. Upload `dist/` folder to your server
3. Configure web server (Nginx/Apache)
4. Set up SSL certificate

## 📊 Monitoring & Analytics

### Performance Monitoring
- Web Vitals tracking
- Core Web Vitals reporting
- Performance budgets

### Error Tracking
- Sentry integration
- Error boundary components
- Client-side error reporting

### Analytics
- Page view tracking
- User interaction tracking
- Custom event tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Artsy's architecture and design
- Built with modern web technologies
- Community-driven development

## 📞 Support

For support, email support@artflow.com or join our Discord community.

---

**ArtFlow** - Discover, Buy, and Sell Art