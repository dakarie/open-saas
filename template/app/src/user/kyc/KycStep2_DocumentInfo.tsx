import { useState, FormEvent, ChangeEvent } from 'react';
import { type KycFormData } from '../KycPage';

interface KycStep2Props {
  initialData: Partial<KycFormData>;
  onNext: (data: Partial<KycFormData>) => void;
  onBack: () => void;
}

type Step2Errors = {
  documentType?: string;
  documentIdNumber?: string;
  documentIssuingCountry?: string;
  documentExpiryDate?: string; // Though optional, can have validation if provided
};

const documentTypes = ["Passport", "National ID", "Driver's License"];

export default function KycStep2_DocumentInfo({ initialData, onNext, onBack }: KycStep2Props) {
  const [documentType, setDocumentType] = useState(initialData.documentType || documentTypes[0]);
  const [documentIdNumber, setDocumentIdNumber] = useState(initialData.documentIdNumber || '');
  const [documentIssuingCountry, setDocumentIssuingCountry] = useState(initialData.documentIssuingCountry || '');
  const [documentExpiryDate, setDocumentExpiryDate] = useState(initialData.documentExpiryDate || '');
  const [errors, setErrors] = useState<Step2Errors>({});

  const validate = (): boolean => {
    const newErrors: Step2Errors = {};
    if (!documentType.trim()) newErrors.documentType = 'Document type is required.';
    if (!documentIdNumber.trim()) newErrors.documentIdNumber = 'Document ID number is required.';
    if (!documentIssuingCountry.trim()) newErrors.documentIssuingCountry = 'Issuing country is required.';

    if (documentExpiryDate) {
      const today = new Date();
      today.setHours(0,0,0,0); // Compare dates only
      const expiry = new Date(documentExpiryDate);
      if (expiry <= today) {
        newErrors.documentExpiryDate = 'Expiry date must be in the future.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({
        documentType,
        documentIdNumber,
        documentIssuingCountry,
        documentExpiryDate: documentExpiryDate || undefined,
      });
    }
  };

  const handleInputChange = (setter: (value: string) => void, fieldName: keyof Step2Errors) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(e.target.value);
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const inputClass = (fieldName: keyof Step2Errors) =>
    `mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border ${errors[fieldName] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm`;

  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const errorTextClass = "mt-1 text-xs text-red-500 dark:text-red-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4"> {/* Adjusted space-y */}
      <div>
        <label htmlFor="documentType" className={labelClass}>Document Type <span className="text-red-500">*</span></label>
        <select name="documentType" id="documentType" value={documentType} onChange={handleInputChange(setDocumentType, 'documentType')} className={inputClass('documentType')} required>
          {documentTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        {errors.documentType && <p className={errorTextClass}>{errors.documentType}</p>}
      </div>
      <div>
        <label htmlFor="documentIdNumber" className={labelClass}>Document ID Number <span className="text-red-500">*</span></label>
        <input type="text" name="documentIdNumber" id="documentIdNumber" value={documentIdNumber} onChange={handleInputChange(setDocumentIdNumber, 'documentIdNumber')} className={inputClass('documentIdNumber')} required />
        {errors.documentIdNumber && <p className={errorTextClass}>{errors.documentIdNumber}</p>}
      </div>
      <div>
        <label htmlFor="documentIssuingCountry" className={labelClass}>Issuing Country <span className="text-red-500">*</span></label>
        <input type="text" name="documentIssuingCountry" id="documentIssuingCountry" value={documentIssuingCountry} onChange={handleInputChange(setDocumentIssuingCountry, 'documentIssuingCountry')} className={inputClass('documentIssuingCountry')} required />
        {errors.documentIssuingCountry && <p className={errorTextClass}>{errors.documentIssuingCountry}</p>}
      </div>
      <div>
        <label htmlFor="documentExpiryDate" className={labelClass}>Expiry Date (Optional)</label>
        <input type="date" name="documentExpiryDate" id="documentExpiryDate" value={documentExpiryDate} onChange={handleInputChange(setDocumentExpiryDate, 'documentExpiryDate')} className={inputClass('documentExpiryDate')} />
        {errors.documentExpiryDate && <p className={errorTextClass}>{errors.documentExpiryDate}</p>}
      </div>
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Back
        </button>
        <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Next: Document Upload
        </button>
      </div>
    </form>
  );
}
