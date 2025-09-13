# NyxOps

A comprehensive React application for managing cases, projects, and handovers with Supabase integration and file attachment capabilities.

## Features

- **Cases Management**: Track and manage support incidents with different priorities and statuses
- **File Attachments**: Upload, manage, and download files for each case with drag-and-drop support
- **Projects Tracking**: Monitor project progress with visual progress bars and status updates  
- **Handovers**: Manage task handovers between team members with different types (incoming, outgoing, personal)
- **Authentication**: Google OAuth integration via Supabase
- **Real-time Data**: Automatic synchronization with Supabase database
- **Export Functionality**: Export data as JSON or ZIP (with attachments)
- **Responsive Design**: Modern UI with Tailwind CSS and accessibility features

## Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Storage)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Handling**: JSZip for exports, browser File API for uploads
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Supabase:
   - Update the Supabase URL and anon key in `src/App.jsx`
   - Enable Google OAuth in your Supabase dashboard
   - **Set up Storage** (see Storage Setup section below)

3. Run database migrations:
   ```bash
   # Apply the attachments migration to your Supabase database
   # Execute the SQL in migrations/20250827_add_case_attachments.sql
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Storage Setup

File attachments require Supabase Storage configuration:

1. **Create Storage Bucket:**
   ```sql
   -- In your Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public) VALUES ('case-attachments', 'case-attachments', false);
   ```

2. **Set Storage Policies:**
   The migration file `migrations/20250827_add_case_attachments.sql` includes RLS policies for the attachments table, but you may need to configure storage bucket policies in your Supabase dashboard under Storage → case-attachments → Policies.

3. **Verify Setup:**
   - Go to Supabase Dashboard → Storage
   - Confirm `case-attachments` bucket exists
   - Test file upload functionality

### File Attachment Features

- **Supported File Types**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, Images (PNG, JPG, JPEG, GIF)
- **File Limits**: Maximum 10 files per case, 25MB per file
- **Upload Methods**: Drag-and-drop or click to browse
- **Management**: View, download, and delete attachments per case
- **Export Options**: 
  - JSON export includes attachment metadata
  - ZIP export includes actual files with organized folder structure

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── App.jsx                    # Main application component
├── AttachmentsModal.jsx       # File attachment management modal
├── index.css                  # Global styles with Tailwind
├── main.jsx                   # Application entry point
└── utils/
    ├── attachments.js         # File attachment utility functions
    └── formatDate.js          # Date formatting utilities

migrations/
└── 20250827_add_case_attachments.sql  # Database schema for file attachments

public/
└── vite.svg                   # Application favicon

Configuration files:
├── package.json               # Dependencies and scripts
├── vite.config.js            # Vite build configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── README.md                 # This file
```

## Database Schema

The application uses the following database structure:

### Core Tables
- **cases**: Support incidents with priority and status tracking
- **projects**: Project tracking with progress monitoring  
- **handovers**: Task handover management
- **case_attachments**: File attachments linked to cases (NEW)

### File Attachments Schema
```sql
-- case_attachments table
CREATE TABLE case_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 26214400), -- 25MB
  CONSTRAINT valid_filename CHECK (char_length(original_filename) <= 255)
);
```

### Storage Integration
- **Supabase Storage Bucket**: `case-attachments` (private)
- **File Organization**: `{user_id}/{case_id}/{filename}`
- **Security**: Row Level Security (RLS) policies ensure user isolation

All tables include comprehensive RLS policies for user data isolation and secure file access.

## Authentication

Users can sign in with Google OAuth. The application handles:
- Session management
- Auto-creation of database tables
- User-specific data filtering

## File Attachments API

The application provides comprehensive file attachment management:

### Core Functions (src/utils/attachments.js)

```javascript
// Upload a file to a case
await uploadAttachment(caseId, file);

// List all attachments for a case
const attachments = await listAttachments(caseId);

// Get download URL for a file
const url = await getDownloadUrl(storagePath, filename);

// Delete an attachment
await deleteAttachment(attachmentId, storagePath);

// Validate files before upload
const validFiles = validateFiles(fileList);
```

### File Validation Rules
- **Allowed Extensions**: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .png, .jpg, .jpeg, .gif
- **Size Limits**: Maximum 25MB per file, 10 files per case
- **Naming**: Automatic filename sanitization and duplicate handling

### Export Features
1. **JSON Export**: Includes attachment metadata (filename, size, type, upload date)
2. **ZIP Export**: Complete export with actual files organized by case ID
3. **Missing Files Handling**: Automatic detection and reporting of unavailable files

## Accessibility Features

The application includes comprehensive accessibility support:
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Focus Management**: Proper focus trapping in modals
- **ARIA Labels**: Screen reader support throughout the interface
- **Color Contrast**: Meets WCAG guidelines for both light and dark themes
- **Responsive Design**: Works across all device sizes

## Troubleshooting

### Common Issues

1. **Storage Bucket Missing**
   ```bash
   Error: Bucket not found
   Solution: Create the 'case-attachments' bucket in Supabase Storage
   ```

2. **File Upload Fails**
   ```bash
   Error: File too large or invalid type
   Solution: Check file size (<25MB) and allowed extensions
   ```

3. **RLS Policy Issues**
   ```bash
   Error: Permission denied
   Solution: Run the migration SQL to create proper RLS policies
   ```

4. **Export ZIP Missing Files**
   ```bash
   Issue: ZIP export shows missing files
   Solution: Check file permissions and storage bucket policies
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
