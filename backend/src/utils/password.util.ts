const COMMON_PASSWORDS = new Set([
    'password',
    '12345678',
    '12345679',
    'azertyulop',
    'azerty123',
    'final9999',
    'Password',
    'Azerty123',
    'motdepasse',
    '1234567890',
    'gazeuses',
    '12345678910',
    'football',
    'iloveyou',
    'realmadrid'
]);

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export const validatePasswordPolicy = (rawPassword: unknown): string | null => {
if (typeof rawPassword !== 'string') {
    return 'Password is required';
    }
    if (rawPassword !== rawPassword.trim()) {
    return 'Password cannot start or end with spaces';
    }
    const password = rawPassword;
    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`;
    }
    const normalized = password.toLowerCase();
    if (COMMON_PASSWORDS.has(normalized)) {
    return 'Password is too common';
    }
    // Keeps protection simple: avoid pure alphabetic words only.
    if (/^[a-zA-Z]+$/.test(password)) {
    return 'Password must include at least one number or symbol';
    }
    return null;
};
