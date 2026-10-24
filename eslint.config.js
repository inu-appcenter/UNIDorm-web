import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // packages/unidorm-bridge 는 unidorm-app 의 브릿지 계약을 그대로 복사한 것이라 린트하지 않는다.
  { ignores: ['dist', 'packages/unidorm-bridge'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['src/pages/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              importNames: ['default'],
              message:
                '화면/컴포넌트에서 axios를 직접 사용하지 마세요. 쓰기는 @/apis/*, 조회는 @/queries/* 를 사용하세요.',
            },
            {
              name: '@/apis/tokenInstance',
              message: '화면/컴포넌트에서 tokenInstance 직접 import 금지.',
            },
            {
              name: '@/apis/instance',
              message: '화면/컴포넌트에서 instance 직접 import 금지.',
            },
          ],
          patterns: [
            {
              group: ['@/apis/*', '!@/apis'],
              importNames: ['get*', 'fetch*', 'search*'],
              message:
                '서버 데이터 조회는 src/queries/* 의 useQuery 훅을 사용하세요. (컴포넌트 내 직접 조회 금지)',
            },
          ],
        },
      ],
    },
  },
)
