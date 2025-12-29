# 📚 Legal Archive Backend - Complete API Reference for Frontend

**Date:** December 20, 2025  
**Base URL:** `http://localhost:8080/api`  
**Authentication:** JWT Bearer Token

---

## 🔐 Authentication Endpoints

### 1. Register User
```
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "string",          // Required, unique
  "email": "string",              // Required, unique, valid email
  "password": "string",           // Required, min 8 characters
  "fullName": "string",           // Required
  "organization": "string",       // Optional
  "position": "string",           // Optional
  "roles": ["string"]             // Optional, default: ["ROLE_VIEWER"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "organization": "string",
    "position": "string",
    "roles": ["string"],
    "enabled": true,
    "createdAt": "2025-12-20T10:00:00",
    "updatedAt": "2025-12-20T10:00:00"
  }
}
```

---

### 2. Login
```
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",  // JWT token - USE THIS!
    "type": "Bearer",
    "username": "string",
    "email": "string",
    "roles": ["ROLE_ADMIN"]
  }
}
```

**Use token in all authenticated requests:**
```
Authorization: Bearer {token}
```

---

### 3. Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "username": "string",
    "authorities": ["ROLE_ADMIN"],
    "authenticated": true
  }
}
```

---

### 4. Change Password
```
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": "Success"
}
```

---

### 5. Logout
```
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful. Please remove token from client.",
  "data": "Success"
}
```

---

## 📜 Law Endpoints

### Law Model Fields
```typescript
{
  id: string;                    // MongoDB ObjectId
  title: string;                 // Required
  type: string;                  // e.g., "Act", "Bill", "Regulation"
  year: number;                  // e.g., 2025
  lawNumber: string;             // e.g., "Act No. 12 of 2025"
  enactmentDate: string;         // ISO date "2025-12-20"
  publicationDate: string;       // ISO date
  effectiveDate: string;         // ISO date
  category: string;              // e.g., "Constitutional", "Criminal"
  jurisdiction: string;          // e.g., "Kenya", "National"
  issuingAuthority: string;      // e.g., "Parliament of Kenya"
  ministry: string;              // e.g., "Ministry of Justice"
  status: string;                // "Active", "Repealed", "Amended"
  summary: string;               // Long text
  keywords: string[];            // Array of strings
  tags: string[];                // Array of strings
  pdfUrl: string;                // URL to PDF file
  sourceUrl: string;             // External reference URL
  relatedLaws: string[];         // Array of law IDs
  amendments: string[];          // Array of amendment descriptions
  language: string;              // "English", "Swahili"
  viewCount: number;             // Default: 0
  downloadCount: number;         // Default: 0
  createdAt: string;             // ISO datetime
  updatedAt: string;             // ISO datetime
}
```

---

### 1. Get All Laws (with Pagination)
```
GET /api/laws?page=0&size=20&sort=title,asc
```

**Query Parameters:**
- `page` (optional): Page number, default: 0
- `size` (optional): Items per page, default: 20
- `sort` (optional): Sort field and direction, e.g., "title,asc"

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "abc123",
        "title": "The Constitution of Kenya, 2010",
        "type": "Constitution",
        "year": 2010,
        "status": "Active",
        // ... all other fields
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": { "sorted": true },
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "totalPages": 5,
    "totalElements": 100,
    "last": false,
    "first": true,
    "numberOfElements": 20,
    "size": 20,
    "number": 0,
    "empty": false
  }
}
```

---

### 2. Get Law by ID
```
GET /api/laws/{id}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "title": "The Constitution of Kenya, 2010",
    "type": "Constitution",
    "year": 2010,
    // ... all fields
  }
}
```

---

### 3. Create Law (Authenticated)
```
POST /api/laws
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "string",              // Required
  "type": "string",               // Required
  "year": 2025,                   // Required
  "lawNumber": "string",          // Optional
  "enactmentDate": "2025-12-20",  // Optional
  "category": "string",           // Optional
  "jurisdiction": "string",       // Optional
  "status": "Active",             // Optional, default: "Active"
  "summary": "string",            // Optional
  "keywords": ["string"],         // Optional
  "tags": ["string"],             // Optional
  "language": "English"           // Optional, default: "English"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Law created successfully",
  "data": {
    "id": "abc123",
    "title": "New Law Title",
    // ... all fields
  }
}
```

