# Legal Archive Frontend - Backend Integration

This frontend is now fully integrated with the Legal Archive Backend API.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env.example` to `.env` and update the API URL:
   ```bash
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## 🔐 Authentication

The app includes a complete authentication system:

- **Login**: `/login` - User authentication with JWT tokens
- **Register**: `/register` - New user registration
- **Protected Routes**: Automatically redirect to login when needed
- **Auth Context**: Global authentication state management

### Default Test Credentials
Check with your backend admin for test credentials, or register a new account.

## 📡 API Integration

### Services Layer
All API calls are organized in service files:

- `src/services/authService.ts` - Authentication endpoints
- `src/services/lawService.ts` - Laws CRUD operations
- `src/services/judgmentService.ts` - Judgments CRUD operations
- `src/services/legalNoticeService.ts` - Legal notices operations
- `src/services/judicialOpinionService.ts` - Judicial opinions operations

### Custom Hooks
React Query hooks for data fetching:

- `src/hooks/useLaws.ts` - Laws data hooks
- `src/hooks/useJudgments.ts` - Judgments data hooks
- `src/hooks/useLegalNotices.ts` - Legal notices data hooks

### API Client
Centralized Axios instance with:
- Automatic JWT token injection
- Request/response interceptors
- Error handling
- 401 redirect to login

## 🎨 Key Features

### Public Pages
- **Home** (`/`) - Landing page
- **Laws** (`/laws`) - Browse and search laws with pagination
- **Judgments** (`/judgments`) - Browse court judgments with filters
- **Legal Notices** (`/notices`) - View legal notices
- **Judicial Opinions** (`/opinions`) - Browse judicial opinions

### Authentication Pages
- **Login** (`/login`) - User login with form validation
- **Register** (`/register`) - User registration

### Data Display Features
- Real-time data from backend API
- Pagination support
- Search and filtering
- Court level filtering for judgments
- Category browsing for laws
- View and download counts
- PDF download links

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` |

### API Endpoints Used

The frontend integrates with these main API endpoints:

**Authentication:**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout
- `POST /auth/change-password` - Change password

**Laws:**
- `GET /laws` - Get all laws (paginated)
- `GET /laws/{id}` - Get law by ID
- `GET /laws/search` - Search laws
- `GET /laws/types` - Get all law types
- `GET /laws/categories` - Get all categories
- `GET /laws/recent` - Get recent laws
- `POST /laws` - Create law (authenticated)
- `PUT /laws/{id}` - Update law (authenticated)
- `DELETE /laws/{id}` - Delete law (authenticated)

**Judgments:**
- `GET /judgments` - Get all judgments (paginated)
- `GET /judgments/{id}` - Get judgment by ID
- `GET /judgments/search` - Search judgments
- `GET /judgments/court-level/{level}` - Filter by court level
- `POST /judgments` - Create judgment (authenticated)
- `PUT /judgments/{id}` - Update judgment (authenticated)
- `DELETE /judgments/{id}` - Delete judgment (authenticated)

**Legal Notices:**
- `GET /legal-notices` - Get all notices (paginated)
- `GET /legal-notices/{id}` - Get notice by ID
- `GET /legal-notices/search` - Search notices
- `POST /legal-notices` - Create notice (authenticated)

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── Header.tsx       # Header with auth UI
│   ├── Footer.tsx
│   └── ProtectedRoute.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── hooks/               # Custom React hooks
│   ├── useLaws.ts
│   ├── useJudgments.ts
│   └── useLegalNotices.ts
├── lib/                 # Utilities
│   ├── apiClient.ts     # Axios instance
│   └── utils.ts
├── pages/               # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Laws.tsx
│   ├── Judgments.tsx
│   └── ...
├── services/            # API service layer
│   ├── authService.ts
│   ├── lawService.ts
│   ├── judgmentService.ts
│   └── ...
└── types/               # TypeScript types
    └── api.ts           # API response types
```

## 🔒 Security

- JWT tokens stored in localStorage
- Automatic token refresh handling
- Protected routes with authentication guards
- Role-based access control (RBAC) ready
- Secure API communication

## 📦 Dependencies

Key dependencies:
- **React 18** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **React Query** - Server state management
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Adding New API Endpoints

1. Add types to `src/types/api.ts`
2. Create service in `src/services/`
3. Create custom hooks in `src/hooks/`
4. Use in components

Example:
```typescript
// 1. Add type
export interface NewResource {
  id: string;
  name: string;
}

// 2. Create service
export const newResourceService = {
  async getAll() {
    const res = await apiClient.get('/new-resources');
    return res.data.data;
  }
}

// 3. Create hook
export const useGetNewResources = () => {
  return useQuery({
    queryKey: ['new-resources'],
    queryFn: () => newResourceService.getAll()
  });
}

// 4. Use in component
const { data, isLoading } = useGetNewResources();
```

## 🐛 Troubleshooting

### Common Issues

**1. Cannot connect to backend**
- Ensure backend is running on `http://localhost:8080`
- Check CORS settings in backend
- Verify `.env` file has correct `VITE_API_BASE_URL`

**2. 401 Unauthorized errors**
- Token may have expired - try logging in again
- Check token is being sent in Authorization header
- Verify backend JWT secret matches

**3. Data not loading**
- Open browser console for error messages
- Check Network tab for failed requests
- Ensure backend endpoints match API documentation

## 📚 Additional Resources

- [Backend API Documentation](./backenddocs/COMPLETE_API_REFERENCE.md)
- [Field Names Reference](./backenddocs/FIELD_NAMES_REFERENCE.md)
- [React Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Docs](https://ui.shadcn.com/)

## 🤝 Contributing

1. Follow existing code structure
2. Use TypeScript for type safety
3. Follow component naming conventions
4. Update API types when backend changes
5. Test authentication flows

## 📄 License

[Your License Here]

