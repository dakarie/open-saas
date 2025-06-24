import { useState, useEffect } from 'react';
import { useAuth } from 'wasp/client/auth';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { CgSpinner } from 'react-icons/cg';
import { cn } from '../client/cn';
import LanguageSelector from './LanguageSelector';
import { SUPPORTED_LANGUAGES } from './constants';
import { ArrowPathIcon } from '@heroicons/react/24/outline'; // For swap button icon

export default function DemoAppPage() {
  const { data: user, isLoading: isUserLoading } = useAuth();

  // Default to first language in the list or specific codes
  const [yourLanguage, setYourLanguage] = useState<string>(SUPPORTED_LANGUAGES[0]?.code || 'en');
  const [theirLanguage, setTheirLanguage] = useState<string>(SUPPORTED_LANGUAGES[1]?.code || 'es');
  const [isInterpreterBusy, setIsInterpreterBusy] = useState<boolean>(false); // Example state

  const kycStatus = user?.kycStatus as string | undefined; // Assuming kycStatus is on the user object

  const handleStartInterpretation = () => {
    // Placeholder for starting the interpretation logic
    console.log(`Starting interpretation: Your lang: ${yourLanguage}, Their lang: ${theirLanguage}`);
    setIsInterpreterBusy(true);
    // Simulate some activity
    setTimeout(() => setIsInterpreterBusy(false), 3000);
  };

  const handleSwapLanguages = () => {
    const currentYourLang = yourLanguage;
    setYourLanguage(theirLanguage);
    setTheirLanguage(currentYourLang);
  };

  // Ensure 'theirLanguage' is not the same as 'yourLanguage'
  useEffect(() => {
    if (yourLanguage === theirLanguage) {
      // Find the first language that is not 'yourLanguage' and set it as 'theirLanguage'
      const newTheirLanguageObj = SUPPORTED_LANGUAGES.find(lang => lang.code !== yourLanguage);
      if (newTheirLanguageObj) {
        setTheirLanguage(newTheirLanguageObj.code);
      } else if (SUPPORTED_LANGUAGES.length > 1) {
        // Fallback if somehow all languages are the same (should not happen with a diverse list)
        // Or if yourLanguage was the last in a list of 2 and they became same.
        // Try to find another language, or default to the first one if no other distinct language is found.
        const fallbackLangObj = SUPPORTED_LANGUAGES.find(lang => lang.code !== yourLanguage);
        if (fallbackLangObj) {
          setTheirLanguage(fallbackLangObj.code);
        } else if (SUPPORTED_LANGUAGES.length > 0) { // Ensure SUPPORTED_LANGUAGES is not empty
          setTheirLanguage(SUPPORTED_LANGUAGES[0].code);
        }
      }
    }
  }, [yourLanguage, theirLanguage, setTheirLanguage]);


  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        {/* AI Interpreter Section */}
        <div className='mx-auto max-w-4xl text-center mb-12'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white'>
            <span className='text-purple-500'>AI</span> Phone Call Interpreter
          </h2>
          <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white'>
            Select your language and the language of the other person on the call.
          </p>
        </div>

        <div className='mx-auto max-w-2xl mb-10 p-6 border rounded-3xl border-gray-900/10 dark:border-gray-100/10 shadow-lg'>
          {isUserLoading ? (
            <div className="flex justify-center items-center h-32">
              <CgSpinner className="animate-spin h-8 w-8 text-purple-500" />
            </div>
          ) : kycStatus === 'verified' ? (
            <>
              <div className="flex items-center justify-center space-x-2">
                <div className="flex-grow">
                  <LanguageSelector
                yourLanguage={yourLanguage}
                theirLanguage={theirLanguage}
                onYourLanguageChange={setYourLanguage}
                onTheirLanguageChange={setTheirLanguage}
                disabled={isInterpreterBusy}
              />
            </div>
            <button
              onClick={handleSwapLanguages}
              title="Swap languages"
              className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 disabled:opacity-50"
              disabled={isInterpreterBusy}
            >
              <ArrowPathIcon className="h-6 w-6" />
            </button>
          </div>
          <button
            onClick={handleStartInterpretation}
            disabled={isInterpreterBusy || !yourLanguage || !theirLanguage || yourLanguage === theirLanguage}
            className='mt-6 w-full flex items-center justify-center min-w-[7rem] font-medium text-white bg-purple-600 shadow-md ring-1 ring-inset ring-purple-700 py-2.5 px-4 rounded-md hover:bg-purple-700 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none disabled:opacity-70 disabled:cursor-not-allowed'
          >
            {isInterpreterBusy ? (
              <>
                <CgSpinner className='inline-block mr-2 animate-spin' />
                Processing...
              </>
            ) : (
              'Start Interpreted Call'
            )}
          </button>
          {yourLanguage === theirLanguage && SUPPORTED_LANGUAGES.length > 1 && (
            <p className="mt-2 text-sm text-red-600 text-center">
              Please select two different languages.
            </p>
          )}
            </>
          ) : (
            <div className="text-center py-6">
              {kycStatus === 'pending_review' ? (
                <p className="text-lg text-yellow-600 dark:text-yellow-400">
                  Your KYC information is currently under review. We'll notify you once it's processed.
                </p>
              ) : kycStatus === 'rejected' || kycStatus === 'resubmit_required' ? (
                <>
                  <p className="text-lg text-red-600 dark:text-red-400 mb-4">
                    There was an issue with your KYC verification. Please check your details and resubmit.
                  </p>
                  <WaspRouterLink
                    to={routes.KycRoute.to}
                    className="px-6 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Resubmit KYC Information
                  </WaspRouterLink>
                </>
              ) : ( // Covers null, undefined, 'none', or any other status
                <>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                    To use the AI Phone Call Interpreter, please complete your identity verification (KYC).
                  </p>
                  <WaspRouterLink
                    to={routes.KycRoute.to}
                    className="px-6 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Complete KYC Verification
                  </WaspRouterLink>
                </>
              )}
            </div>
          )}
        </div>

        {/* Removed AI Day Scheduler Section */}
      </div>
    </div>
  );
}