---

### 4. Update Law (Authenticated)
```
PUT /api/laws/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** Same as Create Law

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Law updated successfully",
  "data": { /* updated law object */ }
}
```

---

### 5. Delete Law (Authenticated)
```
DELETE /api/laws/{id}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Law deleted successfully",
  "data": "Deleted"
}
```

---

### 6. Search Laws
```
GET /api/laws/search?query=constitution&page=0&size=20
```

**Query Parameters:**
- `query` (required): Search text
- `page` (optional): Page number
- `size` (optional): Items per page

**Response:** Same format as Get All Laws

---

### 7. Filter Laws by Type
```
GET /api/laws/type/{type}?page=0&size=20
```

**Examples:**
- `/api/laws/type/Act`
- `/api/laws/type/Bill`
- `/api/laws/type/Regulation`

---

### 8. Filter Laws by Year
```
GET /api/laws/year/{year}?page=0&size=20
```

**Example:** `/api/laws/year/2025`

---

### 9. Filter Laws by Category
```
GET /api/laws/category/{category}?page=0&size=20
```

**Examples:**
- `/api/laws/category/Constitutional`
- `/api/laws/category/Criminal`

---

### 10. Filter Laws by Status
```
GET /api/laws/status/{status}?page=0&size=20
```

**Examples:**
- `/api/laws/status/Active`
- `/api/laws/status/Repealed`

---

### 11. Get All Law Types
```
GET /api/laws/types
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": ["Act", "Bill", "Constitution", "Regulation", "Ordinance"]
}
```

---

### 12. Get All Years
```
GET /api/laws/years
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [2025, 2024, 2023, 2022, 2021, ...]
}
```

---

### 13. Get All Categories
```
GET /api/laws/categories
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": ["Constitutional", "Criminal", "Civil", "Administrative", ...]
}
```

---

### 14. Increment View Count (Authenticated)
```
POST /api/laws/{id}/view
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "View count incremented",
  "data": { /* updated law with incremented viewCount */ }
}
```

---

### 15. Increment Download Count (Authenticated)
```
POST /api/laws/{id}/download
Authorization: Bearer {token}
```

---

### 16. Get Statistics
```
GET /api/laws/stats
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalLaws": 150,
    "activeCount": 140,
    "repealedCount": 10,
    "byYear": { "2025": 12, "2024": 45, ... },
    "byType": { "Act": 80, "Bill": 30, ... },
    "byCategory": { "Constitutional": 20, ... }
  }
}
```

---

### 17. Get Recent Laws
```
GET /api/laws/recent?limit=10
```

**Response:** Array of recent laws

---

## ⚖️ Judgment Endpoints

### Judgment Model Fields
```typescript
{
  id: string;
  caseNumber: string;            // e.g., "Petition No. 25 of 2021"
  caseName: string;              // Required
  courtName: string;             // Required
  courtLevel: string;            // e.g., "Supreme Court", "High Court"
  judges: string[];              // Array of judge names
  judgmentDate: string;          // ISO date
  parties: string;               // e.g., "Petitioner vs Respondent"
  caseType: string;              // e.g., "Constitutional", "Criminal"
  verdict: string;               // e.g., "Petition Allowed"
  summary: string;               // Long text
  legalPrinciples: string[];     // Array of legal principles
  citedCases: string[];          // Array of case references
  citedLaws: string[];           // Array of law references
  keywords: string[];
  tags: string[];
  jurisdiction: string;
  language: string;
  pdfUrl: string;
  status: string;                // e.g., "Final", "Pending Appeal"
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}
```

---

### 1. Get All Judgments
```
GET /api/judgments?page=0&size=20
```

**Response:** Same pagination format as Laws

---

### 2. Get Judgment by ID
```
GET /api/judgments/{id}
```

---

