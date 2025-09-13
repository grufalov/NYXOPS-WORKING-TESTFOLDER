import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Download, CheckCircle, AlertCircle, Info, Eye } from 'lucide-react';
import { parseExcelData, mapImportData } from '../utils/rolesImportExport.js';

const ImportPreviewRow = ({ 
  item, 
  index, 
  existingRoles = [], 
  isDarkTheme = false 
}) => {
  const isExisting = existingRoles.some(role => 
    role.job_rec_id === item.data.job_rec_id
  );
  
  const getActionBadge = () => {
    if (item.errors.length > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Skip
        </span>
      );
    }
    
    if (isExisting) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Update
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Create
      </span>
    );
  };
  
  const getStatusIcon = () => {
    if (item.errors.length > 0) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    
    if (item.warnings.length > 0) {
      return <Info className="w-4 h-4 text-yellow-500" />;
    }
    
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };
  
  return (
    <tr className={`${
      index % 2 === 0 
        ? isDarkTheme ? 'bg-slate-800' : 'bg-white'
        : isDarkTheme ? 'bg-slate-750' : 'bg-gray-50'
    }`}>
      {/* Row # */}
      <td className="px-3 py-2 text-sm text-gray-500 border-r border-gray-200 dark:border-slate-600">
        {item.rowIndex}
      </td>
      
      {/* Status */}
      <td className="px-3 py-2 border-r border-gray-200 dark:border-slate-600">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getActionBadge()}
        </div>
      </td>
      
      {/* Job Rec ID */}
      <td className="px-3 py-2 border-r border-gray-200 dark:border-slate-600">
        <span className={`text-sm font-medium ${
          item.errors.some(e => e.includes('Job Rec ID')) 
            ? 'text-red-500' : isDarkTheme ? 'text-white' : 'text-gray-900'
        }`}>
          {item.data.job_rec_id || '—'}
        </span>
      </td>
      
      {/* ROMA ID */}
      <td className="px-3 py-2 border-r border-gray-200 dark:border-slate-600">
        <span className="text-sm">
          {item.data.roma_id || '—'}
        </span>
      </td>
      
      {/* Role Type */}
      <td className="px-3 py-2 border-r border-gray-200 dark:border-slate-600">
        <span className={`text-sm ${
          item.errors.some(e => e.includes('Role Type')) 
            ? 'text-red-500' : ''
        }`}>
          {item.data.role_type || '—'}
        </span>
      </td>
      
      {/* Job Title */}
      <td className="px-3 py-2 border-r border-gray-200 dark:border-slate-600">
        <span className={`text-sm ${
          item.errors.some(e => e.includes('Job Title')) 
            ? 'text-red-500' : ''
        }`}>
          {item.data.title || '—'}
        </span>
      </td>
      
      {/* Issues */}
      <td className="px-3 py-2">
        {item.errors.length > 0 && (
          <div className="text-xs text-red-600 dark:text-red-400">
            {item.errors.join('; ')}
          </div>
        )}
        {item.warnings.length > 0 && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400">
            {item.warnings.join('; ')}
          </div>
        )}
      </td>
    </tr>
  );
};

