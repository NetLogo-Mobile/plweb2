import vue from 'eslint-plugin-vue'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import vueEslintParser from 'vue-eslint-parser'

export default [
  {
    files: ['**/*.ts', '**/*.vue'],
    ignores: ['**/*.js'],
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: typescriptParser,
        projectService: true,
        extraFileExtensions: ['.vue'],
        ecmaVersion: 2020,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      vue: vue,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...vue.configs.recommended.rules,
      'no-console': ['off'],
      'no-debugger': ['error'],
      '@typescript-eslint/no-explicit-any': ['off'],
      'vue/no-v-html': ['off'],
      'no-implicit-globals': 'error',
      'max-params': ['warn', 6],
      'vue/order-in-components': 'error',
      'vue/no-mutating-props': 'error',
      'vue/require-prop-types': 'warn',
      'vue/no-ref-as-operand': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-useless-return': 'error',
      'no-template-curly-in-string': 'warn',
      'prefer-template': 'error',
      'no-useless-concat': 'error',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      'no-unused-expressions': 'error',
      '@typescript-eslint/no-inferrable-types': [
        'error',
        {
          ignoreParameters: true,
          ignoreProperties: true,
        },
      ],
      'no-return-await': 'error',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-case-declarations': 'error',
      'no-self-assign': ['error', { props: true }],
      'no-dupe-keys': 'error',
      'default-case-last': 'error',
      'no-sequences': 'error',
      'no-unmodified-loop-condition': 'warn',
      'no-useless-call': 'error',
      complexity: ['warn', 12],
      'max-depth': ['warn', 4],
      'max-lines-per-function': ['warn', 100],
      'max-nested-callbacks': ['warn', 3],
    },
  },
]
