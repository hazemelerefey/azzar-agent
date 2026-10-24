import { stylelint } from '@azzar/lint';

export default {
  ...stylelint,
  rules: {
    'selector-id-pattern': null,
    ...stylelint.rules,
  },
};
