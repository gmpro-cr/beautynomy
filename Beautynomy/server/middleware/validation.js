import Joi from 'joi';
import { VALIDATION_RULES } from '../config/constants.js';

/**
 * Validation Middleware using Joi
 * Provides input validation for all endpoints
 */

/**
 * Helper function to escape regex special characters
 */
export const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validation schemas
 */
export const schemas = {
  // Product search/query validation
  productQuery: Joi.object({
    query: Joi.string()
      .min(VALIDATION_RULES.SEARCH_QUERY_MIN_LENGTH)
      .max(VALIDATION_RULES.SEARCH_QUERY_MAX_LENGTH)
      .optional()
      .allow('', 'all'),
    category: Joi.string()
      .max(50)
      .optional()
      .allow('', 'All'),
    brand: Joi.string()
      .max(50)
      .optional()
      .allow('', 'All'),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
  }),

  // Scrape request validation
  scrapeProduct: Joi.object({
    productName: Joi.string()
      .min(VALIDATION_RULES.PRODUCT_NAME_MIN_LENGTH)
      .max(VALIDATION_RULES.PRODUCT_NAME_MAX_LENGTH)
      .pattern(VALIDATION_RULES.ALLOWED_PRODUCT_NAME_PATTERN)
      .required()
      .messages({
        'string.base': 'Product name must be a string',
        'string.empty': 'Product name cannot be empty',
        'string.min': `Product name must be at least ${VALIDATION_RULES.PRODUCT_NAME_MIN_LENGTH} characters`,
        'string.max': `Product name must not exceed ${VALIDATION_RULES.PRODUCT_NAME_MAX_LENGTH} characters`,
        'string.pattern.base': 'Product name contains invalid characters',
        'any.required': 'Product name is required'
      })
  }),

  // Batch scrape validation
  batchScrape: Joi.object({
    productNames: Joi.array()
      .items(
        Joi.string()
          .min(VALIDATION_RULES.PRODUCT_NAME_MIN_LENGTH)
          .max(VALIDATION_RULES.PRODUCT_NAME_MAX_LENGTH)
          .pattern(VALIDATION_RULES.ALLOWED_PRODUCT_NAME_PATTERN)
      )
      .min(1)
      .max(VALIDATION_RULES.MAX_PRODUCTS_PER_BATCH)
      .required()
      .messages({
        'array.base': 'Product names must be an array',
        'array.min': 'At least one product name is required',
        'array.max': `Maximum ${VALIDATION_RULES.MAX_PRODUCTS_PER_BATCH} products allowed per batch`,
        'any.required': 'Product names array is required'
      })
  }),

  // Cuelinks deeplink validation
  deeplink: Joi.object({
    url: Joi.string()
      .uri()
      .required()
      .messages({
        'string.uri': 'Invalid URL format',
        'any.required': 'URL is required'
      }),
    subId: Joi.string()
      .max(100)
      .optional()
      .allow('')
  }),

  // Product ID validation
  productId: Joi.object({
    productId: Joi.string()
      .required()
      .messages({
        'any.required': 'Product ID is required'
      })
  }),

  // Update prices validation
  updatePrices: Joi.object({
    productIds: Joi.array()
      .items(Joi.string())
      .optional()
      .default([])
  }),

  // Platform fetch validation
  platformFetch: Joi.object({
    query: Joi.string()
      .min(VALIDATION_RULES.SEARCH_QUERY_MIN_LENGTH)
      .max(VALIDATION_RULES.SEARCH_QUERY_MAX_LENGTH)
      .required(),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
  }),

  // Hybrid fetch validation
  hybridFetch: Joi.object({
    productName: Joi.string()
      .min(VALIDATION_RULES.PRODUCT_NAME_MIN_LENGTH)
      .max(VALIDATION_RULES.PRODUCT_NAME_MAX_LENGTH)
      .required(),
    useAPI: Joi.boolean().optional().default(true),
    useScraping: Joi.boolean().optional().default(false)
  })
};

/**
 * Middleware factory to validate request data
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors
        }
      });
    }

    // Replace request property with validated and sanitized value
    req[property] = value;
    next();
  };
};

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  // Remove any HTML tags
  str = str.replace(/<[^>]*>/g, '');

  // Remove any script tags and their content
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Trim whitespace
  str = str.trim();

  return str;
};

/**
 * Middleware to sanitize all request inputs
 */
export const sanitizeInputs = (req, res, next) => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  // Sanitize query
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }

  next();
};

export default {
  validate,
  schemas,
  escapeRegex,
  sanitizeString,
  sanitizeInputs
};
