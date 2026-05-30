import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/integrations/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/warehouse/**', '**/@supabase/**'],
              message:
                'integrations must not import warehouse or Supabase — use warehouse/resolvers instead.',
            },
          ],
        },
      ],
    },
  },
);
