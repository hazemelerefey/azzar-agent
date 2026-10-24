import '@azzar/ui/theme.css';
import '@azzar/ui/global.css';
import '@azzar/ui/style.css';

import { Amp, ClaudeCode, Codex, HermesAgent, OpenClaw, OpenCode } from '@azzar/icons';
import * as ui from '@azzar/ui';
import * as lucide from 'lucide-react';
import * as motionReact from 'motion/react';
import * as motionReactM from 'motion/react-m';
import * as react from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import * as reactDom from 'react-dom';
import * as reactDomClient from 'react-dom/client';

export default {
  '@azzar/icons': { Amp, ClaudeCode, Codex, HermesAgent, OpenClaw, OpenCode },
  '@azzar/ui': ui,
  'lucide-react': lucide,
  'motion/react': motionReact,
  'motion/react-m': motionReactM,
  'react': react,
  'react-dom': reactDom,
  'react-dom/client': reactDomClient,
  'react/jsx-runtime': jsxRuntime,
};
