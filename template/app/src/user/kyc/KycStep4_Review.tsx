import { type KycFormData } from '../KycPage';

interface KycStep4Props {
  formData: KycFormData;
  onSubmit: () => void;
  onBack: () => void; // This will now be used as "Back to Step 3 (Uploads)"
  goToStep: (stepNumber: number) => void;
}

// Helper component for a review section with an Edit button
const ReviewSection = ({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void; }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-3">
      <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">{title}</h4>
      <button
        type="button"
        onClick={onEdit}
        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 font-medium"
      >
        Edit
      </button>
    </div>
    <dl className="space-y-2 sm:space-y-0 sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
      {children}
    </dl>
  </div>
);


export default function KycStep4_Review({ formData, onSubmit, onBack, goToStep }: KycStep4Props) {
  const detailItemClass = "py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"; // Adjusted padding
  const dtClass = "text-sm font-medium text-gray-500 dark:text-gray-400";
  const ddClass = "mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2 break-words";

  return (
    <div className="space-y-8"> {/* Increased overall spacing */}
      <div>
        <h3 className="text-xl leading-6 font-semibold text-gray-900 dark:text-white">Review Your Information</h3>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">Please ensure all details are correct before submitting.</p>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">

        <ReviewSection title="Personal Details" onEdit={() => goToStep(1)}>
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
              {formData.addressStreet || 'N/A'}<br />
              {formData.addressCity || 'N/A'}, {formData.addressState || 'N/A'} {formData.addressPostalCode || ''}<br />
              {formData.addressCountry || 'N/A'}
            </dd>
          </div>
        </ReviewSection>

        <ReviewSection title="Document Details" onEdit={() => goToStep(2)}>
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
        </ReviewSection>

        <ReviewSection title="Uploaded Document IDs" onEdit={() => goToStep(3)}>
          <div className={detailItemClass}>
            <dt className={dtClass}>Document Front ID</dt>
            <dd className={ddClass}>{formData.documentFrontFileId ? `${formData.documentFrontFileId.substring(0,30)}...` : 'Not Uploaded'}</dd>
          </div>
          {formData.documentBackFileId && (
             <div className={detailItemClass}>
              <dt className={dtClass}>Document Back ID</dt>
              <dd className={ddClass}>{`${formData.documentBackFileId.substring(0,30)}...`}</dd>
            </div>
          )}
           {!formData.documentFrontFileId && !formData.documentBackFileId && (
            <div className={detailItemClass}>
              <dt className={dtClass}>Documents</dt>
              <dd className={ddClass}>No documents uploaded yet.</dd>
            </div>
           )}
        </ReviewSection>
      </div>

      <div className="flex justify-between pt-4">
        {/* The onBack prop now specifically means "go to previous step in sequence", which is step 3 */}
        <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Back to Uploads
        </button>
        <button type="button" onClick={onSubmit} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Confirm and Submit
        </button>
      </div>
    </div>
  );
}
