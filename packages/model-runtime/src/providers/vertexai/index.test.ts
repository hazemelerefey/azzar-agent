// @vitest-environment node
import { GoogleGenAI } from '@google/genai';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType } from '../../types/error';
import { AzzarGoogleAI } from '../google';
import { AzzarVertexAI } from './index';

// Mock dependencies
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(function (options: { location?: string }) {
    if (options.location === 'error-location') {
      const error = new Error('Illegal argument');
      error.name = 'IllegalArgumentError';
      throw error;
    }
    return {
      generateContent: vi.fn(),
    };
  }),
}));

vi.mock('../google', () => ({
  AzzarGoogleAI: vi.fn(function () {
    return {
      chat: vi.fn(),
      models: vi.fn(),
    };
  }),
}));

describe('AzzarVertexAI', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initFromVertexAI', () => {
    it('should create AzzarVertexAI instance with default location', () => {
      const instance = AzzarVertexAI.initFromVertexAI();
      expect(instance).toBeDefined();
    });

    it('should create AzzarVertexAI instance with custom location', () => {
      const instance = AzzarVertexAI.initFromVertexAI({
        location: 'us-central1',
        project: 'test-project',
      });
      expect(instance).toBeDefined();
    });

    it('should pass modelIdMapping to AzzarGoogleAI without passing it to GoogleGenAI', () => {
      AzzarVertexAI.initFromVertexAI({
        location: 'us-central1',
        modelIdMapping: { 'logical-gemini': 'vertex-upstream' },
        project: 'test-project',
      });

      const googleGenAIOptions = vi.mocked(GoogleGenAI).mock.calls.at(-1)?.[0] as any;
      const azzarGoogleAIOptions = vi.mocked(AzzarGoogleAI).mock.calls.at(-1)?.[0] as any;

      expect(googleGenAIOptions.modelIdMapping).toBeUndefined();
      expect(azzarGoogleAIOptions).toMatchObject({
        isVertexAi: true,
        modelIdMapping: { 'logical-gemini': 'vertex-upstream' },
      });
    });

    it('should throw InvalidVertexCredentials error when IllegalArgumentError occurs', () => {
      try {
        AzzarVertexAI.initFromVertexAI({
          location: 'error-location',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.errorType).toBe(AgentRuntimeErrorType.InvalidVertexCredentials);
      }
    });
  });
});
