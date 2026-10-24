# @azzar/web-crawler

AZZAR's built-in web crawling module. It extracts web content intelligently and converts it to Markdown.

## Introduction

`@azzar/web-crawler` crawls and processes web content for AZZAR. It extracts the valuable content from pages, filters out the noise, and produces structured Markdown text.

## Core features

- **Intelligent content extraction**: finds the main content with the Mozilla Readability algorithm
- **Multi-level crawling strategy**: multiple crawling implementations, including basic crawling, Jina, Search1API, and Browserless rendering
- **Custom URL rules**: per-website crawling logic through a flexible rule system

## Contribution

Web structures are diverse and complex. Contributions of crawling rules for specific websites are welcome.

### How to contribute URL rules

1. Add new rules to the [urlRules.ts](https://github.com/hazemelerefey/azzar-agent/blob/master/packages/azzar-web-crawler/src/urlRules.ts) file
2. Rule example:

```typescript
// Example: handling specific websites
const url = [
  // ... other URL matching rules
  {
    // URL matching pattern, supports regex
    urlPattern: 'https://example.com/articles/(.*)',

    // Optional: URL transformation, redirects to an easier-to-crawl version
    urlTransform: 'https://example.com/print/$1',

    // Optional: specify crawling implementation, supports 'naive', 'jina', 'search1api', and 'browserless'
    impls: ['naive', 'jina', 'search1api', 'browserless'],

    // Optional: content filtering configuration
    filterOptions: {
      // Whether to enable Readability algorithm for filtering distracting elements
      enableReadability: true,
      // Whether to convert to plain text
      pureText: false,
    },
  },
];
```

### Rule submission process

1. Clone the [AZZAR repository](https://github.com/hazemelerefey/azzar-agent)
2. Add or modify URL rules
3. Submit a pull request describing the target website's characteristics, the problems the rule solves, and test cases (example URLs)

## Note

This is an internal module of AZZAR (`"private": true`), built for AZZAR and not published as a standalone package.
