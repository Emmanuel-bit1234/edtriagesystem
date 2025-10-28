import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Popular country codes with flags (using emoji flags) and ISO country codes
const countryCodes = [
    { name: 'South Africa', code: '+27', flag: '🇿🇦', value: '+27', iso: 'ZA', maxLength: 9 },
    { name: 'Lesotho', code: '+266', flag: '🇱🇸', value: '+266', iso: 'LS', maxLength: 8 },
    { name: 'United States', code: '+1', flag: '🇺🇸', value: '+1', iso: 'US', maxLength: 10 },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧', value: '+44', iso: 'GB', maxLength: 10 },
    { name: 'Nigeria', code: '+234', flag: '🇳🇬', value: '+234', iso: 'NG', maxLength: 10 },
    { name: 'Kenya', code: '+254', flag: '🇰🇪', value: '+254', iso: 'KE', maxLength: 9 },
    { name: 'Ghana', code: '+233', flag: '🇬🇭', value: '+233', iso: 'GH', maxLength: 9 },
    { name: 'Botswana', code: '+267', flag: '🇧🇼', value: '+267', iso: 'BW', maxLength: 8 },
    { name: 'Swaziland', code: '+268', flag: '🇸🇿', value: '+268', iso: 'SZ', maxLength: 8 },
    { name: 'Zimbabwe', code: '+263', flag: '🇿🇼', value: '+263', iso: 'ZW', maxLength: 9 },
    { name: 'Zambia', code: '+260', flag: '🇿🇲', value: '+260', iso: 'ZM', maxLength: 9 },
    { name: 'Mozambique', code: '+258', flag: '🇲🇿', value: '+258', iso: 'MZ', maxLength: 9 },
    { name: 'Malawi', code: '+265', flag: '🇲🇼', value: '+265', iso: 'MW', maxLength: 9 },
    { name: 'Tanzania', code: '+255', flag: '🇹🇿', value: '+255', iso: 'TZ', maxLength: 9 },
    { name: 'Uganda', code: '+256', flag: '🇺🇬', value: '+256', iso: 'UG', maxLength: 9 },
    { name: 'Rwanda', code: '+250', flag: '🇷🇼', value: '+250', iso: 'RW', maxLength: 9 },
    { name: 'Ethiopia', code: '+251', flag: '🇪🇹', value: '+251', iso: 'ET', maxLength: 10 },
    { name: 'Egypt', code: '+20', flag: '🇪🇬', value: '+20', iso: 'EG', maxLength: 10 },
    { name: 'India', code: '+91', flag: '🇮🇳', value: '+91', iso: 'IN', maxLength: 10 },
    { name: 'China', code: '+86', flag: '🇨🇳', value: '+86', iso: 'CN', maxLength: 11 },
    { name: 'Australia', code: '+61', flag: '🇦🇺', value: '+61', iso: 'AU', maxLength: 9 },
    { name: 'Canada', code: '+1', flag: '🇨🇦', value: '+1', iso: 'CA', maxLength: 10 },
    { name: 'Germany', code: '+49', flag: '🇩🇪', value: '+49', iso: 'DE', maxLength: 11 },
    { name: 'France', code: '+33', flag: '🇫🇷', value: '+33', iso: 'FR', maxLength: 9 },
    { name: 'Spain', code: '+34', flag: '🇪🇸', value: '+34', iso: 'ES', maxLength: 9 },
    { name: 'Italy', code: '+39', flag: '🇮🇹', value: '+39', iso: 'IT', maxLength: 10 },
    { name: 'Brazil', code: '+55', flag: '🇧🇷', value: '+55', iso: 'BR', maxLength: 11 },
    { name: 'Mexico', code: '+52', flag: '🇲🇽', value: '+52', iso: 'MX', maxLength: 10 },
    { name: 'Argentina', code: '+54', flag: '🇦🇷', value: '+54', iso: 'AR', maxLength: 10 },
    { name: 'Turkey', code: '+90', flag: '🇹🇷', value: '+90', iso: 'TR', maxLength: 10 },
];

