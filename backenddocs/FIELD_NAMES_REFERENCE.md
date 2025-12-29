# 📋 API Quick Reference - Field Names Cheat Sheet

## 🔐 Authentication

### Login Request
```json
{ "username": "string", "password": "string" }
```

### Login Response
```json
{
  "token": "string",      // USE THIS for Authorization header
  "username": "string",
  "email": "string",
  "roles": ["string"]
}
```

---

## 📜 Law Fields

**Required:**
- `title` (string)
- `type` (string) - "Act", "Bill", "Regulation"
- `year` (number) - 2025

**Optional:**
- `lawNumber` (string) - "Act No. 12 of 2025"
- `enactmentDate` (string) - "2025-12-20"
- `publicationDate` (string)
- `effectiveDate` (string)
- `category` (string) - "Constitutional", "Criminal"
- `jurisdiction` (string) - "Kenya"
- `issuingAuthority` (string)
- `ministry` (string)
- `status` (string) - "Active", "Repealed", "Amended"
- `summary` (string) - Long text
- `keywords` (array) - ["keyword1", "keyword2"]
- `tags` (array)
- `pdfUrl` (string)
- `sourceUrl` (string)
- `relatedLaws` (array of IDs)
- `amendments` (array)
- `language` (string) - "English", "Swahili"

**Auto-generated:**
- `id` (string)
- `viewCount` (number) - default 0
- `downloadCount` (number) - default 0
- `createdAt` (datetime)
- `updatedAt` (datetime)

---

## ⚖️ Judgment Fields

**Required:**
- `caseName` (string)
- `courtName` (string)
- `courtLevel` (string) - "Supreme Court", "High Court", "Court of Appeal"

**Optional:**
- `caseNumber` (string) - "Petition No. 25 of 2021"
- `judges` (array) - ["Judge Name 1", "Judge Name 2"]
- `judgmentDate` (string) - "2025-12-20"
- `parties` (string) - "Petitioner vs Respondent"
- `caseType` (string) - "Constitutional", "Criminal", "Civil"
- `verdict` (string) - "Petition Allowed"
- `summary` (string)
- `legalPrinciples` (array)
- `citedCases` (array)
- `citedLaws` (array)
- `keywords` (array)
- `tags` (array)
- `jurisdiction` (string)
- `language` (string)
- `pdfUrl` (string)
- `status` (string) - "Final", "Pending Appeal"

**Auto-generated:**
- `id`, `viewCount`, `downloadCount`, `createdAt`, `updatedAt`

---

## 📰 Legal Notice Fields

**Required:**
- `title` (string)
- `type` (string) - "Statutory Instrument", "Gazette Notice"
- `issuingAuthority` (string)

**Optional:**
- `noticeNumber` (string) - "L.N. 123/2023"
- `publicationDate` (string)
- `ministry` (string)
- `department` (string)
- `gazetteIssue` (string) - "Kenya Gazette Vol. CXXV - No. 123"
- `effectiveDate` (string)
- `expiryDate` (string)
- `summary` (string)
- `applicableLaws` (array)
- `keywords` (array)
- `tags` (array)
- `jurisdiction` (string)
- `language` (string)
- `pdfUrl` (string)
- `status` (string) - "Active", "Expired", "Superseded"

**Auto-generated:**
- `id`, `viewCount`, `downloadCount`, `createdAt`, `updatedAt`

---

## 👥 User Fields

**Required:**
- `username` (string) - unique
- `email` (string) - unique, valid email
- `password` (string) - min 8 chars (hashed in DB)
- `fullName` (string)

**Optional:**
- `organization` (string)
- `position` (string)
- `roles` (array) - ["ROLE_ADMIN", "ROLE_EDITOR", "ROLE_VIEWER"]

**Auto-managed:**
- `id`
- `enabled` (boolean) - default true
- `accountNonExpired` (boolean)
- `accountNonLocked` (boolean)
- `credentialsNonExpired` (boolean)
- `lastLogin` (datetime)
- `passwordChangedAt` (datetime)
- `createdAt`, `updatedAt`

---

## 🎯 Common Enums/Values

### Law Types
```
"Act", "Bill", "Constitution", "Regulation", "Ordinance"
```

### Law Categories
```
"Constitutional", "Criminal", "Civil", "Administrative", 
"Commercial", "Labor", "Environmental", "Tax"
```

### Law Status
```
"Active", "Repealed", "Amended", "Pending"
```

### Court Levels
```
"Supreme Court", "Court of Appeal", "High Court", 
"Environment and Land Court", "Employment and Labour Relations Court"
```

### Case Types
```
"Constitutional", "Criminal", "Civil", "Commercial", 
"Family", "Land", "Employment"
```

### Judgment Status
```
"Final", "Pending Appeal", "Under Review"
```

### Legal Notice Types
```
"Statutory Instrument", "Gazette Notice", "Public Notice",
"Legal Notice", "Government Notice"
```

### Legal Notice Status
```
"Active", "Expired", "Superseded", "Revoked"
```

### User Roles
```
"ROLE_ADMIN", "ROLE_EDITOR", "ROLE_VIEWER"
```

### Languages
```
"English", "Swahili"
```

