import { getSupabaseClient, isConfiguredForLiveSupabase } from '../lib/supabase';

export const PRIVATE_PROFILE_BUCKET = 'employee-profile-photos';
export const PRIVATE_DOCUMENTS_BUCKET = 'employee-private-documents';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const storageService = {
  validateProfileImage(file: File): FileValidationResult {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, and WebP image formats are permitted.' };
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 5 MB maximum limit.` };
    }

    return { valid: true };
  },

  async uploadProfilePhoto(
    tenantId: string,
    employeeId: string,
    file: File | Blob
  ): Promise<{ signedUrl: string | null; storagePath: string | null; error: string | null }> {
    try {
      if (file instanceof File) {
        const val = this.validateProfileImage(file);
        if (!val.valid) return { signedUrl: null, storagePath: null, error: val.error! };
      }

      const ext = file instanceof File ? file.name.split('.').pop() || 'webp' : 'webp';
      const storagePath = `${tenantId}/${employeeId}/avatar-${Date.now()}.${ext}`;

      if (isConfiguredForLiveSupabase()) {
        const client = getSupabaseClient();
        // Upload to private bucket
        const { error: uploadError } = await client.storage
          .from(PRIVATE_PROFILE_BUCKET)
          .upload(storagePath, file, {
            upsert: true,
            contentType: file instanceof File ? file.type : 'image/webp',
          });

        if (uploadError) throw uploadError;

        // Generate authenticated signed URL (valid for 1 hour)
        const { data: signedData, error: signError } = await client.storage
          .from(PRIVATE_PROFILE_BUCKET)
          .createSignedUrl(storagePath, 3600);

        if (signError) throw signError;

        return { signedUrl: signedData.signedUrl, storagePath, error: null };
      }

      // Local browser fallback: convert to persistent base64 data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ signedUrl: reader.result as string, storagePath, error: null });
        };
        reader.onerror = () => {
          resolve({ signedUrl: null, storagePath: null, error: 'Failed to process local image file.' });
        };
        reader.readAsDataURL(file);
      });
    } catch (err: any) {
      console.warn('[storageService] Profile upload exception:', err);
      return { signedUrl: null, storagePath: null, error: err?.message || 'Failed to upload profile photo' };
    }
  },

  async uploadSignature(
    tenantId: string,
    employeeId: string,
    dataUrlOrBlob: string | Blob
  ): Promise<{ signedUrl: string | null; error: string | null }> {
    try {
      if (typeof dataUrlOrBlob === 'string') {
        return { signedUrl: dataUrlOrBlob, error: null };
      }

      const storagePath = `${tenantId}/${employeeId}/signature-${Date.now()}.png`;

      if (isConfiguredForLiveSupabase()) {
        const client = getSupabaseClient();
        const { error } = await client.storage
          .from(PRIVATE_DOCUMENTS_BUCKET)
          .upload(storagePath, dataUrlOrBlob, { upsert: true, contentType: 'image/png' });
        if (error) throw error;

        const { data: signedData } = await client.storage
          .from(PRIVATE_DOCUMENTS_BUCKET)
          .createSignedUrl(storagePath, 3600);

        return { signedUrl: signedData?.signedUrl || null, error: null };
      }

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ signedUrl: reader.result as string, error: null });
        reader.readAsDataURL(dataUrlOrBlob);
      });
    } catch (err: any) {
      return { signedUrl: null, error: err?.message || 'Signature upload error' };
    }
  },

  async deleteProfilePhoto(tenantId: string, storagePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (isConfiguredForLiveSupabase()) {
        const client = getSupabaseClient();
        const { error } = await client.storage.from(PRIVATE_PROFILE_BUCKET).remove([storagePath]);
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },
};
