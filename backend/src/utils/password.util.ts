import { zxcvbnAsync, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'

zxcvbnOptions.setOptions({
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
})

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const MIN_ZXCVBN_SCORE = 2;

export const validatePasswordPolicy = async (rawPassword: unknown): Promise<string | null> => {
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
    const result = await zxcvbnAsync(password);
    if (result.score < MIN_ZXCVBN_SCORE) {
        return 'Password is too weak. Try a longer or less common password.';
    }
    return null;
};