const PasteImportModal = ({ 
  isOpen, 
  onClose, 
  onImport, 
  existingRoles = [],
  isDarkTheme = false 
}) => {
  const [step, setStep] = useState(1); // 1: Paste, 2: Preview, 3: Complete
  const [pasteText, setPasteText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [mappedData, setMappedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const textareaRef = useRef(null);
  
  const resetModal = useCallback(() => {
    setStep(1);
    setPasteText('');
    setParsedData(null);
    setMappedData([]);
    setIsProcessing(false);
    setImportResults(null);
    setShowFullPreview(false);
  }, []);
  
  const handleClose = () => {
    resetModal();
    onClose();
  };
  
  const handlePaste = async (e) => {
    const text = e.clipboardData?.getData('text/plain') || '';
    if (text) {
      setPasteText(text);
      processData(text);
    }
  };
  
  const processData = (text) => {
    try {
      setIsProcessing(true);
      
      const parsed = parseExcelData(text);
      setParsedData(parsed);
      
      const mapped = mapImportData(parsed.rows, parsed.hasHeaders);
      setMappedData(mapped);
      
      setStep(2);
    } catch (error) {
      console.error('Error processing data:', error);
      alert(`Error processing data: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleTextareaChange = (e) => {
    setPasteText(e.target.value);
  };
  
  const handleProcessText = () => {
    if (pasteText.trim()) {
      processData(pasteText);
    }
  };
  
  const handleImport = async () => {
    try {
      setIsProcessing(true);
      
      const validItems = mappedData.filter(item => item.isValid);
      const results = await onImport(validItems);
      
      setImportResults(results);
      setStep(3);
    } catch (error) {
      console.error('Error importing data:', error);
      alert(`Error importing data: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const validCount = mappedData.filter(item => item.isValid).length;
  const errorCount = mappedData.filter(item => item.errors.length > 0).length;
  const warningCount = mappedData.filter(item => item.warnings.length > 0).length;
  const updateCount = mappedData.filter(item => 
    item.isValid && existingRoles.some(role => 
      role.job_rec_id === item.data.job_rec_id
    )
  ).length;
  const createCount = validCount - updateCount;
  
  const previewData = showFullPreview ? mappedData : mappedData.slice(0, 20);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
        isDarkTheme ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkTheme ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-xl font-semibold ${
              isDarkTheme ? 'text-white' : 'text-gray-900'
            }`}>
              Import from Excel
            </h2>
            <p className={`text-sm mt-1 ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Step {step} of 3: {
                step === 1 ? 'Paste Data' : 
                step === 2 ? 'Preview & Validate' : 
                'Import Complete'
              }
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkTheme 
                ? 'hover:bg-slate-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 1 && (
            <div className="p-6 space-y-6">
              <div className={`p-4 rounded-lg border ${
                isDarkTheme 
                  ? 'bg-blue-900/20 border-blue-700' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <h3 className={`font-medium mb-2 ${
                  isDarkTheme ? 'text-blue-200' : 'text-blue-800'
                }`}>
                  Expected Column Order
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {[
                    'A: Job Rec ID', 'B: ROMA ID', 'C: Role Type',
                    'D: Job Title', 'E: GCM', 'F: Hiring Manager',
                    'G: Recruiter', 'H: Practice', 'I: Client',
                    'J: Date Created', 'K: Status', 'L: Risk Reasons'
                  ].map((col, index) => (
                    <div key={index} className={`${
                      isDarkTheme ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      {col}
                    </div>
                  ))}
                </div>
                <p className={`text-xs mt-2 ${
                  isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Date format: M/D/YYYY (e.g., 9/2/2025). Risk reasons separated by semicolon or comma.
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Paste Data from Excel
                </label>
                <textarea
                  ref={textareaRef}
                  value={pasteText}
                  onChange={handleTextareaChange}
                  onPaste={handlePaste}
                  placeholder="Paste your Excel data here (Ctrl+V)..."
                  className={`w-full h-80 px-3 py-2 rounded-lg border resize-none font-mono text-sm ${
                    isDarkTheme 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleProcessText}
                  disabled={!pasteText.trim() || isProcessing}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : 'Process Data'}
                </button>
                
                <div className={`text-sm ${
                  isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {pasteText.split('\n').filter(line => line.trim()).length} rows detected
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${
                  isDarkTheme ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <div className="text-2xl font-bold text-green-500">{createCount}</div>
                  <div className={`text-sm ${
                    isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    New Records
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  isDarkTheme ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <div className="text-2xl font-bold text-blue-500">{updateCount}</div>
                  <div className={`text-sm ${
                    isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Updates
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  isDarkTheme ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <div className="text-2xl font-bold text-red-500">{errorCount}</div>
                  <div className={`text-sm ${
                    isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Errors
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  isDarkTheme ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <div className="text-2xl font-bold text-yellow-500">{warningCount}</div>
                  <div className={`text-sm ${
                    isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Warnings
                  </div>
                </div>
              </div>
              
              {/* Preview Controls */}
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-medium ${
                  isDarkTheme ? 'text-white' : 'text-gray-900'
                }`}>
                  Preview ({previewData.length} of {mappedData.length} rows)
                </h3>
                
                {mappedData.length > 20 && (
                  <button
                    onClick={() => setShowFullPreview(!showFullPreview)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                      isDarkTheme 
                        ? 'text-blue-400 hover:bg-slate-700' 
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    {showFullPreview ? 'Show Less' : 'Show All'}
                  </button>
                )}
              </div>
              
              {/* Preview Table */}
              <div className={`overflow-auto rounded-lg border ${
                isDarkTheme ? 'border-slate-600' : 'border-gray-200'
              }`}>
                <table className={`w-full table-fixed ${
                  isDarkTheme ? 'bg-slate-800' : 'bg-white'
                }`}>
                  <thead className={`${
                    isDarkTheme ? 'bg-slate-700' : 'bg-gray-50'
                  }`}>
                    <tr>
                      <th className="w-16 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                        Row
                      </th>
                      <th className="w-24 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                        Action
                      </th>
                      <th className="w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                        Job Rec ID
                      </th>
                      <th className="w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                        ROMA ID
                      </th>
                      <th className="w-24 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                        Type
                      </th>
                      <th className="w-48 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                        Job Title
                      </th>
                      <th className="flex-1 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issues
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item, index) => (
                      <ImportPreviewRow
                        key={index}
                        item={item}
                        index={index}
                        existingRoles={existingRoles}
                        isDarkTheme={isDarkTheme}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="p-6 space-y-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
              <div>
                <h3 className={`text-lg font-medium mb-2 ${
                  isDarkTheme ? 'text-white' : 'text-gray-900'
                }`}>
                  Import Complete!
                </h3>
                <p className={`text-sm ${
                  isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Successfully imported {importResults?.created || 0} new records and updated {importResults?.updated || 0} existing records.
                </p>
              </div>
              
              {importResults?.errors && importResults.errors.length > 0 && (
                <div className={`p-4 rounded-lg border ${
                  isDarkTheme 
                    ? 'bg-red-900/20 border-red-700 text-red-200' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <h4 className="font-medium mb-2">Some errors occurred:</h4>
                  <ul className="text-sm space-y-1">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t ${
          isDarkTheme ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <div>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkTheme 
                    ? 'text-gray-300 hover:bg-slate-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Back
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkTheme 
                  ? 'text-gray-300 hover:bg-slate-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {step === 3 ? 'Close' : 'Cancel'}
            </button>
            
            {step === 2 && (
              <button
                onClick={handleImport}
                disabled={validCount === 0 || isProcessing}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                {isProcessing ? 'Importing...' : `Import ${validCount} Records`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasteImportModal;