### 3. Create Judgment (Authenticated)
```
POST /api/judgments
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "caseNumber": "string",         // Optional
  "caseName": "string",           // Required
  "courtName": "string",          // Required
  "courtLevel": "string",         // Required
  "judges": ["string"],           // Optional
  "judgmentDate": "2025-12-20",   // Optional
  "parties": "string",            // Optional
  "caseType": "string",           // Optional
  "verdict": "string",            // Optional
  "summary": "string",            // Optional
  "keywords": ["string"],         // Optional
  "tags": ["string"],             // Optional
  "jurisdiction": "Kenya",        // Optional
  "language": "English",          // Optional
  "status": "Final"               // Optional
}
```

---

### 4. Update Judgment (Authenticated)
```
PUT /api/judgments/{id}
Authorization: Bearer {token}
```

---

### 5. Delete Judgment (Authenticated)
```
DELETE /api/judgments/{id}
Authorization: Bearer {token}
```

---

### 6. Search Judgments
```
GET /api/judgments/search?query=constitution&page=0&size=20
```

---

### 7. Filter by Court Level
```
GET /api/judgments/court-level/{courtLevel}?page=0&size=20
```

**Examples:**
- `/api/judgments/court-level/Supreme Court`
- `/api/judgments/court-level/High Court`
- `/api/judgments/court-level/Court of Appeal`

---

### 8. Filter by Case Type
```
GET /api/judgments/case-type/{caseType}?page=0&size=20
```

**Examples:**
- `/api/judgments/case-type/Constitutional`
- `/api/judgments/case-type/Criminal`
- `/api/judgments/case-type/Civil`

---

### 9. Filter by Date Range
```
GET /api/judgments/date-range?startDate=2024-01-01&endDate=2025-12-31&page=0&size=20
```

---

### 10. Increment View Count
```
POST /api/judgments/{id}/view
Authorization: Bearer {token}
```

---

### 11. Increment Download Count
```
POST /api/judgments/{id}/download
Authorization: Bearer {token}
```

---

## 📰 Legal Notice Endpoints

### Legal Notice Model Fields
```typescript
{
  id: string;
  noticeNumber: string;          // e.g., "L.N. 123/2023"
  title: string;                 // Required
  type: string;                  // e.g., "Statutory Instrument", "Gazette Notice"
  publicationDate: string;       // ISO date
  issuingAuthority: string;      // Required
  ministry: string;              // Optional
  department: string;            // Optional
  gazetteIssue: string;          // e.g., "Kenya Gazette Vol. CXXV - No. 123"
  effectiveDate: string;         // ISO date
  expiryDate: string;            // ISO date (optional)
  summary: string;               // Long text
  applicableLaws: string[];      // Array of related law references
  keywords: string[];
  tags: string[];
  jurisdiction: string;
  language: string;
  pdfUrl: string;
  status: string;                // "Active", "Expired", "Superseded"
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}
```

---

### 1. Get All Legal Notices
```
GET /api/legal-notices?page=0&size=20
```

---

### 2. Get Legal Notice by ID
```
GET /api/legal-notices/{id}
```

---

### 3. Create Legal Notice (Authenticated)
```
POST /api/legal-notices
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "noticeNumber": "string",       // Optional
  "title": "string",              // Required
  "type": "string",               // Required
  "publicationDate": "2025-12-20", // Optional
  "issuingAuthority": "string",   // Required
  "ministry": "string",           // Optional
  "department": "string",         // Optional
  "gazetteIssue": "string",       // Optional
  "effectiveDate": "2025-12-20",  // Optional
  "summary": "string",            // Optional
  "keywords": ["string"],         // Optional
  "tags": ["string"],             // Optional
  "jurisdiction": "Kenya",        // Optional
  "language": "English",          // Optional
  "status": "Active"              // Optional
}
```

---

### 4. Update Legal Notice (Authenticated)
```
PUT /api/legal-notices/{id}
Authorization: Bearer {token}
```

---

### 5. Delete Legal Notice (Authenticated)
```
DELETE /api/legal-notices/{id}
Authorization: Bearer {token}
```

