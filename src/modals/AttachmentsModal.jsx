import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Trash2, X, FileText, File, Image } from 'lucide-react';
import {
  listAttachments,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
  validateFiles,
  formatFileSize,
  ALLOWED_EXT,
  MAX_PER_CASE
} from '../utils/attachments.js';
import { isFeatureEnabled } from '../config/features.js';

const AttachmentsModal = ({ caseId, isOpen, onClose }) => {
  // Early return if feature is disabled
  if (!isFeatureEnabled('ATTACHMENTS') || !isOpen) return null;
  
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Load attachments when modal opens
  useEffect(() => {
    if (isOpen && caseId) {
      loadAttachments();
    }
  }, [isOpen, caseId]);

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Focus trap
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, input, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadAttachments = async () => {
    setLoading(true);
    try {
      const data = await listAttachments(caseId);
      setAttachments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (files) => {
    if (files.length === 0) return;
    uploadFiles(Array.from(files));
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    setError('');

    try {
      // Validate files first
      const validation = await validateFiles(caseId, files);
      if (!validation.valid) {
        setError(validation.errors.join(' '));
        setUploading(false);
        return;
      }

      // Upload files one by one
      const newAttachments = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ [file.name]: 0 });

        try {
          const attachment = await uploadAttachment(caseId, file);
          newAttachments.push(attachment);
          setUploadProgress({ [file.name]: 100 });
        } catch (err) {
          setError(`Failed to upload ${file.name}: ${err.message}`);
          break;
        }
      }

      // Refresh attachments list
      await loadAttachments();
      setUploadProgress({});
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId, filename) => {
    if (!window.confirm(`Delete "${filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteAttachment(attachmentId);
      await loadAttachments(); // Refresh list
    } catch (err) {
      setError(`Failed to delete ${filename}: ${err.message}`);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      await downloadAttachment(attachment);
    } catch (err) {
      setError(`Failed to download ${attachment.original_filename}: ${err.message}`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const getFileIcon = (mimeType, filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    
    if (mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-[#e69a96]" />;
    }
    if (ext === 'pdf') {
      return <FileText className="w-5 h-5 text-[#e69a96]" />;
    }
    if (['xlsx', 'xls', 'docx', 'doc'].includes(ext)) {
      return <FileText className="w-5 h-5 text-[#8a87d6]" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-[#424250] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attachments-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 id="attachments-title" className="text-xl font-semibold text-white">
            Case Attachments ({attachments.length}/{MAX_PER_CASE})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Close attachments modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-[#e69a96]/50 border border-[#e69a96] rounded-lg text-[#e69a96]">
              {error}
              <button
                onClick={() => setError('')}
                className="ml-2 text-[#e69a96] hover:text-[#e69a96]"
              >
                ×
              </button>
            </div>
          )}

          {/* Upload area */}
          <div className="mb-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-[#8a87d6] bg-[#8a87d6]/20'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-white font-medium">
                  Drag files here or click to browse
                </p>
                <p className="text-slate-400 text-sm">
                  Max {MAX_PER_CASE} files, 25MB each. Supported: {ALLOWED_EXT.join(', ')}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-4 px-4 py-2 bg-[#8a87d6] text-white rounded-lg hover:bg-[#8a87d6] transition-colors disabled:opacity-50"
                  aria-describedby="file-upload-help"
                >
                  Choose Files
                </button>
                <div id="file-upload-help" className="sr-only">
                  Upload files by selecting them from your computer. Maximum 10 files per case, 25 megabytes each.
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_EXT.join(',')}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                aria-label="Select files to upload"
              />
            </div>

            {/* Upload progress */}
            {uploading && Object.keys(uploadProgress).length > 0 && (
              <div className="mt-4 space-y-2">
                {Object.entries(uploadProgress).map(([filename, progress]) => (
                  <div key={filename} className="bg-[#8a87d6] rounded-lg p-3">
                    <div className="flex justify-between text-sm text-slate-300 mb-1">
                      <span>{filename}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-[#8a87d6] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments list */}
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading attachments...</div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No attachments yet</div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Current Files</h3>
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="bg-[#8a87d6] rounded-lg p-4 flex items-center justify-between hover:bg-[#8a87d6] transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(attachment.mime_type, attachment.original_filename)}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleDownload(attachment)}
                        className="text-white hover:text-[#8a87d6] transition-colors font-medium text-left truncate block max-w-full"
                        title={`Download ${attachment.original_filename}`}
                      >
                        {attachment.original_filename}
                      </button>
                      <div className="text-slate-400 text-sm">
                        {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDownload(attachment)}
                      className="p-2 text-[#8a87d6] hover:text-[#8a87d6] transition-colors"
                      title={`Download ${attachment.original_filename}`}
                      aria-label={`Download ${attachment.original_filename}`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(attachment.id, attachment.original_filename)}
                      className="p-2 text-[#e69a96] hover:text-[#e69a96] transition-colors"
                      title={`Delete ${attachment.original_filename}`}
                      aria-label={`Delete ${attachment.original_filename}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachmentsModal;

