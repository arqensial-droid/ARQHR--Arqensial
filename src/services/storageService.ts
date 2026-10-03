import { getSupabaseClient, isConfiguredForLiveSupabase } from '../lib/supabase';
import { getLocalTableData, setLocalTableData } from './apiClient';
import {
  ManagedFile,
  FileAuditRecord,
  FileCategory,
  FileEntityType,
  DocumentTag,
  FILE_SIZE_LIMITS,
} from '../types/files';
import { UserRole } from '../types';

export const MEDIA_BUCKET = 'arqhr-media';
export const PRIVATE_DOCUMENTS_BUCKET = 'arqhr-private-documents';
const MANAGED_FILES_TABLE = 'managed_files';
const FILE_AUDIT_LOGS_TABLE = 'file_audit_logs';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  category?: FileCategory;
}

export interface UploadFileOptions {
  tenantId: string;
  companyId: string;
  entityType: FileEntityType;
  entityId: string;
  folder: 'logos' | 'documents' | 'profile' | 'images';
  category: FileCategory;
  documentTag?: DocumentTag;
  description?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
  file: File | Blob;
  customFileName?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const storageService = {
  // 1. File Validation Engine
  validateFile(file: File, category: FileCategory): FileValidationResult {
    let maxSizeBytes: number;
    let allowedMimes: string[] = [];

    switch (category) {
      case 'user_profile':
      case 'employee_photo':
      case 'client_photo':
        maxSizeBytes = FILE_SIZE_LIMITS.profilePhoto; // 5 MB
        allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        break;

      case 'company_logo':
        maxSizeBytes = FILE_SIZE_LIMITS.companyLogo; // 10 MB
        allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
        break;

      case 'company_document':
      case 'employee_document':
      case 'client_document':
        maxSizeBytes = FILE_SIZE_LIMITS.documents; // 25 MB
        allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/webp',
        ];
        break;

      case 'product_image':
      case 'banner_image':
      case 'media_file':
      default:
        maxSizeBytes = FILE_SIZE_LIMITS.mediaFiles; // 50 MB
        allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
        break;
    }

    if (file.size > maxSizeBytes) {
      const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      return {
        valid: false,
        error: `File size (${formatFileSize(file.size)}) exceeds the ${maxMb} MB maximum limit for this upload type.`,
      };
    }

    // Check mime type (fallback to extension check for rare browser mime differences)
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const isDocExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'txt'].includes(fileExt);
    const isImgExt = ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(fileExt);

    const isMimeAllowed = allowedMimes.includes(file.type);
    const isExtAllowed =
      (category.includes('document') && isDocExt) ||
      (isImgExt && (category.includes('photo') || category.includes('logo') || category.includes('image')));

    if (!isMimeAllowed && !isExtAllowed) {
      return {
        valid: false,
        error: `File format (.${fileExt || 'unknown'}) is not supported. Supported formats include PDF, DOC, DOCX, XLS, XLSX, CSV, PPT, PPTX, TXT, JPG, PNG, WebP, SVG.`,
      };
    }