---

### 6. Search Legal Notices
```
GET /api/legal-notices/search?query=finance&page=0&size=20
```

---

### 7. Filter by Type
```
GET /api/legal-notices/type/{type}?page=0&size=20
```

**Examples:**
- `/api/legal-notices/type/Statutory Instrument`
- `/api/legal-notices/type/Gazette Notice`

---

### 8. Filter by Ministry
```
GET /api/legal-notices/ministry/{ministry}?page=0&size=20
```

**Example:** `/api/legal-notices/ministry/National Treasury`

---

### 9. Filter by Date Range
```
GET /api/legal-notices/date-range?startDate=2024-01-01&endDate=2025-12-31&page=0&size=20
```

---

### 10. Increment View Count
```
POST /api/legal-notices/{id}/view
Authorization: Bearer {token}
```

---

### 11. Increment Download Count
```
POST /api/legal-notices/{id}/download
Authorization: Bearer {token}
```

---

## 👥 User Endpoints

### User Model Fields
```typescript
{
  id: string;
  username: string;              // Required, unique
  email: string;                 // Required, unique
  password: string;              // Hashed (never returned in responses)
  fullName: string;              // Required
  organization: string;          // Optional
  position: string;              // Optional
  roles: string[];               // ["ROLE_ADMIN", "ROLE_EDITOR", "ROLE_VIEWER"]
  enabled: boolean;              // Default: true
  accountNonExpired: boolean;    // Default: true
  accountNonLocked: boolean;     // Default: true
  credentialsNonExpired: boolean; // Default: true
  lastLogin: string;             // ISO datetime
  passwordChangedAt: string;     // ISO datetime
  createdAt: string;
  updatedAt: string;
}
```

---

### 1. Get All Users (Admin/Editor)
```
GET /api/users
Authorization: Bearer {token}
Requires: ROLE_ADMIN or ROLE_EDITOR
```

---

### 2. Get User by ID (Admin/Editor)
```
GET /api/users/{id}
Authorization: Bearer {token}
```

---

### 3. Get User by Username (Admin/Editor)
```
GET /api/users/username/{username}
Authorization: Bearer {token}
```

---

### 4. Get User by Email (Admin/Editor)
```
GET /api/users/email/{email}
Authorization: Bearer {token}
```

---

### 5. Create User (Admin/Editor)
```
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "organization": "string",
  "position": "string",
  "roles": ["ROLE_EDITOR"],
  "enabled": true
}
```

---

### 6. Update User (Admin/Editor)
```
PUT /api/users/{id}
Authorization: Bearer {token}
```

---

### 7. Delete User (Admin/Editor)
```
DELETE /api/users/{id}
Authorization: Bearer {token}
```

---

### 8. Check Username Exists
```
GET /api/users/check/username/{username}
```

**Response:**
```json
{
  "success": true,
  "data": true  // true if exists, false if not
}
```

---

### 9. Check Email Exists
```
GET /api/users/check/email/{email}
```

---

### 10. Get Users by Role (Admin/Editor)
```
GET /api/users/role/{role}
Authorization: Bearer {token}
```

**Examples:**
- `/api/users/role/ROLE_ADMIN`
- `/api/users/role/ROLE_EDITOR`
- `/api/users/role/ROLE_VIEWER`

---

## 📊 Admin Dashboard Endpoints

### 1. Get Dashboard Statistics (Admin Only)
```
GET /api/admin/dashboard
Authorization: Bearer {token}
Requires: ROLE_ADMIN
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalLaws": 150,
    "totalJudgments": 89,
    "totalLegalNotices": 234,
    "totalUsers": 15,
    "totalDocuments": 473,
    "lawsThisYear": 12,
    "judgmentsThisYear": 45,
    "noticesThisYear": 67
  }
}
```

---