### Jurisdictions
```
"Kenya", "National", "County", "Regional"
```

---

## 📊 Pagination Parameters

All list endpoints support:
```
?page=0          // Page number (0-based)
&size=20         // Items per page
&sort=title,asc  // Sort by field,direction
```

---

## 🔍 Search & Filter Endpoints

### Laws
- `/api/laws/search?query=text`
- `/api/laws/type/{type}`
- `/api/laws/year/{year}`
- `/api/laws/category/{category}`
- `/api/laws/status/{status}`

### Judgments
- `/api/judgments/search?query=text`
- `/api/judgments/court-level/{courtLevel}`
- `/api/judgments/case-type/{caseType}`
- `/api/judgments/date-range?startDate=&endDate=`

### Legal Notices
- `/api/legal-notices/search?query=text`
- `/api/legal-notices/type/{type}`
- `/api/legal-notices/ministry/{ministry}`
- `/api/legal-notices/date-range?startDate=&endDate=`

---

## 📤 File Upload

**Endpoint:** `POST /api/upload/{category}/{id}`

**Categories:** `law`, `judgment`, `legal-notice`

**Form Data:**
```
file: PDF file (max 10MB)
```

**Supported Types:**
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Text (`.txt`)
- HTML (`.html`)

---

## 🎯 Frontend Form Fields

### Law Form
```javascript
{
  title: "",              // Text input, required
  type: "",               // Select dropdown, required
  year: 2025,             // Number input, required
  lawNumber: "",          // Text input
  enactmentDate: "",      // Date picker
  category: "",           // Select dropdown
  jurisdiction: "Kenya",  // Select dropdown
  status: "Active",       // Select dropdown
  summary: "",            // Textarea
  keywords: [],           // Tag input
  language: "English"     // Select dropdown
}
```

### Judgment Form
```javascript
{
  caseName: "",           // Text input, required
  courtName: "",          // Text input, required
  courtLevel: "",         // Select dropdown, required
  caseNumber: "",         // Text input
  judges: [],             // Array input (add/remove)
  judgmentDate: "",       // Date picker
  parties: "",            // Text input
  caseType: "",           // Select dropdown
  verdict: "",            // Text input
  summary: "",            // Textarea
  status: "Final"         // Select dropdown
}
```

### Legal Notice Form
```javascript
{
  title: "",              // Text input, required
  type: "",               // Select dropdown, required
  issuingAuthority: "",   // Text input, required
  noticeNumber: "",       // Text input
  publicationDate: "",    // Date picker
  ministry: "",           // Text input
  effectiveDate: "",      // Date picker
  summary: "",            // Textarea
  status: "Active"        // Select dropdown
}
```

### User Form (Register/Create)
```javascript
{
  username: "",           // Text input, required, unique
  email: "",              // Email input, required, unique
  password: "",           // Password input, required, min 8
  fullName: "",           // Text input, required
  organization: "",       // Text input
  position: "",           // Text input
  roles: ["ROLE_VIEWER"]  // Multi-select, default ROLE_VIEWER
}
```

---

## 🔑 Authorization Header Format

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 📱 API Base URLs

**Development:**
```
http://localhost:8080/api
```

**Production:**
```
https://your-domain.com/api
```

---

## ✅ HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Not logged in |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Backend error |

---

## 🎨 Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* your data */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Error description"
}
```

---

## 📋 Complete Field List for Copy-Paste

### Law Create/Update Payload
```json
{
  "title": "string",
  "type": "string",
  "year": 0,
  "lawNumber": "string",
  "enactmentDate": "2025-12-20",
  "publicationDate": "2025-12-20",
  "effectiveDate": "2025-12-20",
  "category": "string",
  "jurisdiction": "string",
  "issuingAuthority": "string",
  "ministry": "string",
  "status": "string",
  "summary": "string",
  "keywords": [],
  "tags": [],
  "pdfUrl": "string",
  "sourceUrl": "string",
  "relatedLaws": [],
  "amendments": [],
  "language": "string"
}
```

### Judgment Create/Update Payload
```json
{
  "caseNumber": "string",
  "caseName": "string",
  "courtName": "string",
  "courtLevel": "string",
  "judges": [],
  "judgmentDate": "2025-12-20",
  "parties": "string",
  "caseType": "string",
  "verdict": "string",
  "summary": "string",
  "legalPrinciples": [],
  "citedCases": [],
  "citedLaws": [],
  "keywords": [],
  "tags": [],
  "jurisdiction": "string",
  "language": "string",
  "pdfUrl": "string",
  "status": "string"
}
```

### Legal Notice Create/Update Payload
```json
{
  "noticeNumber": "string",
  "title": "string",
  "type": "string",
  "publicationDate": "2025-12-20",
  "issuingAuthority": "string",
  "ministry": "string",
  "department": "string",
  "gazetteIssue": "string",
  "effectiveDate": "2025-12-20",
  "expiryDate": "2025-12-20",
  "summary": "string",
  "applicableLaws": [],
  "keywords": [],
  "tags": [],
  "jurisdiction": "string",
  "language": "string",
  "pdfUrl": "string",
  "status": "string"
}
```

---

**Use this as your quick reference while coding the frontend!** 🚀