    return { valid: true, category };
  },

  // 2. Image Compression Engine (HTML5 Canvas)
  async compressImage(
    file: File | Blob,
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85
  ): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      // SVG files don't need raster compression
      if (file instanceof File && file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve({ blob: file, dataUrl, width: 500, height: 500 });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const outMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outMime, quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl, width, height });
            } else {
              reject(new Error('Failed to create compressed image blob'));
            }
          },
          outMime,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for compression'));
      };

      img.src = url;
    });
  },

  // 3. Thumbnail Generator
  async generateThumbnail(file: File | Blob, size = 128): Promise<string> {
    try {
      if (file.type && !file.type.startsWith('image/')) {
        return '';
      }
      const comp = await this.compressImage(file, size, size, 0.7);
      return comp.dataUrl;
    } catch {
      return '';
    }
  },

  // 4. Centralized File Uploader
  async uploadFile(options: UploadFileOptions): Promise<{ success: boolean; file?: ManagedFile; error?: string }> {
    try {
      const {
        tenantId,
        companyId,
        entityType,
        entityId,
        folder,
        category,
        documentTag,
        description,
        user,
        file,
        customFileName,
      } = options;

      const rawFile = file instanceof File ? file : null;
      const fileName = customFileName || (rawFile ? rawFile.name : `file-${Date.now()}`);
      const extension = fileName.split('.').pop()?.toLowerCase() || 'bin';

      // Validation
      if (rawFile) {
        const val = this.validateFile(rawFile, category);
        if (!val.valid) {
          return { success: false, error: val.error };
        }
      }

      // Storage path matching required structure:
      // /companies/{companyId}/logos
      // /companies/{companyId}/documents
      // /users/{userId}/profile
      // /employees/{employeeId}/documents
      // /clients/{clientId}/documents
      // /products/{productId}/images
      let storageFolderPrefix = '';
      switch (entityType) {
        case 'company':
          storageFolderPrefix = `/companies/${companyId}/${folder}`;
          break;
        case 'user':
          storageFolderPrefix = `/users/${entityId}/${folder}`;
          break;
        case 'employee':
          storageFolderPrefix = `/employees/${entityId}/${folder}`;
          break;
        case 'client':
          storageFolderPrefix = `/clients/${entityId}/${folder}`;
          break;
        case 'product':
          storageFolderPrefix = `/products/${entityId}/${folder}`;
          break;
        default:
          storageFolderPrefix = `/companies/${companyId}/${folder}`;
          break;
      }

      const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueFileName = `${Date.now()}_${sanitizedName}`;
      const storagePath = `${storageFolderPrefix}/${uniqueFileName}`.replace(/\/+/g, '/');

      // Compression & thumbnail for images
      let processedBlob: Blob = file;
      let dataUrlResult = '';
      let thumbnailUrl = '';

      const isImage = file.type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(extension);

      if (isImage) {
        try {
          const comp = await this.compressImage(file, 1600, 1600, 0.85);
          processedBlob = comp.blob;
          dataUrlResult = comp.dataUrl;
          thumbnailUrl = await this.generateThumbnail(file, 128);
        } catch {
          // fallback to raw file if compression fails
        }
      }

      let publicUrl = dataUrlResult;

      // Supabase Storage Integration
      if (isConfiguredForLiveSupabase()) {
        try {
          const client = getSupabaseClient();
          const bucketName = category.includes('document') ? PRIVATE_DOCUMENTS_BUCKET : MEDIA_BUCKET;

          const { error: uploadError } = await client.storage
            .from(bucketName)
            .upload(storagePath.replace(/^\//, ''), processedBlob, {
              upsert: true,
              contentType: file.type || 'application/octet-stream',
            });

          if (uploadError) {
            console.warn('[storageService] Supabase upload warning:', uploadError.message);
          } else {
            // Signed URL valid for 24 hours
            const { data: signedData } = await client.storage
              .from(bucketName)
              .createSignedUrl(storagePath.replace(/^\//, ''), 86400);

            if (signedData?.signedUrl) {
              publicUrl = signedData.signedUrl;
            }
          }
        } catch (supabaseErr) {
          console.warn('[storageService] Supabase storage exception fallback:', supabaseErr);
        }
      }

      // If dataUrlResult wasn't generated and not uploaded, read as dataUrl for fallback
      if (!publicUrl) {
        publicUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      }

      const newManagedFile: ManagedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        tenantId,
        companyId,
        fileName: sanitizedName,
        originalName: fileName,
        fileSize: file.size,
        fileSizeFormatted: formatFileSize(file.size),
        fileType: file.type || `application/${extension}`,
        extension,
        storagePath,
        url: publicUrl,
        thumbnailUrl: thumbnailUrl || publicUrl,
        entityType,
        entityId,
        folder,
        category,
        documentTag,
        description,
        uploadedBy: user.email,
        uploadedByName: user.fullName,
        uploadedByRole: user.role,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      // Persist in local storage table
      const storedFiles = getLocalTableData<ManagedFile>(MANAGED_FILES_TABLE);
      setLocalTableData(MANAGED_FILES_TABLE, [newManagedFile, ...storedFiles]);

      // Record Audit Log
      this.logAudit({
        fileId: newManagedFile.id,
        fileName: newManagedFile.fileName,
        action: 'UPLOAD',
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        userRole: user.role,
        companyId,
        companyName: companyId,
        fileSize: newManagedFile.fileSizeFormatted,
        storagePath,
        details: `Uploaded ${category} (${newManagedFile.fileSizeFormatted}) to ${storagePath}`,
      });

      return { success: true, file: newManagedFile };
    } catch (err: any) {
      console.error('[storageService] Upload failed:', err);
      return { success: false, error: err.message || 'File upload failed' };
    }
  },

  // 5. Replace File Content
  async replaceFile(
    fileId: string,
    newFile: File,
    user: { id: string; fullName: string; email: string; role: UserRole }
  ): Promise<{ success: boolean; file?: ManagedFile; error?: string }> {
    try {
      const storedFiles = getLocalTableData<ManagedFile>(MANAGED_FILES_TABLE);
      const existing = storedFiles.find((f) => f.id === fileId);
      if (!existing) {
        return { success: false, error: 'File record not found' };
      }

      // Validate
      const val = this.validateFile(newFile, existing.category);
      if (!val.valid) {
        return { success: false, error: val.error };
      }

      // Compress if image
      let processedBlob: Blob = newFile;
      let dataUrlResult = '';
      let thumbnailUrl = '';
      if (newFile.type?.startsWith('image/')) {
        try {
          const comp = await this.compressImage(newFile, 1600, 1600, 0.85);
          processedBlob = comp.blob;
          dataUrlResult = comp.dataUrl;
          thumbnailUrl = await this.generateThumbnail(newFile, 128);
        } catch {
          // fallback
        }
      }

      let publicUrl = dataUrlResult;
      if (!publicUrl) {
        publicUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(newFile);
        });
      }

      const updatedFile: ManagedFile = {
        ...existing,
        fileName: newFile.name,
        originalName: newFile.name,
        fileSize: newFile.size,
        fileSizeFormatted: formatFileSize(newFile.size),
        fileType: newFile.type,
        extension: newFile.name.split('.').pop()?.toLowerCase() || existing.extension,
        url: publicUrl,
        thumbnailUrl: thumbnailUrl || publicUrl,
        updatedAt: new Date().toISOString(),
        version: (existing.version || 1) + 1,
      };

      const updatedList = storedFiles.map((f) => (f.id === fileId ? updatedFile : f));
      setLocalTableData(MANAGED_FILES_TABLE, updatedList);

      this.logAudit({
        fileId: updatedFile.id,
        fileName: updatedFile.fileName,
        action: 'UPDATE',
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        userRole: user.role,
        companyId: updatedFile.companyId,
        companyName: updatedFile.companyId,
        fileSize: updatedFile.fileSizeFormatted,
        storagePath: updatedFile.storagePath,
        details: `Replaced file with new version v${updatedFile.version}`,
      });

      return { success: true, file: updatedFile };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to replace file' };
    }
  },

  // 6. Delete File
  async deleteFile(
    fileId: string,
    user: { id: string; fullName: string; email: string; role: UserRole }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const storedFiles = getLocalTableData<ManagedFile>(MANAGED_FILES_TABLE);
      const existing = storedFiles.find((f) => f.id === fileId);
      if (!existing) {
        return { success: false, error: 'File not found' };
      }

      // Check permissions: Super Admin can delete any, others only their company
      if (user.role !== 'super_admin' && existing.tenantId !== (user as any).tenantId) {
        return { success: false, error: 'Unauthorized to delete this file' };
      }

      // Remove from Supabase Storage if configured
      if (isConfiguredForLiveSupabase()) {
        try {
          const client = getSupabaseClient();
          const bucket = existing.category.includes('document') ? PRIVATE_DOCUMENTS_BUCKET : MEDIA_BUCKET;
          await client.storage.from(bucket).remove([existing.storagePath.replace(/^\//, '')]);
        } catch (e) {
          console.warn('[storageService] Supabase delete warning:', e);
        }
      }

      const filtered = storedFiles.filter((f) => f.id !== fileId);
      setLocalTableData(MANAGED_FILES_TABLE, filtered);

      this.logAudit({
        fileId: existing.id,
        fileName: existing.fileName,
        action: 'DELETE',
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        userRole: user.role,
        companyId: existing.companyId,
        companyName: existing.companyId,
        fileSize: existing.fileSizeFormatted,
        storagePath: existing.storagePath,
        details: `Deleted file from ${existing.storagePath}`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete file' };
    }
  },

  // 6b. Profile Photo & Employee Helpers (Backward Compatibility & Ease of Use)
  validateProfileImage(file: File): FileValidationResult {
    return this.validateFile(file, 'user_profile');
  },

  async uploadProfilePhoto(
    tenantId: string,
    employeeId: string,
    file: File | Blob,
    user?: { id: string; fullName: string; email: string; role: UserRole }
  ): Promise<{ signedUrl?: string; error?: string; file?: ManagedFile }> {
    const actingUser = user || {
      id: employeeId,
      fullName: 'User Profile',
      email: `${employeeId}@user.arqensial.internal`,
      role: 'employee' as UserRole,
    };

    const res = await this.uploadFile({
      tenantId,
      companyId: tenantId,
      entityType: 'user',
      entityId: employeeId,
      folder: 'profile',
      category: 'user_profile',
      user: actingUser,
      file,
      customFileName: `avatar-${employeeId}-${Date.now()}.jpg`,
    });

    if (res.success && res.file) {
      return { signedUrl: res.file.url, file: res.file };
    }
    return { error: res.error || 'Failed to upload profile photo' };
  },

  async uploadSignature(
    tenantId: string,
    employeeId: string,
    sigDataUrl: string
  ): Promise<{ signedUrl?: string; error?: string }> {
    try {
      const response = await fetch(sigDataUrl);
      const blob = await response.blob();
      const res = await this.uploadFile({
        tenantId,
        companyId: tenantId,
        entityType: 'user',
        entityId: employeeId,
        folder: 'profile',
        category: 'user_profile',
        user: {
          id: employeeId,
          fullName: 'Signature Vault',
          email: `${employeeId}@user.arqensial.internal`,
          role: 'employee' as UserRole,
        },
        file: blob,
        customFileName: `signature-${employeeId}-${Date.now()}.png`,
      });

      if (res.success && res.file) {
        return { signedUrl: res.file.url };
      }
      return { error: res.error || 'Failed to upload signature' };
    } catch (err: any) {
      return { error: err.message || 'Failed to process signature' };
    }
  },

  // 6c. Company Logo Uploader & Manager
  async uploadCompanyLogo(
    tenantId: string,
    file: File | Blob,
    user: { id: string; fullName: string; email: string; role: UserRole }
  ): Promise<{ success: boolean; url?: string; file?: ManagedFile; error?: string }> {
    const res = await this.uploadFile({
      tenantId,
      companyId: tenantId,
      entityType: 'company',
      entityId: tenantId,
      folder: 'logos',
      category: 'company_logo',
      user,
      file,
      customFileName: `logo-${tenantId}-${Date.now()}.${file instanceof File ? file.name.split('.').pop() : 'png'}`,
    });

    if (res.success && res.file) {
      return { success: true, url: res.file.url, file: res.file };
    }
    return { success: false, error: res.error || 'Failed to upload company logo' };
  },

  // 6d. Client-side Image Cropping
  async cropImage(
    imageSrc: string,
    crop: { x: number; y: number; width: number; height: number; scale?: number },
    outputSize = 400
  ): Promise<{ blob: Blob; dataUrl: string }> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Unable to create canvas context'));
          return;
        }

        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          outputSize,
          outputSize
        );

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              reject(new Error('Failed to generate cropped image'));
            }
          },
          'image/jpeg',
          0.9
        );
      };
      image.onerror = (err) => reject(err);
      image.src = imageSrc;
    });
  },

  // 7. Download File
  downloadFile(
    file: ManagedFile,
    user: { id: string; fullName: string; email: string; role: UserRole }
  ) {
    try {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.originalName || file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.logAudit({
        fileId: file.id,
        fileName: file.fileName,
        action: 'DOWNLOAD',
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        userRole: user.role,
        companyId: file.companyId,
        companyName: file.companyId,
        fileSize: file.fileSizeFormatted,
        storagePath: file.storagePath,
        details: `Downloaded ${file.fileName} (${file.fileSizeFormatted})`,
      });
    } catch (err) {
      console.error('[storageService] Download error:', err);
    }
  },

  // 8. Retrieve Files with multi-tenant filtering
  getFiles(filters?: {
    tenantId?: string;
    entityType?: FileEntityType;
    entityId?: string;
    folder?: string;
    category?: FileCategory;
  }): ManagedFile[] {
    const all = getLocalTableData<ManagedFile>(MANAGED_FILES_TABLE);
    if (!filters) return all;

    return all.filter((f) => {
      if (filters.tenantId && filters.tenantId !== 'all' && f.tenantId !== filters.tenantId) {
        return false;
      }
      if (filters.entityType && f.entityType !== filters.entityType) {
        return false;
      }
      if (filters.entityId && f.entityId !== filters.entityId) {
        return false;
      }
      if (filters.folder && f.folder !== filters.folder) {
        return false;
      }
      if (filters.category && f.category !== filters.category) {
        return false;
      }
      return true;
    });
  },

  // 8b. Retrieve Files with Security RLS Enforcement
  getFilesForUser(
    user: { id: string; role: UserRole; tenantId: string },
    filters?: {
      tenantId?: string;
      entityType?: FileEntityType;
      entityId?: string;
      folder?: string;
      category?: FileCategory;
    }
  ): ManagedFile[] {
    const all = getLocalTableData<ManagedFile>(MANAGED_FILES_TABLE);
    return all.filter((f) => {
      // Row Level Security: Super Admin has global access; other roles strictly bounded to their tenant
      if (user.role !== 'super_admin' && f.tenantId !== user.tenantId) {
        return false;
      }
      if (filters?.tenantId && filters.tenantId !== 'all' && f.tenantId !== filters.tenantId) {
        return false;
      }
      if (filters?.entityType && f.entityType !== filters.entityType) {
        return false;
      }
      if (filters?.entityId && f.entityId !== filters.entityId) {
        return false;
      }
      if (filters?.folder && f.folder !== filters.folder) {
        return false;
      }
      if (filters?.category && f.category !== filters.category) {
        return false;
      }
      return true;
    });
  },

  // 9. Audit Logger
  logAudit(entry: Omit<FileAuditRecord, 'id' | 'timestamp'>): FileAuditRecord {
    const record: FileAuditRecord = {
      id: `faudit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    const audits = getLocalTableData<FileAuditRecord>(FILE_AUDIT_LOGS_TABLE);
    setLocalTableData(FILE_AUDIT_LOGS_TABLE, [record, ...audits].slice(0, 500));

    if (isConfiguredForLiveSupabase()) {
      try {
        const client = getSupabaseClient();
        client.from('file_audit_logs').insert({
          id: record.id,
          file_id: record.fileId,
          file_name: record.fileName,
          action: record.action,
          user_id: record.userId,
          user_name: record.userName,
          user_email: record.userEmail,
          user_role: record.userRole,
          company_id: record.companyId,
          file_size: record.fileSize,
          storage_path: record.storagePath,
          details: record.details,
          created_at: record.timestamp,
        }).then(({ error }) => {
          if (error) console.warn('[storageService] Supabase audit insert notice:', error.message);
        });
      } catch (e) {
        // silent fallback
      }
    }

    return record;
  },

  getAuditLogs(companyId?: string): FileAuditRecord[] {
    const all = getLocalTableData<FileAuditRecord>(FILE_AUDIT_LOGS_TABLE);
    if (!companyId || companyId === 'all') return all;
    return all.filter((a) => a.companyId === companyId);
  },
};
