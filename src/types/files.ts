import { UserRole } from './index';

export type FileEntityType = 'company' | 'user' | 'employee' | 'client' | 'product';

export type FileCategory =
  | 'company_logo'
  | 'company_document'
  | 'user_profile'
  | 'employee_photo'
  | 'employee_document'
  | 'client_photo'
  | 'client_document'
  | 'product_image'
  | 'banner_image'
  | 'media_file';

export type EmployeeDocumentTag =
  | 'Aadhaar'
  | 'PAN'
  | 'Resume'
  | 'Offer Letter'
  | 'Joining Letter'
  | 'Certificates'
  | 'Other';

export type ClientDocumentTag =
  | 'Agreements'
  | 'Contracts'
  | 'KYC Documents'
  | 'Other';

export type CompanyDocumentTag =
  | 'GST Certificate'
  | 'PAN Card'
  | 'Registration Documents'
  | 'Compliance Documents'
  | 'Other';

export type DocumentTag = EmployeeDocumentTag | ClientDocumentTag | CompanyDocumentTag | 'Product Image' | 'Other';

export interface ManagedFile {
  id: string;
  tenantId: string;
  companyId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileSizeFormatted: string;
  fileType: string;
  extension: string;
  storagePath: string;
  url: string;
  thumbnailUrl?: string;
  entityType: FileEntityType;
  entityId: string;
  folder: 'logos' | 'documents' | 'profile' | 'images';
  category: FileCategory;
  documentTag?: DocumentTag;
  description?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedByRole: UserRole;
  uploadedAt: string;
  updatedAt: string;
  version: number;
  isPublic?: boolean;
}

export interface FileAuditRecord {
  id: string;
  fileId: string;
  fileName: string;
  action: 'UPLOAD' | 'UPDATE' | 'DELETE' | 'DOWNLOAD' | 'PREVIEW';
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  companyId: string;
  companyName: string;
  fileSize: string;
  storagePath: string;
  timestamp: string;
  details?: string;
}

export interface FileSizeLimits {
  profilePhoto: number; // 5 MB
  companyLogo: number;  // 10 MB
  documents: number;    // 25 MB
  mediaFiles: number;   // 50 MB
}

export const FILE_SIZE_LIMITS: FileSizeLimits = {
  profilePhoto: 5 * 1024 * 1024,   // 5 MB
  companyLogo: 10 * 1024 * 1024,   // 10 MB
  documents: 25 * 1024 * 1024,     // 25 MB
  mediaFiles: 50 * 1024 * 1024,    // 50 MB
};

export const SUPPORTED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
  documents: [
    'application/pdf',
    'application/msword', // doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.ms-excel', // xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'text/csv',
    'application/vnd.ms-powerpoint', // ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    'text/plain',
  ],
  media: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
  ],
};
