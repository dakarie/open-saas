import { useState, FormEvent } from 'react';
import { type KycFormData } from '../KycPage';

interface KycStep1Props {
  initialData: Partial<KycFormData>;
  onNext: (data: Partial<KycFormData>) => void;
}

export default function KycStep1_PersonalInfo({ initialData, onNext }: KycStep1Props) {
  const [fullName, setFullName] = useState(initialData.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData.dateOfBirth || '');
  const [addressStreet, setAddressStreet] = useState(initialData.addressStreet || '');
  const [addressCity, setAddressCity] = useState(initialData.addressCity || '');
  const [addressState, setAddressState] = useState(initialData.addressState || '');
  const [addressPostalCode, setAddressPostalCode] = useState(initialData.addressPostalCode || '');
  const [addressCountry, setAddressCountry] = useState(initialData.addressCountry || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Basic validation (can be expanded)
    if (!fullName || !dateOfBirth || !addressStreet || !addressCity || !addressCountry) {
      alert('Please fill in all required fields.');
      return;
    }
    onNext({
      fullName,
      dateOfBirth,
      addressStreet,
      addressCity,
      addressState,
      addressPostalCode,
      addressCountry,
    });
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="fullName" className={labelClass}>Full Name</label>
        <input type="text" name="fullName" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} required />
      </div>
      <div>
        <label htmlFor="dateOfBirth" className={labelClass}>Date of Birth</label>
        <input type="date" name="dateOfBirth" id="dateOfBirth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} required />
      </div>
      <div>
        <label htmlFor="addressStreet" className={labelClass}>Street Address</label>
        <input type="text" name="addressStreet" id="addressStreet" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} className={inputClass} required />
      </div>
      <div>
        <label htmlFor="addressCity" className={labelClass}>City</label>
        <input type="text" name="addressCity" id="addressCity" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} className={inputClass} required />
      </div>
      <div>
        <label htmlFor="addressState" className={labelClass}>State/Province (Optional)</label>
        <input type="text" name="addressState" id="addressState" value={addressState} onChange={(e) => setAddressState(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="addressPostalCode" className={labelClass}>Postal/Zip Code (Optional)</label>
        <input type="text" name="addressPostalCode" id="addressPostalCode" value={addressPostalCode} onChange={(e) => setAddressPostalCode(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="addressCountry" className={labelClass}>Country</label>
        <input type="text" name="addressCountry" id="addressCountry" value={addressCountry} onChange={(e) => setAddressCountry(e.target.value)} className={inputClass} required />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
          Next: Document Info
        </button>
      </div>
    </form>
  );
}
