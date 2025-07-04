import { useState, FormEvent, ChangeEvent } from 'react';
import { type KycFormData } from '../KycPage';
import { createFile } from 'wasp/client/operations';
import { type FileUploadError, validateFile, uploadFileWithProgress, type FileWithValidType } from '../../file-upload/fileUploading';
// Define allowed types, e.g. ['image/jpeg', 'image/png', 'application/pdf']
// For KYC, let's be specific. We can create kycConstants.ts or define here for now.

interface KycStep3Props {
  initialData: Partial<KycFormData>;
  onNext: (data: Partial<KycFormData>) => void;
  onBack: () => void;
}

// Placeholder for allowed file types - should be defined properly
const ALLOWED_FILE_TYPES_FOR_KYC = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE_MB = 5;

export default function KycStep3_DocumentUpload({ initialData, onNext, onBack }: KycStep3Props) {
  const [documentFrontFile, setDocumentFrontFile] = useState<File | null>(null);
  const [documentBackFile, setDocumentBackFile] = useState<File | null>(null); // Optional
  const [uploadProgressFront, setUploadProgressFront] = useState(0);
  const [uploadProgressBack, setUploadProgressBack] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // These would store the ID or key of the uploaded file after successful upload
  const [documentFrontFileId, setDocumentFrontFileId] = useState(initialData.documentFrontFileId || '');
  const [documentBackFileId, setDocumentBackFileId] = useState(initialData.documentBackFileId || '');


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fileType: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_FILE_TYPES_FOR_KYC.includes(file.type)) {
        setError(`Invalid file type for ${fileType}. Allowed: ${ALLOWED_FILE_TYPES_FOR_KYC.join(', ')}`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File too large for ${fileType}. Max size: ${MAX_FILE_SIZE_MB}MB`);
        return;
      }
      setError(null);
      if (fileType === 'front') {
        setDocumentFrontFile(file);
      } else {
        setDocumentBackFile(file);
      }
    }
  };

  const handleUpload = async (file: File, setProgress: (p: number) => void, purpose: string): Promise<string | null> => {
    if (!file) return null;

    const validationError = validateFile(file);
    if (validationError) {
      setError(`${purpose.replace('_', ' ')}: ${validationError.message}`);
      return null;
    }

    setProgress(0);
    setError(null);

    try {
      const uploadedFileId = await uploadFileWithProgress({
        file: file as FileWithValidType, // Cast because we've validated
        purpose: purpose,
        setUploadProgressPercent: setProgress,
      });
      setProgress(100); // Ensure it hits 100%
      return uploadedFileId;
    } catch (err: any) {
      setError(`Upload failed for ${purpose.replace('_', ' ')}: ${err.message || 'Server error'}`);
      setProgress(0);
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    let finalFrontFileId = documentFrontFileId;
    let finalBackFileId = documentBackFileId;

    if (documentFrontFile) {
      const uploadedId = await handleUpload(documentFrontFile, setUploadProgressFront, 'kyc_document_front');
      if (!uploadedId) return; // Error handled in handleUpload
      finalFrontFileId = uploadedId;
      setDocumentFrontFileId(uploadedId); // Update state for review display
    } else if (!finalFrontFileId) {
      setError('Please select the front of your document.');
      return;
    }

    if (documentBackFile) {
      const uploadedId = await handleUpload(documentBackFile, setUploadProgressBack, 'kyc_document_back');
      if (!uploadedId) return; // Error handled in handleUpload
      finalBackFileId = uploadedId;
      setDocumentBackFileId(uploadedId); // Update state for review display
    }

    // Ensure IDs are set before proceeding (handleUpload returns null on failure)
    if (!finalFrontFileId) {
        setError("Front document upload failed or was not completed.");
        return;
    }

    onNext({
      documentFrontFileId: finalFrontFileId,
      documentBackFileId: finalBackFileId || undefined,
    });
  };

  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  // Helper component for the file upload area
  const FileUploadArea = ({
    id,
    label,
    currentFile,
    currentFileId,
    progress,
    onFileChange,
    accept,
    helpText,
    uploadedTextPrefix = "Uploaded ID" // Default changed for brevity
  }: {
    id: string;
    label: string;
    currentFile: File | null;
    currentFileId: string;
    progress: number;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    accept: string;
    helpText: string;
    uploadedTextPrefix?: string;
  }) => (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md ${currentFile || currentFileId ? 'border-blue-500 dark:border-blue-400' : ''}`}>
        <div className="space-y-1 text-center">
          {/* Icon - you can use an SVG here */}
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-gray-600 dark:text-gray-400">
            <label htmlFor={id} className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-800 focus-within:ring-blue-500">
              <span>Upload a file</span>
              <input id={id} name={id} type="file" className="sr-only" onChange={onFileChange} accept={accept} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">{helpText}</p>
          {currentFile && <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">Selected: {currentFile.name}</p>}
        </div>
      </div>
      {progress > 0 && <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>}
      {currentFileId && !currentFile && <p className="text-sm text-green-600 dark:text-green-400 mt-1">{uploadedTextPrefix}: {currentFileId.substring(0, 20)}...</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8"> {/* Increased space-y */}
      {error && <div className="text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-200 p-3 rounded-md">{error}</div>}

      <FileUploadArea
        id="documentFront"
        label="Document Front"
        currentFile={documentFrontFile}
        currentFileId={documentFrontFileId}
        progress={uploadProgressFront}
        onFileChange={(e) => handleFileChange(e, 'front')}
        accept={ALLOWED_FILE_TYPES_FOR_KYC.join(',')}
        helpText={`PNG, JPG, PDF up to ${MAX_FILE_SIZE_MB}MB.`}
         uploadedTextPrefix="Front Document ID"
      />

      <FileUploadArea
        id="documentBack"
        label="Document Back (Optional, e.g., for ID cards)"
        currentFile={documentBackFile}
        currentFileId={documentBackFileId}
        progress={uploadProgressBack}
        onFileChange={(e) => handleFileChange(e, 'back')}
        accept={ALLOWED_FILE_TYPES_FOR_KYC.join(',')}
        helpText={`PNG, JPG, PDF up to ${MAX_FILE_SIZE_MB}MB.`}
        uploadedTextPrefix="Back Document ID"
      />

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Back
        </button>
        <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={(uploadProgressFront > 0 && uploadProgressFront < 100) || (uploadProgressBack > 0 && uploadProgressBack < 100)}
        >
          {(uploadProgressFront > 0 && uploadProgressFront < 100) || (uploadProgressBack > 0 && uploadProgressBack < 100) ? 'Uploading...' : 'Next: Review & Submit'}
        </button>
      </div>
    </form>
  );
}
