import { createHash } from 'crypto';

export class ValidationService {
  static validateUrl(url: string): { isValid: boolean; error?: string } {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required and must be a string' };
    }

    if (url.length > 2000) {
      return { isValid: false, error: 'URL is too long (max 2000 characters)' };
    }

    try {
      const urlObj = new URL(url);
      
      // Check for valid protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
      }

      // Check for known dating platforms
      const allowedDomains = [
        'tinder.com', 'bumble.com', 'hinge.co', 'match.com', 
        'eharmony.com', 'okcupid.com', 'pof.com', 'badoo.com',
        'zoosk.com', 'plenty', 'facebook.com', 'instagram.com',
        'linkedin.com', 'twitter.com'
      ];

      const isAllowedDomain = allowedDomains.some(domain => 
        urlObj.hostname.includes(domain)
      );

      if (!isAllowedDomain) {
        return { isValid: false, error: 'URL must be from a supported dating or social platform' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  static sanitizeText(text: string): string {
    if (typeof text !== 'string') return '';
    
    return text
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .substring(0, 10000); // Limit length
  }

  static validateInterests(interests: any): { isValid: boolean; error?: string; sanitized?: string[] } {
    if (!Array.isArray(interests)) {
      return { isValid: false, error: 'Interests must be an array' };
    }

    if (interests.length === 0) {
      return { isValid: false, error: 'At least one interest is required' };
    }

    if (interests.length > 20) {
      return { isValid: false, error: 'Too many interests (max 20)' };
    }

    const sanitizedInterests = interests
      .filter(interest => typeof interest === 'string' && interest.trim().length > 0)
      .map(interest => this.sanitizeText(interest))
      .filter(interest => interest.length > 0 && interest.length <= 100)
      .slice(0, 20);

    if (sanitizedInterests.length === 0) {
      return { isValid: false, error: 'No valid interests provided' };
    }

    return { isValid: true, sanitized: sanitizedInterests };
  }

  static createHash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  static validateFileUpload(file: any): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File must be JPEG, PNG, WebP, or GIF' };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }

    return { isValid: true };
  }

  static rateLimitKey(identifier: string, endpoint: string): string {
    return `rate_limit:${identifier}:${endpoint}`;
  }
}
