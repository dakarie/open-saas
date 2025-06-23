import { SUPPORTED_LANGUAGES, Language } from './constants';

interface LanguageSelectorProps {
  yourLanguage: string;
  theirLanguage: string;
  onYourLanguageChange: (languageCode: string) => void;
  onTheirLanguageChange: (languageCode: string) => void;
  disabled?: boolean;
}

export default function LanguageSelector({
  yourLanguage,
  theirLanguage,
  onYourLanguageChange,
  onTheirLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  const selectCommonClass = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white";

  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 my-6">
      <div>
        <label htmlFor="yourLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Your Language
        </label>
        <select
          id="yourLanguage"
          name="yourLanguage"
          value={yourLanguage}
          onChange={(e) => onYourLanguageChange(e.target.value)}
          className={selectCommonClass}
          disabled={disabled}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="theirLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Their Language
        </label>
        <select
          id="theirLanguage"
          name="theirLanguage"
          value={theirLanguage}
          onChange={(e) => onTheirLanguageChange(e.target.value)}
          className={selectCommonClass}
          disabled={disabled}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
