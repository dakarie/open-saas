import { type KycFormData } from '../KycPage';

interface KycStep4Props {
  formData: KycFormData;
  onSubmit: () => void;
  onBack: () => void;
}

export default function KycStep4_Review({ formData, onSubmit, onBack }: KycStep4Props) {
  const detailItemClass = "py-2 sm:grid sm:grid-cols-3 sm:gap-4";
  const dtClass = "text-sm font-medium text-gray-500 dark:text-gray-400";
  const ddClass = "mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Review Your Information</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Please ensure all details are correct before submitting.</p>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <dl>
          <div className={detailItemClass}>
            <dt className={dtClass}>Full Name</dt>
            <dd className={ddClass}>{formData.fullName || 'N/A'}</dd>
          </div>
          <div className={detailItemClass}>
            <dt className={dtClass}>Date of Birth</dt>
            <dd className={ddClass}>{formData.dateOfBirth || 'N/A'}</dd>
          </div>
          <div className={detailItemClass}>
            <dt className={dtClass}>Address</dt>
            <dd className={ddClass}>
              {formData.addressStreet || ''}<br />
              {formData.addressCity || ''}, {formData.addressState || ''} {formData.addressPostalCode || ''}<br />
              {formData.addressCountry || ''}
            </dd>
          </div>
          <div className={detailItemClass}>
            <dt className={dtClass}>Document Type</dt>
            <dd className={ddClass}>{formData.documentType || 'N/A'}</dd>
          </div>
          <div className={detailItemClass}>
            <dt className={dtClass}>Document ID Number</dt>
            <dd className={ddClass}>{formData.documentIdNumber || 'N/A'}</dd>
          </div>
          <div className={detailItemClass}>
            <dt className={dtClass}>Issuing Country</dt>
            <dd className={ddClass}>{formData.documentIssuingCountry || 'N/A'}</dd>
          </div>
          {formData.documentExpiryDate && (
            <div className={detailItemClass}>
              <dt className={dtClass}>Document Expiry Date</dt>
              <dd className={ddClass}>{formData.documentExpiryDate}</dd>
            </div>
          )}
          <div className={detailItemClass}>
            <dt className={dtClass}>Document Front</dt>
            <dd className={ddClass}>{formData.documentFrontFileId ? `Uploaded: ${formData.documentFrontFileId}` : 'Not Uploaded'}</dd>
          </div>
          {formData.documentBackFileId && (
             <div className={detailItemClass}>
              <dt className={dtClass}>Document Back</dt>
              <dd className={ddClass}>{`Uploaded: ${formData.documentBackFileId}`}</dd>
            </div>
          )}
        </dl>
      </div>
      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Back
        </button>
        <button type="button" onClick={onSubmit} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Submit KYC
        </button>
      </div>
    </div>
  );
}
