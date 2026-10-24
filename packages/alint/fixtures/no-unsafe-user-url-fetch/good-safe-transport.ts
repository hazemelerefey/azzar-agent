import { ssrfSafeFetch } from '@azzar/ssrf-safe-fetch';

export const importSkill = async (input: { url: string }) => ssrfSafeFetch(input.url);