export default function PhoneInput({
    label = "",
    value = "",
    countryCode = "+27", // Default to South Africa
    onChange = null,
    onCountryCodeChange = null,
    disabled = false,
    className = "",
    showValidation = false // Option to show validation feedback
}) {
    // Internal state for selected country
    const [selectedCountry, setSelectedCountry] = useState(() => {
        return countryCodes.find(c => c.value === countryCode) || countryCodes[0];
    });

    // Update selected country when countryCode prop changes
    useEffect(() => {
        const country = countryCodes.find(c => c.value === countryCode) || countryCodes[0];
        setSelectedCountry(country);
    }, [countryCode]);

    // Validate phone number based on selected country
    const validatePhoneNumber = (phoneNumber) => {
        if (!phoneNumber || phoneNumber.trim() === '') return true; // Empty is allowed
        if (!selectedCountry) return true;
        
        try {
            const countryISO = selectedCountry.iso;
            const fullNumber = `${selectedCountry.value}${phoneNumber}`;
            const parsed = parsePhoneNumberFromString(fullNumber, countryISO);
            return parsed ? parsed.isValid() : false;
        } catch (error) {
            return false;
        }
    };

    // Get the max length for the current country
    const maxLength = selectedCountry?.maxLength || 15; // Default to 15 if not specified
    
    // Validate current value
    const isValid = showValidation ? validatePhoneNumber(value) : true;

    // Handle phone number change - only allow digits, with dynamic max length
    const handlePhoneChange = (e) => {
        if (!onChange) return;
        let raw = e.target.value;
        // Remove all non-digit characters
        const digits = raw.replace(/\D/g, "");
        // Limit to maxLength for current country
        const limited = digits.slice(0, maxLength);
        onChange({ ...e, target: { ...e.target, value: limited } });
    };

    // Handle country code change
    const handleCountryCodeChange = (e) => {
        const newCountry = e.value;
        setSelectedCountry(newCountry);
        if (onCountryCodeChange) {
            // Check if newCountry is a string or an object
            const countryCodeString = typeof newCountry === 'string' ? newCountry : (newCountry?.value || newCountry?.code || '+27');
            onCountryCodeChange({ value: countryCodeString });
        }
    };

    return (
        <div className={`field ${className}`}>
            {label && (
                <label htmlFor="phoneNumber" style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold'
                }}>
                    {label}
                </label>
            )}
            <div 
                className="flex align-items-center" 
                style={{ 
                    border: `1px solid ${showValidation && !isValid ? '#dc3545' : '#ced4da'}`,
                    borderRadius: '6px',
                    backgroundColor: disabled ? '#f0f0f0' : '#fff',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s'
                }}
            >
                {/* Country Code Dropdown */}
                <div style={{ 
                    width: 'auto',
                    minWidth: '80px',
                    backgroundColor: '#f8f9fa',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 8px',
                    borderRight: '1px solid #ced4da'
                }}>
                    <Dropdown
                        value={selectedCountry}
                        options={countryCodes}
                        onChange={handleCountryCodeChange}
                        optionLabel="name"
                        dataKey="value"
                        placeholder="Select country"
                        disabled={disabled}
                        className="w-full"
                        panelClassName="country-dropdown-panel"
                        filter
                        filterBy="name,code"
                        filterPlaceholder="Search countries..."
                        valueTemplate={(option) => {
                            // Check if option exists, otherwise use selectedCountry from state
                            const displayOption = option || selectedCountry;
                            if (!displayOption) return <span>🇿🇦 +27</span>;
                            return (
                                <div className="flex align-items-center">
                                    <span style={{ fontSize: '1.2rem', marginRight: '4px' }}>{displayOption.flag || '🇿🇦'}</span>
                                    <span>{displayOption.code || '+27'}</span>
                                </div>
                            );
                        }}
                        itemTemplate={(option) => (
                            <div className="flex align-items-center">
                                <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>{option.flag}</span>
                                <span>{option.name}</span>
                            </div>
                        )}
                        style={{ 
                            border: 'none',
                            backgroundColor: 'transparent'
                        }}
                    />
                </div>

                {/* Phone Number Input */}
                <InputText
                    id="phoneNumber"
                    placeholder="Phone number"
                    value={value}
                    onChange={handlePhoneChange}
                    disabled={disabled}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={maxLength}
                    className="w-full"
                    style={{ 
                        border: 'none',
                        backgroundColor: 'transparent',
                        height: '100%',
                        flex: 1,
                        paddingLeft: '8px'
                    }}
                />
            </div>
            {showValidation && !isValid && value && (
                <small className="p-error" style={{ display: 'block', marginTop: '0.5rem' }}>
                    Please enter a valid phone number for {selectedCountry?.name || 'the selected country'}
                </small>
            )}
            <style jsx>{`
                :global(.country-dropdown-panel) {
                    width: auto !important;
                    min-width: 250px;
                }
                :global(.p-dropdown:not(.p-disabled):hover) {
                    border-color: #ced4da !important;
                }
                :global(.p-dropdown:not(.p-disabled).p-focus) {
                    border-color: #ced4da !important;
                    box-shadow: none !important;
                }
                :global(.p-inputtext:enabled:focus) {
                    box-shadow: none !important;
                }
            `}</style>
        </div>
    );
}
