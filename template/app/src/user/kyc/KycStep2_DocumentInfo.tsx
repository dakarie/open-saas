import { useState, FormEvent } from 'react';
import { type KycFormData } from '../KycPage';

interface KycStep2Props {
  initialData: Partial<KycFormData>;
  onNext: (data: Partial<KycFormData>) => void;
  onBack: () => void;
}

const documentTypes = ["Passport", "National ID", "Driver's License"];

export default function KycStep2_DocumentInfo({ initialData, onNext, onBack }: KycStep2Props) {
  const [documentType, setDocumentType] = useState(initialData.documentType || documentTypes[0]);
  const [documentIdNumber, setDocumentIdNumber] = useState(initialData.documentIdNumber || '');
  const [documentIssuingCountry, setDocumentIssuingCountry] = useState(initialData.documentIssuingCountry || '');
  const [documentExpiryDate, setDocumentExpiryDate] = useState(initialData.documentExpiryDate || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!documentType || !documentIdNumber || !documentIssuingCountry) {
      alert('Please fill in all required document fields.');
      return;
    }
    onNext({
      documentType,
      documentIdNumber,
      documentIssuingCountry,
      documentExpiryDate: documentExpiryDate || undefined, // Optional field
    });
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="documentType" className={labelClass}>Document Type</label>
        <select name="documentType" id="documentType" value={documentType} onChange={(e) => setDocumentType(e.target.value)} className={inputClass} required>
          {documentTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="documentIdNumber" className={labelClass}>Document ID Number</label>
        <input type="text" name="documentIdNumber" id="documentIdNumber" value={documentIdNumber} onChange={(e) => setDocumentIdNumber(e.target.value)} className={inputClass} required />
      </div>
      <div>
        <label htmlFor="documentIssuingCountry" className={labelClass}>Issuing Country</label>
        <input type="text" name="documentIssuingCountry" id="documentIssuingCountry" value={documentIssuingCountry} onChange={(e) => setDocumentIssuingCountry(e.target.value)} className={inputClass} required />
      </div>
      <div>
        <label htmlFor="documentExpiryDate" className={labelClass}>Expiry Date (Optional)</label>
        <input type="date" name="documentExpiryDate" id="documentExpiryDate" value={documentExpiryDate} onChange={(e) => setDocumentExpiryDate(e.target.value)} className={inputClass} />
      </div>
      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Back
        </button>
        <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
          Next: Upload Documents
        </button>
      </div>
    </form>
  );
}