### 2. Get Collection Statistics (Admin Only)
```
GET /api/admin/collections
Authorization: Bearer {token}
Requires: ROLE_ADMIN
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "laws": {
      "total": 150,
      "active": 145,
      "description": "Legal documents, acts, and regulations"
    },
    "judgments": {
      "total": 89,
      "active": 82,
      "description": "Court decisions and case rulings"
    },
    "legal_notices": {
      "total": 234,
      "active": 220,
      "description": "Statutory instruments and gazette notices"
    },
    "users": {
      "total": 15,
      "active": 14,
      "description": "Registered user accounts"
    }
  }
}
```

---

### 3. Get Recent Activity (Admin Only)
```
GET /api/admin/activity
Authorization: Bearer {token}
Requires: ROLE_ADMIN
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "Last 7 days",
    "newLaws": 3,
    "newJudgments": 12,
    "newLegalNotices": 8,
    "totalNewDocuments": 23
  }
}
```

---

### 4. Get System Health (Admin Only)
```
GET /api/admin/health
Authorization: Bearer {token}
Requires: ROLE_ADMIN
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "database": "Connected",
    "timestamp": 1703088000000
  }
}
```

---

## 📤 File Upload Endpoints

### 1. Upload Law Document (Authenticated)
```
POST /api/upload/law/{id}
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: PDF file (max 10MB)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "Constitution_of_Kenya_2010.pdf",
    "filePath": "laws/abc12345_20251220_143022.pdf",
    "fileUrl": "/api/files/laws/abc12345_20251220_143022.pdf",
    "size": "2457600",
    "contentType": "application/pdf"
  }
}
```

---

### 2. Upload Judgment Document (Authenticated)
```
POST /api/upload/judgment/{id}
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: PDF file (max 10MB)

---

### 3. Upload Legal Notice Document (Authenticated)
```
POST /api/upload/legal-notice/{id}
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: PDF file (max 10MB)

---

### 4. View/Download File
```
GET /api/files/{category}/{filename}
```

**Examples:**
- `/api/files/laws/abc12345_20251220_143022.pdf`
- `/api/files/judgments/def67890_20251220_150030.pdf`
- `/api/files/legal-notices/ghi11223_20251220_160045.pdf`

**Response:** PDF file (inline display)

---

### 5. Delete File (Authenticated)
```
DELETE /api/upload/{category}/{filename}
Authorization: Bearer {token}
```

---

### 6. Bulk Upload (Authenticated)
```
POST /api/upload/bulk
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `files[]`: Multiple files
- `category`: "laws" | "judgments" | "legal-notices"

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bulk upload completed",
  "data": {
    "totalFiles": 10,
    "successCount": 9,
    "failCount": 1
  }
}
```

---

## 🔐 Security & Roles

### User Roles

| Role | Permissions |
|------|-------------|
| **ROLE_VIEWER** | ✅ Read all documents<br>❌ Cannot create/edit/delete |
| **ROLE_EDITOR** | ✅ Read all documents<br>✅ Create/Edit/Delete documents<br>✅ Upload files<br>✅ Manage users<br>❌ No admin dashboard |
| **ROLE_ADMIN** | ✅ All EDITOR permissions<br>✅ Access admin dashboard<br>✅ View statistics<br>✅ Full system access |

---

### Endpoint Access Control

