import JSZip from 'jszip';
import { listAttachments, getDownloadUrl } from './attachments.js';
import { isFeatureEnabled } from '../config/features.js';

export const handleExportData = async (activeTab, { cases, projects, handovers, notes, todos }) => {
  let dataToExport = [];
  let filename = '';

  if (activeTab === 'cases') {
    // Export all cases with attachment metadata
    dataToExport = await Promise.all(cases.map(async (case_) => {
      try {
        const attachments = await listAttachments(case_.id);
        return {
          ...case_,
          attachments: attachments.map(att => ({
            filename: att.original_filename,
            size: att.file_size,
            mime: att.mime_type,
            uploadedAt: att.created_at
          }))
        };
      } catch (error) {
        console.warn(`Failed to load attachments for case ${case_.id}:`, error);
        return { ...case_, attachments: [] };
      }
    }));
    filename = `cases_export_${new Date().toISOString().split('T')[0]}.json`;
  } else if (activeTab === 'projects') {
    dataToExport = projects;
    filename = `projects_export_${new Date().toISOString().split('T')[0]}.json`;
  } else if (activeTab === 'handovers') {
    dataToExport = handovers;
    filename = `handovers_export_${new Date().toISOString().split('T')[0]}.json`;
  } else {
    // Dashboard - export all data with case attachments
    const casesWithAttachments = await Promise.all(cases.map(async (case_) => {
      try {
        const attachments = await listAttachments(case_.id);
        return {
          ...case_,
          attachments: attachments.map(att => ({
            filename: att.original_filename,
            size: att.file_size,
            mime: att.mime_type,
            uploadedAt: att.created_at
          }))
        };
      } catch (error) {
        console.warn(`Failed to load attachments for case ${case_.id}:`, error);
        return { ...case_, attachments: [] };
      }
    }));

    dataToExport = { 
      cases: casesWithAttachments, 
      projects, 
      handovers, 
      notes, 
      todos,
      exportDate: new Date().toISOString(),
      totalCases: cases.length,
      totalProjects: projects.length,
      totalHandovers: handovers.length
    };
    filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.json`;
  }

  // Create and download file
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Show success message
  console.log(`Exported ${filename} with ${Array.isArray(dataToExport) ? dataToExport.length : 'all'} items`);
};

export const handleExportWithAttachments = async (activeTab, { cases }) => {
  if (!isFeatureEnabled('ATTACHMENTS')) {
    console.warn('Export with attachments disabled via feature flag');
    return;
  }
  
  try {
    const zip = new JSZip();
    const missingFiles = [];
    let dataToExport = [];

    if (activeTab === 'cases') {
      dataToExport = cases;
    } else {
      // Dashboard export - use all cases
      dataToExport = cases;
    }

    // Add cases data with attachment metadata
    const casesWithAttachments = await Promise.all(dataToExport.map(async (case_) => {
      try {
        const attachments = await listAttachments(case_.id);
        
        // Download and add each attachment to ZIP
        for (const attachment of attachments) {
          try {
            const downloadUrl = await getDownloadUrl(attachment.storage_path, attachment.original_filename);
            const response = await fetch(downloadUrl);
            if (response.ok) {
              const blob = await response.blob();
              zip.file(`attachments/${case_.id}/${attachment.original_filename}`, blob);
            } else {
              missingFiles.push(`${case_.id}/${attachment.original_filename}`);
            }
          } catch (error) {
            console.warn(`Failed to download attachment ${attachment.original_filename}:`, error);
            missingFiles.push(`${case_.id}/${attachment.original_filename}`);
          }
        }

        return {
          ...case_,
          attachments: attachments.map(att => ({
            filename: att.original_filename,
            size: att.file_size,
            mime: att.mime_type,
            uploadedAt: att.created_at
          }))
        };
      } catch (error) {
        console.warn(`Failed to load attachments for case ${case_.id}:`, error);
        return { ...case_, attachments: [] };
      }
    }));

    // Add cases data to ZIP
    zip.file('cases.json', JSON.stringify(casesWithAttachments, null, 2));

    // Add missing files report if any
    if (missingFiles.length > 0) {
      zip.file('missing_files.txt', 
        `The following files could not be included in this export:\n\n${missingFiles.join('\n')}\n\nGenerated: ${new Date().toISOString()}`
      );
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cases_with_attachments_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Exported ZIP with attachments successfully');
    if (missingFiles.length > 0) {
      console.warn(`${missingFiles.length} files could not be included. See missing_files.txt in the archive.`);
    }
  } catch (error) {
    console.error('Failed to export with attachments:', error);
    alert('Failed to export with attachments. Please try again or use regular export.');
  }
};
