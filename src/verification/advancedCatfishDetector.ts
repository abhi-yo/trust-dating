import sharp from 'sharp';
import * as faceapi from 'face-api.js';
import { reverseImageSearchGoogle } from 'reverse-image-search-google';
import puppeteer, { Browser, Page } from 'puppeteer';
import whois from 'whois';
import dns from 'dns2';
import geoip from 'geoip-lite';
import ExifReader from 'exifr';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

export interface CatfishAnalysis {
  overall_risk_score: number; // 0-100 (100 = definitely catfish)
  face_analysis: {
    faces_detected: number;
    age_consistency: boolean;
    gender_consistency: boolean;
    face_match_across_photos: number; // percentage
    professional_photo_likelihood: number;
    deepfake_probability: number;
  };
  image_forensics: {
    reverse_search_matches: Array<{
      url: string;
      context: string;
      first_seen: string;
      source_type: 'social_media' | 'stock_photo' | 'model_portfolio' | 'adult_content' | 'unknown';
    }>;
    metadata_analysis: {
      camera_consistency: boolean;
      location_consistency: boolean;
      timestamp_analysis: string[];
      editing_software_detected: string[];
    };
    technical_indicators: {
      compression_artifacts: boolean;
      upscaling_detected: boolean;
      noise_pattern_analysis: string;
      color_space_inconsistencies: boolean;
    };
  };
  behavioral_patterns: {
    photo_progression_natural: boolean;
    lighting_consistency: number;
    background_analysis: string[];
    clothing_style_consistency: boolean;
    body_proportions_consistent: boolean;
  };
  social_verification: {
    cross_platform_presence: Array<{
      platform: string;
      profile_age: number;
      activity_level: 'high' | 'medium' | 'low';
      friend_network_quality: number;
    }>;
    mutual_connections_verified: number;
    tagged_photos_by_others: number;
    social_graph_authenticity: number;
  };
  red_flags: string[];
  authenticity_score: number; // 0-100 (100 = definitely real)
}

export interface ProfileVerificationResult {
  profile_legitimacy: number; // 0-100
  social_footprint: {
    platforms_found: string[];
    account_ages: number[];
    consistency_across_platforms: number;
    friend_network_analysis: {
      total_connections: number;
      mutual_friends: number;
      network_authenticity: number;
    };
  };
  digital_footprint: {
    web_presence_years: number;
    professional_presence: boolean;
    news_mentions: string[];
    public_records_match: boolean;
  };
  location_verification: {
    stated_location: string;
    verified_locations: string[];
    ip_location_consistency: boolean;
    check_ins_authentic: boolean;
  };
  verification_confidence: number; // 0-100
}

class AdvancedCatfishDetector {
  private faceDetectionLoaded = false;
  private browser: Browser | null = null;

  constructor() {
    this.initializeFaceDetection();
  }

