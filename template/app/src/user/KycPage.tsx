import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct import for useNavigate
import { routes } from 'wasp/client/router'; // Keep for route definitions
import { submitKycInfo } from 'wasp/client/operations';
import KycStep1_PersonalInfo from './kyc/KycStep1_PersonalInfo';
import KycStep2_DocumentInfo from './kyc/KycStep2_DocumentInfo';
import KycStep3_DocumentUpload from './kyc/KycStep3_DocumentUpload';
import KycStep4_Review from './kyc/KycStep4_Review';

export type KycFormData = {
  // Personal Info
  fullName?: string;
  dateOfBirth?: string; // Store as ISO string e.g. YYYY-MM-DD
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  // Document Info
  documentType?: string;
  documentIdNumber?: string;
  documentIssuingCountry?: string;
  documentExpiryDate?: string; // Store as ISO string e.g. YYYY-MM-DD
  // Files will be handled separately, perhaps by storing their IDs or keys
  documentFrontFileId?: string;
  documentBackFileId?: string;
};

export default function KycPage() {
  const navigate = useNavigate(); // Use the imported useNavigate
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<KycFormData>({});

  const handleNextStep = (dataFromStep: Partial<KycFormData>) => {
    setFormData((prev) => ({ ...prev, ...dataFromStep }));
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmitKyc = async () => {
    try {
      // Ensure all required fields are present, especially file IDs
      if (!formData.fullName || !formData.dateOfBirth || !formData.addressStreet || !formData.addressCity || !formData.addressCountry ||
          !formData.documentType || !formData.documentIdNumber || !formData.documentIssuingCountry || !formData.documentFrontFileId) {
        alert('Critical information is missing. Please review all steps.');
        return;
      }

      const payload = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        addressStreet: formData.addressStreet,
        addressCity: formData.addressCity,
        addressState: formData.addressState || '',
        addressPostalCode: formData.addressPostalCode || '',
        addressCountry: formData.addressCountry,
        documentType: formData.documentType,
        documentIdNumber: formData.documentIdNumber,
        documentIssuingCountry: formData.documentIssuingCountry,
        documentExpiryDate: formData.documentExpiryDate || undefined,
        documentFrontFileId: formData.documentFrontFileId,
        documentBackFileId: formData.documentBackFileId || undefined,
      };

      await submitKycInfo(payload);
      alert('KYC information submitted successfully! You will be redirected.');
      navigate(routes.DemoAppRoute.to); // Use navigate
    } catch (error: any) {
      console.error('Error submitting KYC info:', error);
      alert('Error submitting KYC information: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-3xl px-6 lg:px-8'>
        <div className='mx-auto text-center'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white'>
            Verify Your Identity (KYC)
          </h2>
          <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white'>
            Please provide the following information to complete your identity verification.
          </p>
        </div>

        <div className='my-8 border rounded-3xl border-gray-900/10 dark:border-gray-100/10 p-6 sm:p-10'>
          {/* Progress Bar (Optional but Recommended) */}
          {/* <div>Step {currentStep} of 4</div> */}

          {currentStep === 1 && (
            <KycStep1_PersonalInfo initialData={formData} onNext={handleNextStep} />
          )}
          {currentStep === 2 && (
            <KycStep2_DocumentInfo initialData={formData} onNext={handleNextStep} onBack={handlePrevStep} />
          )}
          {currentStep === 3 && (
            <KycStep3_DocumentUpload initialData={formData} onNext={handleNextStep} onBack={handlePrevStep} />
          )}
          {currentStep === 4 && (
            <KycStep4_Review formData={formData} onSubmit={handleSubmitKyc} onBack={handlePrevStep} />
          )}

          {/* The navigation is now handled within each step component */}
          {/* Example: Final submit button is in KycStep4_Review */}
          {/* Back buttons are in steps 2, 3, 4 */}
          {/* Next buttons are in steps 1, 2, 3 */}

          {/* Message if trying to submit too early (handled by disabling submit in Step 4 or here if needed) */}
          {currentStep !== 4 && (
            <p className='mt-4 text-sm text-center text-gray-500 dark:text-gray-400'>
              Please complete all steps to submit your KYC information.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
