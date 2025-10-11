import { supabase } from './supabase';

export interface FileUploadOptions {
  folder?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export interface UploadResult {
  success: boolean;
  data?: {
    path: string;
    fullPath: string;
    publicUrl: string;
  };
  error?: string;
}

/**
 * Upload a file to Supabase storage
 */
export async function uploadFile(
  file: File,
  fileName: string,
  options: FileUploadOptions = {}
): Promise<UploadResult> {
  try {
    const {
      folder = 'general',
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'jpg', 'jpeg', 'png', 'gif']
    } = options;

    // Validate file size
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`
      };
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && !allowedTypes.includes(fileExtension)) {
      return {
        success: false,
        error: `File type .${fileExtension} is not allowed`
      };
    }

    // Create unique filename with timestamp
    const timestamp = new Date().getTime();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const filePath = `${folder}/${uniqueFileName}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('hydrogen-data')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('hydrogen-data')
      .getPublicUrl(filePath);

    return {
      success: true,
      data: {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: publicUrlData.publicUrl
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Delete a file from Supabase storage
 */
export async function deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from('hydrogen-data')
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
}

/**
 * Get signed URL for private files
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from('hydrogen-data')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get signed URL'
    };
  }
}

/**
 * List files in a folder
 */
export async function listFiles(folder: string = '') {
  try {
    const { data, error } = await supabase.storage
      .from('hydrogen-data')
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, files: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list files'
    };
  }
}

/**
 * Get file info
 */
export async function getFileInfo(filePath: string) {
  try {
    const { data, error } = await supabase.storage
      .from('hydrogen-data')
      .list('', {
        search: filePath
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, fileInfo: data[0] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get file info'
    };
  }
}

// File type validation helper
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return fileExtension ? allowedTypes.includes(fileExtension) : false;
}

// File size formatting helper
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
