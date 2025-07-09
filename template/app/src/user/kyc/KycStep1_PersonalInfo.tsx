import { useState, FormEvent, ChangeEvent } from 'react';
import { type KycFormData } from '../KycPage';

interface KycStep1Props {
  initialData: Partial<KycFormData>;
  onNext: (data: Partial<KycFormData>) => void;
}

type Step1Errors = {
  fullName?: string;
  dateOfBirth?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  general?: string;
};

export default function KycStep1_PersonalInfo({ initialData, onNext }: KycStep1Props) {
  const [fullName, setFullName] = useState(initialData.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData.dateOfBirth || '');
  const [addressStreet, setAddressStreet] = useState(initialData.addressStreet || '');
  const [addressCity, setAddressCity] = useState(initialData.addressCity || '');
  const [addressState, setAddressState] = useState(initialData.addressState || '');
  const [addressPostalCode, setAddressPostalCode] = useState(initialData.addressPostalCode || '');
  const [addressCountry, setAddressCountry] = useState(initialData.addressCountry || '');
  const [errors, setErrors] = useState<Step1Errors>({});

  const validate = (): boolean => {
    const newErrors: Step1Errors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required.';
    // Basic validation for date format (YYYY-MM-DD) and reasonable year
    else {
        const year = parseInt(dateOfBirth.substring(0,4), 10);
        if (year < 1900 || year > new Date().getFullYear()) {
            newErrors.dateOfBirth = 'Please enter a valid year.';
        }
    }
    if (!addressStreet.trim()) newErrors.addressStreet = 'Street address is required.';
    if (!addressCity.trim()) newErrors.addressCity = 'City is required.';
    if (!addressCountry.trim()) newErrors.addressCountry = 'Country is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({
        fullName,
        dateOfBirth,
        addressStreet,
        addressCity,
        addressState,
        addressPostalCode,
        addressCountry,
      });
    } else {
      // Optional: set a general error if you want a summary message too
      // setErrors(prev => ({...prev, general: "Please correct the errors above."}))
    }
  };

  const handleInputChange = (setter: (value: string) => void, fieldName: keyof Step1Errors) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };


  const inputClass = (fieldName: keyof Step1Errors) =>
    `mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border ${errors[fieldName] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm`;

  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const errorTextClass = "mt-1 text-xs text-red-500 dark:text-red-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4"> {/* Adjusted space-y for tighter packing with error messages */}
      {errors.general && <p className={errorTextClass}>{errors.general}</p>}
      <div>
        <label htmlFor="fullName" className={labelClass}>Full Name <span className="text-red-500">*</span></label>
        <input type="text" name="fullName" id="fullName" value={fullName} onChange={handleInputChange(setFullName, 'fullName')} className={inputClass('fullName')} required />
        {errors.fullName && <p className={errorTextClass}>{errors.fullName}</p>}
      </div>
      <div>
        <label htmlFor="dateOfBirth" className={labelClass}>Date of Birth <span className="text-red-500">*</span></label>
        <input type="date" name="dateOfBirth" id="dateOfBirth" value={dateOfBirth} onChange={handleInputChange(setDateOfBirth, 'dateOfBirth')} className={inputClass('dateOfBirth')} required />
        {errors.dateOfBirth && <p className={errorTextClass}>{errors.dateOfBirth}</p>}
      </div>
      <div>
        <label htmlFor="addressStreet" className={labelClass}>Street Address <span className="text-red-500">*</span></label>
        <input type="text" name="addressStreet" id="addressStreet" value={addressStreet} onChange={handleInputChange(setAddressStreet, 'addressStreet')} className={inputClass('addressStreet')} required />
        {errors.addressStreet && <p className={errorTextClass}>{errors.addressStreet}</p>}
      </div>
      <div>
        <label htmlFor="addressCity" className={labelClass}>City <span className="text-red-500">*</span></label>
        <input type="text" name="addressCity" id="addressCity" value={addressCity} onChange={handleInputChange(setAddressCity, 'addressCity')} className={inputClass('addressCity')} required />
        {errors.addressCity && <p className={errorTextClass}>{errors.addressCity}</p>}
      </div>
      <div>
        <label htmlFor="addressState" className={labelClass}>State/Province (Optional)</label>
        <input type="text" name="addressState" id="addressState" value={addressState} onChange={handleInputChange(setAddressState, 'addressState')} className={inputClass('addressState')} />
      </div>
      <div>
        <label htmlFor="addressPostalCode" className={labelClass}>Postal/Zip Code (Optional)</label>
        <input type="text" name="addressPostalCode" id="addressPostalCode" value={addressPostalCode} onChange={handleInputChange(setAddressPostalCode, 'addressPostalCode')} className={inputClass('addressPostalCode')} />
      </div>
      <div>
        <label htmlFor="addressCountry" className={labelClass}>Country <span className="text-red-500">*</span></label>
        <input type="text" name="addressCountry" id="addressCountry" value={addressCountry} onChange={handleInputChange(setAddressCountry, 'addressCountry')} className={inputClass('addressCountry')} required />
        {errors.addressCountry && <p className={errorTextClass}>{errors.addressCountry}</p>}
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Next: Document Details
        </button>
      </div>
    </form>
  );
}
