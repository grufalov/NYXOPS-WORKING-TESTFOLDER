import { supabase } from '../supabaseClient.js';

// Constants
const ALLOWED_EXT = ['.xlsx', '.xls', '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.docx', '.doc'];
const MAX_PER_CASE = 10;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const SIGNED_URL_TTL = 3600;

const ALLOWED_MIME_TYPES = {
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.xls': ['application/vnd.ms-excel'],
  '.pdf': ['application/pdf'],
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.gif': ['image/gif'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.doc': ['application/msword']
};

/**
 * Sanitize filename to be safe for storage
 * @param {string} name - Original filename
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (name) => {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Replace invalid chars with underscore
    .replace(/_+/g, '_')               // Collapse multiple underscores
    .replace(/^_|_$/g, '')             // Remove leading/trailing underscores
    .substring(0, 100);                // Limit length to 100 chars
};

/**
 * Generate storage path for attachment
 * @param {string} caseId - Case UUID
 * @param {string} attachmentId - Attachment UUID
 * @param {string} sanitized - Sanitized filename
 * @returns {string} - Storage path
 */
export const pathFor = (caseId, attachmentId, sanitized) => {
  return `cases/${caseId}/${attachmentId}/${sanitized}`;
};

/**
 * Validate files before upload
 * @param {string} caseId - Case UUID
 * @param {FileList|File[]} incomingFiles - Files to validate
 * @returns {Promise<{valid: boolean, errors: string[]}>}
 */
export const validateFiles = async (caseId, incomingFiles) => {
  const errors = [];
  const files = Array.from(incomingFiles);

  // Check current attachment count
  const { count: currentCount } = await supabase
    .from('case_attachments')
    .select('*', { count: 'exact', head: true })
    .eq('case_id', caseId);

  // Check if adding these files would exceed limit
  if ((currentCount || 0) + files.length > MAX_PER_CASE) {
    errors.push(`Cannot upload ${files.length} files. Maximum ${MAX_PER_CASE} files per case (currently ${currentCount || 0}).`);
    return { valid: false, errors };
  }

  // Validate each file
  files.forEach((file, index) => {
    // Check file size
    if (file.size > MAX_FILE_BYTES) {
      errors.push(`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum 25MB allowed.`);
    }

    // Check file extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      errors.push(`File "${file.name}" has unsupported type "${ext}". Allowed: ${ALLOWED_EXT.join(', ')}.`);
    }

    // Check MIME type if available
    if (file.type && ALLOWED_MIME_TYPES[ext]) {
      const allowedMimes = ALLOWED_MIME_TYPES[ext];
      if (!allowedMimes.includes(file.type)) {
        errors.push(`File "${file.name}" has unexpected MIME type "${file.type}".`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
};

/**
 * List attachments for a case
 * @param {string} caseId - Case UUID
 * @returns {Promise<Array>} - Array of attachment records
 */
export const listAttachments = async (caseId) => {
  const { data, error } = await supabase
    .from('case_attachments')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list attachments: ${error.message}`);
  }

  return data || [];
};

/**
 * Upload attachment to storage and database
 * @param {string} caseId - Case UUID
 * @param {File} file - File to upload
 * @returns {Promise<Object>} - Created attachment record
 */
export const uploadAttachment = async (caseId, file) => {
  // Generate unique attachment ID
  const attachmentId = crypto.randomUUID();
  
  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.name);
  
  // Generate storage path
  const storagePath = pathFor(caseId, attachmentId, sanitizedFilename);

  try {
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('case-attachments')
      .upload(storagePath, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Insert database record
    const { data, error: dbError } = await supabase
      .from('case_attachments')
      .insert([{
        id: attachmentId,
        case_id: caseId,
        original_filename: file.name,
        sanitized_filename: sanitizedFilename,
        storage_path: storagePath,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (dbError) {
      // If DB insert fails, clean up uploaded file
      await supabase.storage
        .from('case-attachments')
        .remove([storagePath]);
      throw new Error(`Database error: ${dbError.message}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete attachment from storage and database
 * @param {string} attachmentId - Attachment UUID
 * @returns {Promise<void>}
 */
export const deleteAttachment = async (attachmentId) => {
  // First get the attachment record to get storage path
  const { data: attachment, error: fetchError } = await supabase
    .from('case_attachments')
    .select('storage_path')
    .eq('id', attachmentId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to find attachment: ${fetchError.message}`);
  }

  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('case-attachments')
      .remove([attachment.storage_path]);

    if (storageError) {
      throw new Error(`Failed to delete file from storage: ${storageError.message}`);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('case_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) {
      throw new Error(`Failed to delete database record: ${dbError.message}`);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Get signed download URL for attachment
 * @param {string} storagePath - Storage path
 * @param {string} downloadName - Filename for download
 * @returns {Promise<string>} - Signed URL
 */
export const getDownloadUrl = async (storagePath, downloadName) => {
  const { data, error } = await supabase.storage
    .from('case-attachments')
    .createSignedUrl(storagePath, SIGNED_URL_TTL, {
      download: true,
      transform: {
        download: sanitizeFilename(downloadName)
      }
    });

  if (error) {
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }

  return data.signedUrl;
};

/**
 * Download attachment by triggering browser download
 * @param {Object} attachment - Attachment record
 * @returns {Promise<void>}
 */
export const downloadAttachment = async (attachment) => {
  try {
    const url = await getDownloadUrl(attachment.storage_path, attachment.original_filename);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.original_filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export { ALLOWED_EXT, MAX_PER_CASE, MAX_FILE_BYTES, SIGNED_URL_TTL };
