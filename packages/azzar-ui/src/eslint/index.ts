import { noBaseUiSubpath } from './noBaseUiSubpath';
import { noInlineFormSchema } from './noInlineFormSchema';

export const restrictedImports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            message: 'Use `Spin variant="network"` from "@azzar/ui" instead.',
            name: 'thinking-orbs',
          },
        ],
      },
    ],
  },
};

const plugin = {
  rules: {
    'no-base-ui-subpath': noBaseUiSubpath,
    'no-inline-form-schema': noInlineFormSchema,
  },
};

export const subpathRules = {
  plugins: { '@azzar/ui': plugin },
  rules: {
    '@azzar/ui/no-base-ui-subpath': 'error',
  },
};

export const formSchemaRules = {
  plugins: { '@azzar/ui': plugin },
  rules: {
    '@azzar/ui/no-inline-form-schema': 'warn',
  },
};

export default [restrictedImports, subpathRules, formSchemaRules];
