import { defineConfig } from 'oxlint';
import blankLines from 'oxlint-rules/config/blank-lines';

export default defineConfig({
    plugins: ['react', 'typescript', 'unicorn', 'oxc'],
    extends: [blankLines],
    categories: {
        correctness: 'error',
    },
    rules: {
        curly: ['warn', 'all'],
        'react/rules-of-hooks': 'error',
        'react/exhaustive-deps': 'warn',
        'react/jsx-no-target-blank': 'off',
        'react/no-unknown-property': 'off',
    },
    ignorePatterns: ['dist/**'],
});
