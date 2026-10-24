'use client';

import { defineFixtures, single, variants } from './_helpers';

export default defineFixtures({
  identifier: 'azzar-web-browsing',
  fixtures: {
    crawlMultiPages: single({
      args: {
        urls: ['https://hazemelerefy.tech', 'https://docs.hazemelerefy.tech'],
      },
      pluginState: {
        results: [
          {
            crawler: 'firecrawl',
            data: {
              content: 'AZZAR ships desktop and web experiences for AI collaboration.',
              description: 'Product homepage',
              title: 'AZZAR',
              url: 'https://hazemelerefy.tech',
            },
            originalUrl: 'https://hazemelerefy.tech',
          },
          {
            crawler: 'firecrawl',
            data: {
              content: 'Developer documentation for routing, tooling, and local testing.',
              description: 'Docs homepage',
              title: 'AZZAR Docs',
              url: 'https://docs.hazemelerefy.tech',
            },
            originalUrl: 'https://docs.hazemelerefy.tech',
          },
        ],
      },
    }),
    crawlSinglePage: single({
      args: { url: 'https://hazemelerefy.tech/blog' },
      pluginState: {
        results: [
          {
            crawler: 'firecrawl',
            data: {
              content: 'Recent product updates and engineering notes.',
              description: 'Blog landing page',
              title: 'AZZAR Blog',
              url: 'https://hazemelerefy.tech/blog',
            },
            originalUrl: 'https://hazemelerefy.tech/blog',
          },
        ],
      },
    }),
    search: variants([
      {
        args: {
          query: 'AZZAR devtools preview route',
          searchEngines: ['google', 'bing'],
        },
        label: 'With results',
        pluginState: {
          query: 'AZZAR devtools preview route',
          results: [
            {
              content: 'Documentation and implementation notes about local preview tooling.',
              engines: ['google'],
              title: 'Preview tooling guide',
              url: 'https://docs.example.com/preview-tooling',
            },
            {
              content: 'Issue thread describing the /devtools route rollout.',
              engines: ['bing'],
              title: 'Builtin render devtools issue',
              url: 'https://linear.example.com/issue/',
            },
          ],
        },
      },
      {
        args: {
          query: 'undocumented internal preview snapshot harness',
          searchEngines: ['google'],
        },
        label: 'No results',
        pluginState: {
          query: 'undocumented internal preview snapshot harness',
          results: [],
        },
      },
    ]),
  },
});