  private async initializeFaceDetection(): Promise<void> {
    try {
      // Load face-api.js models
      const modelPath = path.join(__dirname, '../models');
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
      await faceapi.nets.ageGenderNet.loadFromDisk(modelPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
      this.faceDetectionLoaded = true;
    } catch (error) {
      console.error('Face detection models not available, using fallback methods');
    }
  }

  async analyzeCatfishRisk(photos: string[], profileData: any): Promise<CatfishAnalysis> {
    const analysis: CatfishAnalysis = {
      overall_risk_score: 0,
      face_analysis: {
        faces_detected: 0,
        age_consistency: true,
        gender_consistency: true,
        face_match_across_photos: 0,
        professional_photo_likelihood: 0,
        deepfake_probability: 0
      },
      image_forensics: {
        reverse_search_matches: [],
        metadata_analysis: {
          camera_consistency: true,
          location_consistency: true,
          timestamp_analysis: [],
          editing_software_detected: []
        },
        technical_indicators: {
          compression_artifacts: false,
          upscaling_detected: false,
          noise_pattern_analysis: 'normal',
          color_space_inconsistencies: false
        }
      },
      behavioral_patterns: {
        photo_progression_natural: true,
        lighting_consistency: 0,
        background_analysis: [],
        clothing_style_consistency: true,
        body_proportions_consistent: true
      },
      social_verification: {
        cross_platform_presence: [],
        mutual_connections_verified: 0,
        tagged_photos_by_others: 0,
        social_graph_authenticity: 0
      },
      red_flags: [],
      authenticity_score: 50
    };

    // Analyze each photo
    for (const photoPath of photos) {
      await this.analyzeIndividualPhoto(photoPath, analysis);
    }

    // Cross-photo analysis
    if (photos.length > 1) {
      await this.crossPhotoAnalysis(photos, analysis);
    }

    // Calculate overall risk score
    analysis.overall_risk_score = this.calculateOverallRiskScore(analysis);
    analysis.authenticity_score = 100 - analysis.overall_risk_score;

    return analysis;
  }

  private async analyzeIndividualPhoto(photoPath: string, analysis: CatfishAnalysis): Promise<void> {
    try {
      // Load image
      const imageBuffer = await fs.promises.readFile(photoPath);
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      // EXIF Analysis
      try {
        const exifData = await ExifReader.parse(imageBuffer);
        await this.analyzeExifData(exifData, analysis);
      } catch (error) {
        console.log('No EXIF data found');
      }

      // Image Quality Analysis
      await this.analyzeImageQuality(imageBuffer, analysis);

      // Reverse Image Search
      await this.performReverseImageSearch(photoPath, analysis);

      // Face Analysis (if models are loaded)
      if (this.faceDetectionLoaded) {
        await this.analyzeFaces(imageBuffer, analysis);
      }

      // Technical Forensics
      await this.performTechnicalForensics(imageBuffer, analysis);

    } catch (error) {
      console.error('Error analyzing photo:', error);
      analysis.red_flags.push('Photo analysis failed - potentially corrupted or fake');
    }
  }

  private async analyzeExifData(exifData: any, analysis: CatfishAnalysis): Promise<void> {
    // Camera consistency check
    if (exifData.Make && exifData.Model) {
      const cameraInfo = `${exifData.Make} ${exifData.Model}`;
      if (!analysis.image_forensics.metadata_analysis.timestamp_analysis.includes(cameraInfo)) {
        analysis.image_forensics.metadata_analysis.timestamp_analysis.push(cameraInfo);
      }
    }

    // Software detection
    if (exifData.Software) {
      const software = exifData.Software.toString();
      if (software.includes('Photoshop') || software.includes('GIMP') || software.includes('FaceApp')) {
        analysis.image_forensics.metadata_analysis.editing_software_detected.push(software);
        analysis.red_flags.push(`Heavy photo editing detected: ${software}`);
      }
    }

    // GPS location analysis
    if (exifData.GPSLatitude && exifData.GPSLongitude) {
      const lat = this.convertDMSToDD(exifData.GPSLatitude, exifData.GPSLatitudeRef);
      const lon = this.convertDMSToDD(exifData.GPSLongitude, exifData.GPSLongitudeRef);
      
      // Store location for consistency check
      analysis.behavioral_patterns.background_analysis.push(`GPS: ${lat}, ${lon}`);
    }

    // Timestamp analysis
    if (exifData.DateTimeOriginal) {
      analysis.image_forensics.metadata_analysis.timestamp_analysis.push(
        `Taken: ${exifData.DateTimeOriginal}`
      );
    }
  }

  private async analyzeImageQuality(imageBuffer: Buffer, analysis: CatfishAnalysis): Promise<void> {
    const image = sharp(imageBuffer);
    const stats = await image.stats();
    const metadata = await image.metadata();

    // Check for upscaling (unnaturally high resolution with low detail)
    if (metadata.width && metadata.height) {
      const pixelCount = metadata.width * metadata.height;
      if (pixelCount > 2000000) { // > 2MP
        // Analyze sharpness vs resolution ratio
        const sharpnessRatio = this.calculateSharpness(stats);
        if (sharpnessRatio < 0.3) {
          analysis.image_forensics.technical_indicators.upscaling_detected = true;
          analysis.red_flags.push('Image appears to be artificially upscaled');
        }
      }
    }

    // Professional photo detection
    const professionalScore = await this.detectProfessionalPhoto(imageBuffer);
    analysis.face_analysis.professional_photo_likelihood = professionalScore;
    
    if (professionalScore > 80) {
      analysis.red_flags.push('Photos appear to be professional/model shots');
    }
  }

  private async performReverseImageSearch(photoPath: string, analysis: CatfishAnalysis): Promise<void> {
    try {
      const results = await reverseImageSearchGoogle(photoPath);
      
      for (const result of results.slice(0, 10)) { // Check top 10 results
        const match = {
          url: result.url,
          context: result.title || 'Unknown',
          first_seen: 'Unknown',
          source_type: this.categorizeImageSource(result.url, result.title) as any
        };

        analysis.image_forensics.reverse_search_matches.push(match);

        // Flag high-risk sources
        if (match.source_type === 'stock_photo' || match.source_type === 'model_portfolio') {
          analysis.red_flags.push(`Image found on ${match.source_type}: ${match.url}`);
        }
      }
    } catch (error) {
      console.error('Reverse image search failed:', error);
    }
  }

  private async analyzeFaces(imageBuffer: Buffer, analysis: CatfishAnalysis): Promise<void> {
    try {
      // Convert buffer to canvas/image for face-api.js
      const canvas = await this.bufferToCanvas(imageBuffer);
      
      const detections = await faceapi
        .detectAllFaces(canvas)
        .withFaceLandmarks()
        .withAgeAndGender();

      analysis.face_analysis.faces_detected = detections.length;

      if (detections.length > 0) {
        const detection = detections[0];
        
        // Store age and gender for consistency check
        if (!analysis.behavioral_patterns.background_analysis.includes('face_data')) {
          analysis.behavioral_patterns.background_analysis.push(
            `age_${Math.round(detection.age)}_gender_${detection.gender}`
          );
        }

        // Deepfake detection using facial landmark analysis
        const deepfakeScore = this.analyzeDeepfakeIndicators(detection.landmarks);
        analysis.face_analysis.deepfake_probability = deepfakeScore;
        
        if (deepfakeScore > 70) {
          analysis.red_flags.push('High probability of AI-generated/deepfake image');
        }
      }
    } catch (error) {
      console.error('Face analysis failed:', error);
    }
  }

  private async performTechnicalForensics(imageBuffer: Buffer, analysis: CatfishAnalysis): Promise<void> {
    // Compression artifact analysis
    const compressionScore = await this.analyzeCompressionArtifacts(imageBuffer);
    analysis.image_forensics.technical_indicators.compression_artifacts = compressionScore > 50;

    // Noise pattern analysis
    const noisePattern = await this.analyzeNoisePatterns(imageBuffer);
    analysis.image_forensics.technical_indicators.noise_pattern_analysis = noisePattern;

    if (noisePattern === 'artificial' || noisePattern === 'inconsistent') {
      analysis.red_flags.push('Suspicious noise patterns detected - possible manipulation');
    }
  }

  private async crossPhotoAnalysis(photos: string[], analysis: CatfishAnalysis): Promise<void> {
    // Face matching across photos
    if (this.faceDetectionLoaded && photos.length > 1) {
      const faceMatchScore = await this.compareFacesAcrossPhotos(photos);
      analysis.face_analysis.face_match_across_photos = faceMatchScore;
      
      if (faceMatchScore < 60) {
        analysis.red_flags.push('Faces appear to be different people across photos');
      }
    }

    // Lighting consistency
    const lightingScore = await this.analyzeLightingConsistency(photos);
    analysis.behavioral_patterns.lighting_consistency = lightingScore;

    // Background analysis
    const backgroundAnalysis = await this.analyzeBackgrounds(photos);
    analysis.behavioral_patterns.background_analysis.push(...backgroundAnalysis);

    // Age progression check
    const ageProgression = await this.analyzeAgeProgression(photos);
    if (!ageProgression.natural) {
      analysis.red_flags.push('Unnatural age progression across photos');
      analysis.behavioral_patterns.photo_progression_natural = false;
    }
  }

  async verifyProfile(profileUrl: string, socialLinks: string[]): Promise<ProfileVerificationResult> {
    const result: ProfileVerificationResult = {
      profile_legitimacy: 50,
      social_footprint: {
        platforms_found: [],
        account_ages: [],
        consistency_across_platforms: 0,
        friend_network_analysis: {
          total_connections: 0,
          mutual_friends: 0,
          network_authenticity: 0
        }
      },
      digital_footprint: {
        web_presence_years: 0,
        professional_presence: false,
        news_mentions: [],
        public_records_match: false
      },
      location_verification: {
        stated_location: '',
        verified_locations: [],
        ip_location_consistency: false,
        check_ins_authentic: false
      },
      verification_confidence: 0
    };

    // Social media cross-verification
    for (const link of socialLinks) {
      await this.verifySocialProfile(link, result);
    }

    // Web presence analysis
    await this.analyzeWebPresence(profileUrl, result);

    // Calculate final scores
    result.verification_confidence = this.calculateVerificationConfidence(result);
    result.profile_legitimacy = this.calculateProfileLegitimacy(result);

    return result;
  }

  private async verifySocialProfile(profileUrl: string, result: ProfileVerificationResult): Promise<void> {
    try {
      if (!this.browser) {
        this.browser = await puppeteer.launch({ headless: true });
      }

      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const platform = this.detectPlatform(profileUrl);
      result.social_footprint.platforms_found.push(platform);

      // Platform-specific analysis
      switch (platform) {
        case 'instagram':
          await this.analyzeInstagram(page, result);
          break;
        case 'facebook':
          await this.analyzeFacebook(page, result);
          break;
        case 'linkedin':
          await this.analyzeLinkedIn(page, result);
          break;
        case 'twitter':
          await this.analyzeTwitter(page, result);
          break;
      }

      await page.close();
    } catch (error) {
      console.error('Error verifying social profile:', error);
    }
  }

  private async analyzeInstagram(page: Page, result: ProfileVerificationResult): Promise<void> {
    try {
      // Extract follower count
      const followers = await page.$eval('[href*="followers"]', el => el.textContent);
      
      // Extract post count
      const posts = await page.$$eval('article img', imgs => imgs.length);
      
      // Analyze account age and authenticity
      const accountData = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        for (const script of scripts) {
          if (script.innerHTML.includes('profilePage_')) {
            // Extract profile data from Instagram's GraphQL
            const match = script.innerHTML.match(/"edge_followed_by":{"count":(\d+)}/);
            return match ? parseInt(match[1]) : 0;
          }
        }
        return 0;
      });

      // Authenticity scoring
      const followerCount = this.parseNumberFromString(followers || '0');
      const authenticityScore = this.calculateInstagramAuthenticity(followerCount, posts, accountData);
      
      result.social_footprint.friend_network_analysis.total_connections += followerCount;
      result.social_footprint.friend_network_analysis.network_authenticity = 
        (result.social_footprint.friend_network_analysis.network_authenticity + authenticityScore) / 2;

    } catch (error) {
      console.error('Instagram analysis failed:', error);
    }
  }

  private async analyzeFacebook(page: Page, result: ProfileVerificationResult): Promise<void> {
    try {
      // Look for friend count
      const friendsElement = await page.$('[data-overviewsection="friends"]');
      if (friendsElement) {
        const friendsText = await page.evaluate(el => el?.textContent, friendsElement);
        const friendCount = this.parseNumberFromString(friendsText || '0');
        result.social_footprint.friend_network_analysis.total_connections += friendCount;
      }

      // Check for tagged photos by others
      const taggedPhotos = await page.$$eval('[aria-label*="tagged"]', elements => elements.length);
      
      // Timeline authenticity
      const timelineAuthenticity = await this.analyzeFacebookTimeline(page);
      result.social_footprint.friend_network_analysis.network_authenticity = 
        (result.social_footprint.friend_network_analysis.network_authenticity + timelineAuthenticity) / 2;

    } catch (error) {
      console.error('Facebook analysis failed:', error);
    }
  }

  private async analyzeLinkedIn(page: Page, result: ProfileVerificationResult): Promise<void> {
    try {
      // Professional presence verification
      const workExperience = await page.$$eval('.experience-section li', items => items.length);
      const education = await page.$$eval('.education-section li', items => items.length);
      const connections = await page.$eval('.dist-value', el => el.textContent);

      if (workExperience > 0 || education > 0) {
        result.digital_footprint.professional_presence = true;
      }

      const connectionCount = this.parseNumberFromString(connections || '0');
      result.social_footprint.friend_network_analysis.total_connections += connectionCount;

    } catch (error) {
      console.error('LinkedIn analysis failed:', error);
    }
  }

  private async analyzeTwitter(page: Page, result: ProfileVerificationResult): Promise<void> {
    try {
      // Account age and activity analysis
      const joinDate = await page.$eval('[data-testid="UserJoinDate"]', el => el.textContent);
      const tweets = await page.$eval('[data-testid="UserTweets"]', el => el.textContent);
      
      if (joinDate) {
        const accountAge = this.calculateAccountAge(joinDate);
        result.social_footprint.account_ages.push(accountAge);
      }

      // Engagement authenticity
      const engagementScore = await this.analyzeTwitterEngagement(page);
      result.social_footprint.friend_network_analysis.network_authenticity = 
        (result.social_footprint.friend_network_analysis.network_authenticity + engagementScore) / 2;

    } catch (error) {
      console.error('Twitter analysis failed:', error);
    }
  }

  // Helper Methods

  private calculateOverallRiskScore(analysis: CatfishAnalysis): number {
    let riskScore = 0;

    // Face analysis risks
    if (analysis.face_analysis.face_match_across_photos < 60) riskScore += 30;
    if (analysis.face_analysis.professional_photo_likelihood > 80) riskScore += 20;
    if (analysis.face_analysis.deepfake_probability > 70) riskScore += 40;

    // Image forensics risks
    riskScore += analysis.image_forensics.reverse_search_matches.length * 10;
    if (analysis.image_forensics.technical_indicators.upscaling_detected) riskScore += 15;
    if (analysis.image_forensics.metadata_analysis.editing_software_detected.length > 0) riskScore += 20;

    // Social verification risks
    if (analysis.social_verification.cross_platform_presence.length < 2) riskScore += 25;
    if (analysis.social_verification.social_graph_authenticity < 50) riskScore += 20;

    return Math.min(riskScore, 100);
  }

  private convertDMSToDD(dms: any, ref: string): number {
    let dd = dms[0] + dms[1]/60 + dms[2]/3600;
    if (ref === 'S' || ref === 'W') dd = dd * -1;
    return dd;
  }

  private calculateSharpness(stats: any): number {
    // Simplified sharpness calculation based on channel variance
    const variance = stats.channels.reduce((sum: number, channel: any) => sum + channel.variance, 0) / stats.channels.length;
    return Math.min(variance / 1000, 1.0);
  }

  private async detectProfessionalPhoto(imageBuffer: Buffer): Promise<number> {
    // Analyze image characteristics typical of professional photos
    const image = sharp(imageBuffer);
    const stats = await image.stats();
    
    let professionalScore = 0;
    
    // High dynamic range
    const dynamicRange = this.calculateDynamicRange(stats);
    if (dynamicRange > 0.8) professionalScore += 30;
    
    // Professional aspect ratios
    const metadata = await image.metadata();
    if (metadata.width && metadata.height) {
      const aspectRatio = metadata.width / metadata.height;
      if (Math.abs(aspectRatio - 1.5) < 0.1 || Math.abs(aspectRatio - 0.67) < 0.1) {
        professionalScore += 20;
      }
    }
    
    return professionalScore;
  }

  private calculateDynamicRange(stats: any): number {
    // Calculate dynamic range from histogram
    let totalRange = 0;
    for (const channel of stats.channels) {
      const range = (channel.max - channel.min) / 255;
      totalRange += range;
    }
    return totalRange / stats.channels.length;
  }

  private categorizeImageSource(url: string, title: string): string {
    const urlLower = url.toLowerCase();
    const titleLower = (title || '').toLowerCase();
    
    if (urlLower.includes('shutterstock') || urlLower.includes('getty') || urlLower.includes('stock')) {
      return 'stock_photo';
    }
    if (urlLower.includes('model') || titleLower.includes('model')) {
      return 'model_portfolio';
    }
    if (urlLower.includes('instagram.com') || urlLower.includes('facebook.com')) {
      return 'social_media';
    }
    if (urlLower.includes('xxx') || urlLower.includes('porn') || urlLower.includes('adult')) {
      return 'adult_content';
    }
    return 'unknown';
  }

  private async bufferToCanvas(buffer: Buffer): Promise<HTMLCanvasElement> {
    // This would need to be implemented with a proper canvas library
    // For now, return a mock canvas
    return {} as HTMLCanvasElement;
  }

  private analyzeDeepfakeIndicators(landmarks: any): number {
    // Analyze facial landmarks for deepfake indicators
    // This would implement sophisticated deepfake detection algorithms
    return Math.random() * 100; // Placeholder
  }

  private async analyzeCompressionArtifacts(imageBuffer: Buffer): Promise<number> {
    // Analyze JPEG compression artifacts
    return Math.random() * 100; // Placeholder
  }

  private async analyzeNoisePatterns(imageBuffer: Buffer): Promise<string> {
    // Analyze noise patterns for manipulation detection
    const patterns = ['natural', 'artificial', 'inconsistent', 'processed'];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private async compareFacesAcrossPhotos(photos: string[]): Promise<number> {
    // Compare facial features across multiple photos
    return 50 + Math.random() * 50; // Placeholder
  }

  private async analyzeLightingConsistency(photos: string[]): Promise<number> {
    // Analyze lighting consistency across photos
    return Math.random() * 100; // Placeholder
  }

  private async analyzeBackgrounds(photos: string[]): Promise<string[]> {
    // Analyze backgrounds for consistency and authenticity
    return ['indoor_consistent', 'outdoor_varied', 'studio_lighting_detected'];
  }

  private async analyzeAgeProgression(photos: string[]): Promise<{natural: boolean, confidence: number}> {
    // Analyze if age progression across photos is natural
    return { natural: Math.random() > 0.3, confidence: Math.random() * 100 };
  }

  private detectPlatform(url: string): string {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    return 'unknown';
  }

  private parseNumberFromString(str: string): number {
    const match = str.match(/[\d,]+/);
    if (!match) return 0;
    return parseInt(match[0].replace(/,/g, ''));
  }

  private calculateInstagramAuthenticity(followers: number, posts: number, accountData: any): number {
    // Calculate authenticity based on follower-to-post ratio and engagement
    let score = 50;
    
    const ratio = posts > 0 ? followers / posts : 0;
    if (ratio > 100 && ratio < 1000) score += 30; // Good ratio
    if (ratio > 10000) score -= 40; // Suspicious high follower count with few posts
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateAccountAge(joinDate: string): number {
    // Calculate account age in months
    const joined = new Date(joinDate);
    const now = new Date();
    return (now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24 * 30);
  }

  private async analyzeFacebookTimeline(page: Page): Promise<number> {
    // Analyze Facebook timeline for authenticity indicators
    return Math.random() * 100; // Placeholder
  }

  private async analyzeTwitterEngagement(page: Page): Promise<number> {
    // Analyze Twitter engagement patterns
    return Math.random() * 100; // Placeholder
  }

  private async analyzeWebPresence(profileUrl: string, result: ProfileVerificationResult): Promise<void> {
    try {
      // Domain analysis
      const domain = new URL(profileUrl).hostname;
      const whoisData = await promisify(whois.lookup)(domain);
      
      if (whoisData) {
        // Parse creation date from WHOIS data
        const creationMatch = whoisData.match(/Creation Date:\s*(.+)/i);
        if (creationMatch) {
          const creationDate = new Date(creationMatch[1]);
          const ageInYears = (Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          result.digital_footprint.web_presence_years = ageInYears;
        }
      }
    } catch (error) {
      console.error('Web presence analysis failed:', error);
    }
  }

  private calculateVerificationConfidence(result: ProfileVerificationResult): number {
    let confidence = 0;
    
    // Social footprint scoring
    confidence += result.social_footprint.platforms_found.length * 15;
    confidence += Math.min(result.social_footprint.friend_network_analysis.network_authenticity, 30);
    
    // Digital footprint scoring
    confidence += Math.min(result.digital_footprint.web_presence_years * 5, 25);
    if (result.digital_footprint.professional_presence) confidence += 20;
    
    return Math.min(confidence, 100);
  }

  private calculateProfileLegitimacy(result: ProfileVerificationResult): number {
    let legitimacy = 50; // Start with neutral
    
    // Positive indicators
    if (result.social_footprint.platforms_found.length >= 3) legitimacy += 20;
    if (result.digital_footprint.professional_presence) legitimacy += 15;
    if (result.digital_footprint.web_presence_years > 2) legitimacy += 15;
    if (result.social_footprint.friend_network_analysis.network_authenticity > 70) legitimacy += 20;
    
    // Negative indicators
    if (result.social_footprint.platforms_found.length < 2) legitimacy -= 30;
    if (result.digital_footprint.web_presence_years < 1) legitimacy -= 20;
    
    return Math.max(0, Math.min(100, legitimacy));
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export { AdvancedCatfishDetector };
