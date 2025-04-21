import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to count characters in a string
const countCharacters = (text) => {
  if (!text) return 0;
  return text.length;
};

class LMStudioService {
  constructor(baseUrl = process.env.LM_STUDIO_API_URL || 'http://localhost:1234/v1') {
    this.baseUrl = baseUrl;
    logger.info(`LM Studio Service initialized with base URL: ${this.baseUrl}`);
  }

  /**
   * Get available models from LM Studio
   * @returns {Promise<Array>} List of available models
   */
  async getModels() {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}/models`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      
      const data = await response.json();
      const processingTime = Date.now() - startTime;
      
      logger.info(`Retrieved models from LM Studio in ${processingTime}ms`);
      return data;
    } catch (error) {
      logger.error(`Error fetching models from LM Studio: ${error.message}`);
      throw error;
    }
  }

  /**
   * Estimate token count for a message based on character count
   * @param {string} text - Text to estimate tokens for
   * @returns {Object} Character count as a proxy for tokens
   */
  estimateTokens(text) {
    const charCount = countCharacters(text);
    return {
      prompt: charCount,
      completion: 0,
      total: charCount
    };
  }

  /**
   * Generate a completion using LM Studio
   * @param {Object} options - Options for the completion
   * @param {string} options.model - Model to use
   * @param {Array} options.messages - Messages to generate from
   * @param {number} options.temperature - Temperature for generation
   * @param {number} options.max_tokens - Maximum tokens to generate
   * @returns {Promise<Object>} Generated completion with metadata
   */
  async generateCompletion(options) {
    try {
      const startTime = Date.now();
      
      const defaultOptions = {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      };
      
      const requestOptions = { ...defaultOptions, ...options };
      
      logger.debug(`Sending completion request to LM Studio: ${JSON.stringify(requestOptions)}`);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestOptions)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LM Studio API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      const processingTime = Date.now() - startTime;
      
      // Calculate token usage
      const promptTokens = data.usage?.prompt_tokens || 0;
      const completionTokens = data.usage?.completion_tokens || 0;
      const totalTokens = data.usage?.total_tokens || 0;
      
      logger.info(`Generated completion in ${processingTime}ms. Tokens used: ${totalTokens}`);
      
      return {
        ...data,
        metadata: {
          processingTime,
          tokensUsed: {
            prompt: promptTokens,
            completion: completionTokens,
            total: totalTokens
          }
        }
      };
    } catch (error) {
      logger.error(`Error generating completion: ${error.message}`);
      throw error;
    }
  }
}

export default new LMStudioService();
