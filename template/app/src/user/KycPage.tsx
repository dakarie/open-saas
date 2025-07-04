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

  const steps = ["Personal Details", "Document Details", "Document Upload", "Review & Submit"];

  const handleNextStep = (dataFromStep: Partial<KycFormData>) => {
    setFormData((prev) => ({ ...prev, ...dataFromStep }));
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1)); // Ensure step doesn't go below 1
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber);
    }
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
    <div className='py-10 lg:py-16 bg-slate-50 dark:bg-gray-900 min-h-screen'> {/* Added bg and min-h */}
      <div className='mx-auto max-w-2xl px-4 sm:px-6 lg:px-8'> {/* Adjusted max-w and px */}
        <div className='text-center mb-10'> {/* Added mb for spacing */}
          <h1 className='text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl'>
            Verify Your Identity
          </h1>
          <p className='mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300'>
            Please provide the following information to complete your identity verification.
          </p>
        </div>

        <div className='bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-10'> {/* Enhanced card style */}
          {/* Progress Bar */}
          <div className="mb-8">
            <ol className="flex items-center w-full">
              {steps.map((stepName, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                  <li
                    key={stepName}
                    className={`flex w-full items-center ${
                      stepNumber < steps.length ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-300 dark:after:border-gray-600 after:inline-block" : ""
                    } ${isCompleted ? "text-blue-600 dark:text-blue-500 after:border-blue-600 dark:after:border-blue-500" : ""} ${isActive ? "text-blue-600 dark:text-blue-500" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    <span
                      className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 ${
                        isActive ? "bg-blue-600 text-white dark:bg-blue-500" : isCompleted ? "bg-blue-600 text-white dark:bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                      } mr-2 sm:mr-4`}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                        </svg>
                      ) : (
                        <span className="text-sm sm:text-base">{stepNumber}</span>
                      )}
                    </span>
                    <span className={`text-xs sm:text-sm hidden md:inline-block ${isActive || isCompleted ? 'font-medium' : ''}`}>
                      {stepName}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
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
            <KycStep4_Review formData={formData} onSubmit={handleSubmitKyc} onBack={handlePrevStep} goToStep={goToStep} />
          )}

          {currentStep !== 4 && (
            <p className='mt-6 text-sm text-center text-gray-500 dark:text-gray-400'>
              Please complete all steps to submit your KYC information.
            </p>
          )}
        </div>
        <p className='mt-8 text-center text-xs text-gray-500 dark:text-gray-400'>
          We handle your information securely and with confidentiality.
        </p>
      </div>
    </div>
  );
}
