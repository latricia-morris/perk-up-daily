export const COUNTRY_OPTIONS = [
  { code: 'US', flag: '🇺🇸', name: 'United States', dial: '1' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', dial: '1' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', dial: '44' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia', dial: '61' },
  { code: 'NZ', flag: '🇳🇿', name: 'New Zealand', dial: '64' },
  { code: 'IE', flag: '🇮🇪', name: 'Ireland', dial: '353' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa', dial: '27' },
  { code: 'MX', flag: '🇲🇽', name: 'Mexico', dial: '52' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil', dial: '55' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany', dial: '49' },
  { code: 'FR', flag: '🇫🇷', name: 'France', dial: '33' },
  { code: 'IT', flag: '🇮🇹', name: 'Italy', dial: '39' },
  { code: 'ES', flag: '🇪🇸', name: 'Spain', dial: '34' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands', dial: '31' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore', dial: '65' },
  { code: 'HK', flag: '🇭🇰', name: 'Hong Kong', dial: '852' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan', dial: '81' },
  { code: 'KR', flag: '🇰🇷', name: 'South Korea', dial: '82' },
  { code: 'IN', flag: '🇮🇳', name: 'India', dial: '91' },
  { code: 'AE', flag: '🇦🇪', name: 'United Arab Emirates', dial: '971' },
];

export function getDialCode(countryCode) {
  const country = COUNTRY_OPTIONS.find(c => c.code === countryCode);
  return country ? country.dial : '1';
}

export function formatFullNumber(phone, countryCode) {
  const dial = getDialCode(countryCode);
  const digits = String(phone || '').replace(/\D/g, '');
  return `+${dial}${digits}`;
}