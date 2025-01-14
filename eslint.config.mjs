import globals from 'globals';
import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Глобальные переменные для браузера
  {
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest', // Использование последней версии ECMAScript
      sourceType: 'module', // Модульный код
    },
  },
  // Базовые рекомендации ESLint
  pluginJs.configs.recommended,
  // Конфигурация Prettier
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error', // Генерация ошибок, если код не соответствует Prettier
    },
  },
  // Правила хорошей практики
  {
    rules: {
      eqeqeq: ['error', 'always'], // Всегда использовать === и !== вместо == и !=
      curly: ['error', 'all'], // Требовать использования {} даже для однострочных блоков
      'no-console': 'warn', // Предупреждение при использовании console.log
      'prefer-const': 'error', // Предпочитать const, если переменная не изменяется
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Игнорировать аргументы, начинающиеся с "_"
      'no-multi-spaces': 'error', // Запрет на множественные пробелы
      'array-callback-return': 'error', // Убедиться, что callback в методах массива возвращает значение
      'no-else-return': 'error', // Запрет на else после return
    },
  },
  // Интеграция с Prettier для отключения конфликтующих правил
  prettierConfig,
];