#### Public (No Authentication)
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/laws/**` (read only)
- `GET /api/judgments/**` (read only)
- `GET /api/legal-notices/**` (read only)
- `GET /api/files/**` (download)

#### Authenticated (Login Required)
- `POST /api/laws/**`
- `PUT /api/laws/**`
- `DELETE /api/laws/**`
- `POST /api/judgments/**`
- `POST /api/legal-notices/**`
- `POST /api/upload/**`

#### Admin Only
- `GET /api/admin/**`

#### Admin or Editor
- `GET /api/users/**`
- `POST /api/users/**`
- `PUT /api/users/**`
- `DELETE /api/users/**`

---

## 📡 Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "timestamp": "2025-12-20T10:00:00"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `RESOURCE_NOT_FOUND` | Resource with given ID not found |
| `VALIDATION_ERROR` | Input validation failed |
| `UNAUTHORIZED` | Not authenticated or token invalid |
| `FORBIDDEN` | Insufficient permissions |
| `DUPLICATE_ENTRY` | Username or email already exists |
| `UPLOAD_FAILED` | File upload failed |
| `LOGIN_FAILED` | Invalid credentials |

---

## 🎯 Frontend Integration Tips

### 1. Store JWT Token
```javascript
// After login success:
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data));
```

### 2. Add Token to Requests
```javascript
// Axios example:
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Fetch example:
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. Handle Token Expiration
```javascript
// Token expires after 24 hours
// Check for 401 errors and redirect to login:
if (response.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

### 4. File Upload
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

fetch(`/api/upload/law/${lawId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## 📋 Complete Endpoint Summary

### Total: 65+ API Endpoints

| Category | Endpoints | Public | Auth | Admin |
|----------|-----------|--------|------|-------|
| **Authentication** | 5 | 2 | 3 | 0 |
| **Laws** | 17 | 11 | 6 | 0 |
| **Judgments** | 11 | 6 | 5 | 0 |
| **Legal Notices** | 11 | 6 | 5 | 0 |
| **Users** | 9 | 2 | 7 | 0 |
| **Admin Dashboard** | 4 | 0 | 0 | 4 |
| **File Upload** | 8 | 1 | 7 | 0 |

---

## 🔗 API Testing

### Swagger UI
```
http://localhost:8080/api/swagger-ui.html
```

### Health Check
```
http://localhost:8080/api/actuator/health
```

### API Documentation
```
http://localhost:8080/api/api-docs
```

---

## 📝 TypeScript Interfaces (for Frontend)

```typescript
// API Response Wrapper
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

// Paginated Response
interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { sorted: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  empty: boolean;
}

// Law Interface
interface Law {
  id: string;
  title: string;
  type: string;
  year: number;
  lawNumber?: string;
  enactmentDate?: string;
  publicationDate?: string;
  effectiveDate?: string;
  category?: string;
  jurisdiction?: string;
  issuingAuthority?: string;
  ministry?: string;
  status?: string;
  summary?: string;
  keywords?: string[];
  tags?: string[];
  pdfUrl?: string;
  sourceUrl?: string;
  relatedLaws?: string[];
  amendments?: string[];
  language?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Judgment Interface
interface Judgment {
  id: string;
  caseNumber?: string;
  caseName: string;
  courtName: string;
  courtLevel: string;
  judges?: string[];
  judgmentDate?: string;
  parties?: string;
  caseType?: string;
  verdict?: string;
  summary?: string;
  legalPrinciples?: string[];
  citedCases?: string[];
  citedLaws?: string[];
  keywords?: string[];
  tags?: string[];
  jurisdiction?: string;
  language?: string;
  pdfUrl?: string;
  status?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Legal Notice Interface
interface LegalNotice {
  id: string;
  noticeNumber?: string;
  title: string;
  type: string;
  publicationDate?: string;
  issuingAuthority: string;
  ministry?: string;
  department?: string;
  gazetteIssue?: string;
  effectiveDate?: string;
  expiryDate?: string;
  summary?: string;
  applicableLaws?: string[];
  keywords?: string[];
  tags?: string[];
  jurisdiction?: string;
  language?: string;
  pdfUrl?: string;
  status?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

// User Interface
interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  organization?: string;
  position?: string;
  roles: string[];
  enabled: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  lastLogin?: string;
  passwordChangedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Login Response Interface
interface LoginResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  roles: string[];
}

// Dashboard Stats Interface
interface DashboardStats {
  totalLaws: number;
  totalJudgments: number;
  totalLegalNotices: number;
  totalUsers: number;
  totalDocuments: number;
  lawsThisYear: number;
  judgmentsThisYear: number;
  noticesThisYear: number;
}
```

---

## ✅ Complete!

This document contains **everything** you need to build the frontend:
- ✅ All endpoint URLs
- ✅ Request/Response formats
- ✅ All model fields with types
- ✅ Authentication flow
- ✅ Error handling
- ✅ TypeScript interfaces
- ✅ Security roles
- ✅ Examples for all operations

**Use this as your API reference guide for frontend development!** 🚀

