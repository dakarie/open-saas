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

  const inputClass = "mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 bg-red-100 p-3 rounded">{error}</div>}

      <div>
        <label htmlFor="documentFront" className={labelClass}>Document Front</label>
        <input type="file" name="documentFront" id="documentFront" onChange={(e) => handleFileChange(e, 'front')} className={inputClass} accept={ALLOWED_FILE_TYPES_FOR_KYC.join(',')} />
        {uploadProgressFront > 0 && <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"><div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${uploadProgressFront}%` }}></div></div>}
        {documentFrontFileId && !documentFrontFile && <p className="text-sm text-green-600 mt-1">Front document uploaded: {documentFrontFileId}</p>}
      </div>

      <div>
        <label htmlFor="documentBack" className={labelClass}>Document Back (Optional, e.g., for ID cards)</label>
        <input type="file" name="documentBack" id="documentBack" onChange={(e) => handleFileChange(e, 'back')} className={inputClass} accept={ALLOWED_FILE_TYPES_FOR_KYC.join(',')} />
        {uploadProgressBack > 0 && <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"><div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${uploadProgressBack}%` }}></div></div>}
        {documentBackFileId && !documentBackFile && <p className="text-sm text-green-600 mt-1">Back document uploaded: {documentBackFileId}</p>}
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Back
        </button>
        <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          disabled={uploadProgressFront > 0 && uploadProgressFront < 100 || uploadProgressBack > 0 && uploadProgressBack < 100}
        >
          {(uploadProgressFront > 0 && uploadProgressFront < 100) || (uploadProgressBack > 0 && uploadProgressBack < 100) ? 'Uploading...' : 'Next: Review'}
        </button>
      </div>
    </form>
  );
}
