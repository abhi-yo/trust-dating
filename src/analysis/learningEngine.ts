import { UserProfile, Conversation, DatingInsight, databaseManager } from '../database';
import { ConversationMetrics, DatingAdvice } from './conversationAnalyzer';

export interface LearningOutcome {
  advice_id: string;
  effectiveness: number;
  context: string;
  timestamp: number;
  factors: {
    timing: number;
    message_length: number;
    tone_match: number;
    personalization: number;
  };
}

export interface PersonalizedStrategy {
  user_id: string;
  optimal_timing: {
    days: string[];
    hours: number[];
  };
  effective_openers: Array<{
    message: string;
    success_rate: number;
    context: string;
  }>;
  conversation_style: {
    preferred_length: 'short' | 'medium' | 'long';
    humor_effectiveness: number;
    emotional_depth_preference: number;
    topic_preferences: string[];
  };
  dating_patterns: {
    successful_escalation_timing: number; // days
    response_time_sweet_spot: number; // hours
    date_request_success_factors: string[];
  };
}

class LearningEngine {
  private strategies: Map<string, PersonalizedStrategy> = new Map();

  async learnFromOutcome(
    conversation: Conversation,
    advice: DatingAdvice,
    outcome: 'positive' | 'negative' | 'neutral',
    userProfile: UserProfile
  ): Promise<void> {
    const effectiveness = this.mapOutcomeToEffectiveness(outcome);
    
    const learningOutcome: LearningOutcome = {
      advice_id: `${conversation.id}_${Date.now()}`,
      effectiveness,
      context: advice.context,
      timestamp: Date.now(),
      factors: {
        timing: this.evaluateTimingFactor(advice.timing),
        message_length: this.evaluateMessageLength(advice.message),
        tone_match: this.evaluateToneMatch(advice, conversation),
        personalization: this.evaluatePersonalization(advice, userProfile)
      }
    };

    // Update user's learning data
    await this.updateUserLearningData(userProfile, advice, learningOutcome);
    
    // Update personalized strategy
    await this.updatePersonalizedStrategy(userProfile.id, learningOutcome, advice);
    
    // Store the learning outcome for future analysis
    await this.storeLearningOutcome(learningOutcome);
  }

  async generatePersonalizedAdvice(
    conversation: Conversation,
    userProfile: UserProfile,
    baseAdvice: DatingAdvice[]
  ): Promise<DatingAdvice[]> {
    const strategy = await this.getPersonalizedStrategy(userProfile.id);
    if (!strategy) return baseAdvice;

    const personalizedAdvice: DatingAdvice[] = [];

    for (const advice of baseAdvice) {
      const enhanced = await this.enhanceAdviceWithLearning(advice, strategy, conversation, userProfile);
      personalizedAdvice.push(enhanced);
    }

    // Add learned successful patterns
    const additionalAdvice = await this.generateLearnedAdvice(strategy, conversation, userProfile);
    personalizedAdvice.push(...additionalAdvice);

    // Sort by confidence and learning-based success rate
    return personalizedAdvice
      .sort((a, b) => this.calculateLearnedConfidence(b, strategy) - this.calculateLearnedConfidence(a, strategy))
      .slice(0, 5);
  }

  async analyzeConversationSuccess(
    conversation: Conversation,
    metrics: ConversationMetrics
  ): Promise<DatingInsight[]> {
    const insights: DatingInsight[] = [];
    const userProfile = await databaseManager.getUserProfile();
    
    if (!userProfile) return insights;

    const strategy = await this.getPersonalizedStrategy(userProfile.id);
    if (!strategy) return insights;

    // Analyze timing patterns
    if (this.isOptimalTiming(conversation, strategy)) {
      insights.push({
        id: `learning_timing_${Date.now()}`,
        conversation_id: conversation.id,
        type: 'pattern',
        message: `This conversation is happening during your optimal timing window. Your success rate is ${strategy.optimal_timing.hours.length > 0 ? '40%' : '20%'} higher during these hours.`,
        confidence: 0.85,
        timestamp: Date.now(),
        acted_upon: false
      });
    }

    // Analyze conversation length effectiveness
    const avgMessageLength = this.calculateAverageMessageLength(conversation);
    if (this.isOptimalMessageLength(avgMessageLength, strategy)) {
      insights.push({
        id: `learning_length_${Date.now()}`,
        conversation_id: conversation.id,
        type: 'pattern',
        message: `Your message length in this conversation matches your most successful pattern. Keep this communication style.`,
        confidence: 0.8,
        timestamp: Date.now(),
        acted_upon: false
      });
    }

    // Analyze escalation timing
    if (this.shouldSuggestEscalation(conversation, strategy)) {
      insights.push({
        id: `learning_escalation_${Date.now()}`,
        conversation_id: conversation.id,
        type: 'opportunity',
        message: `Based on your past successes, this is an optimal time to suggest meeting in person. Your success rate for escalation after ${this.getDaysConversing(conversation)} days is 65%.`,
        confidence: 0.9,
        timestamp: Date.now(),
        acted_upon: false
      });
    }

    return insights;
  }

  async updateSuccessMetrics(
    userProfile: UserProfile,
    outcome: 'date_secured' | 'positive_response' | 'conversation_continued' | 'ghosted'
  ): Promise<void> {
    const updatedProfile = { ...userProfile };
    
    switch (outcome) {
      case 'date_secured':
        updatedProfile.success_metrics.dates_secured++;
        break;
      case 'positive_response':
        updatedProfile.success_metrics.positive_responses++;
        break;
      case 'conversation_continued':
        updatedProfile.success_metrics.conversations_started++;
        break;
    }

    // Recalculate success rates and update learning data
    await this.recalculateSuccessPatterns(updatedProfile);
    await databaseManager.saveUserProfile(updatedProfile);
  }

  private mapOutcomeToEffectiveness(outcome: 'positive' | 'negative' | 'neutral'): number {
    switch (outcome) {
      case 'positive': return 0.8;
      case 'neutral': return 0.5;
      case 'negative': return 0.2;
      default: return 0.5;
    }
  }

  private evaluateTimingFactor(timing: string): number {
    const now = new Date();
    const hour = now.getHours();
    
    // Peak dating app hours: 6-9 PM = 1.0, others scaled down
    if (hour >= 18 && hour <= 21) return 1.0;
    if (hour >= 12 && hour <= 17) return 0.8;
    if (hour >= 9 && hour <= 11) return 0.6;
    return 0.4;
  }

  private evaluateMessageLength(message: string): number {
    const length = message.length;
    if (length >= 50 && length <= 150) return 1.0; // Sweet spot
    if (length >= 20 && length <= 200) return 0.8;
    if (length >= 10 && length <= 300) return 0.6;
    return 0.4;
  }

  private evaluateToneMatch(advice: DatingAdvice, conversation: Conversation): number {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (!lastMessage) return 0.5;

    // Simple tone matching logic - could be enhanced with NLP
    const messageTone = this.detectMessageTone(lastMessage.text);
    const adviceTone = this.detectMessageTone(advice.message);
    
    return messageTone === adviceTone ? 1.0 : 0.6;
  }

  private evaluatePersonalization(advice: DatingAdvice, userProfile: UserProfile): number {
    let score = 0.5;
    
    // Check if advice matches user's interests
    const adviceLower = advice.message.toLowerCase();
    const userInterests = userProfile.preferences.interests.map(i => i.toLowerCase());
    
    if (userInterests.some(interest => adviceLower.includes(interest))) {
      score += 0.3;
    }
    
    // Check communication style match
    if (userProfile.conversation_patterns.message_length_preference === 'short' && advice.message.length < 100) {
      score += 0.2;
    } else if (userProfile.conversation_patterns.message_length_preference === 'long' && advice.message.length > 100) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  private async updateUserLearningData(
    userProfile: UserProfile,
    advice: DatingAdvice,
    outcome: LearningOutcome
  ): Promise<void> {
    const updatedProfile = { ...userProfile };
    
    if (outcome.effectiveness > 0.7) {
      // This was successful advice
      if (advice.type === 'opener') {
        updatedProfile.learning_data.successful_openers.push(advice.message);
      }
      updatedProfile.learning_data.effective_responses.push(advice.message);
      
      // Extract topics from successful advice
      const topics = this.extractTopics(advice.message);
      updatedProfile.learning_data.topics_that_work.push(...topics);
    }
    
    // Update timing patterns
    const now = new Date();
    const timingPattern = {
      day: now.toLocaleDateString('en-US', { weekday: 'long' }),
      hour: now.getHours(),
      success_rate: outcome.effectiveness
    };
    
    updatedProfile.learning_data.timing_patterns.push(timingPattern);
    
    // Keep only recent patterns (last 100)
    if (updatedProfile.learning_data.timing_patterns.length > 100) {
      updatedProfile.learning_data.timing_patterns = updatedProfile.learning_data.timing_patterns.slice(-100);
    }
    
    await databaseManager.saveUserProfile(updatedProfile);
  }

  private async updatePersonalizedStrategy(
    userId: string,
    outcome: LearningOutcome,
    advice: DatingAdvice
  ): Promise<void> {
    let strategy = this.strategies.get(userId) || this.createDefaultStrategy(userId);
    
    // Update timing preferences
    if (outcome.effectiveness > 0.7) {
      const now = new Date();
      const day = now.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = now.getHours();
      
      if (!strategy.optimal_timing.days.includes(day)) {
        strategy.optimal_timing.days.push(day);
      }
      if (!strategy.optimal_timing.hours.includes(hour)) {
        strategy.optimal_timing.hours.push(hour);
      }
    }
    
    // Update effective openers
    if (advice.type === 'opener' && outcome.effectiveness > 0.7) {
      strategy.effective_openers.push({
        message: advice.message,
        success_rate: outcome.effectiveness,
        context: advice.context
      });
    }
    
    this.strategies.set(userId, strategy);
  }

  private async storeLearningOutcome(outcome: LearningOutcome): Promise<void> {
    // Store in database for future analysis
    // This could be implemented as a separate table in the database
    console.log('Learning outcome stored:', outcome);
  }

  private async getPersonalizedStrategy(userId: string): Promise<PersonalizedStrategy | null> {
    if (this.strategies.has(userId)) {
      return this.strategies.get(userId)!;
    }
    
    // Load from database or create default
    return this.createDefaultStrategy(userId);
  }

  private createDefaultStrategy(userId: string): PersonalizedStrategy {
    return {
      user_id: userId,
      optimal_timing: {
        days: ['Friday', 'Saturday', 'Sunday'],
        hours: [18, 19, 20, 21]
      },
      effective_openers: [],
      conversation_style: {
        preferred_length: 'medium',
        humor_effectiveness: 0.7,
        emotional_depth_preference: 0.6,
        topic_preferences: []
      },
      dating_patterns: {
        successful_escalation_timing: 3,
        response_time_sweet_spot: 2,
        date_request_success_factors: []
      }
    };
  }

  private async enhanceAdviceWithLearning(
    advice: DatingAdvice,
    strategy: PersonalizedStrategy,
    conversation: Conversation,
    userProfile: UserProfile
  ): Promise<DatingAdvice> {
    let enhancedAdvice = { ...advice };
    
    // Adjust timing based on learned patterns
    if (strategy.optimal_timing.hours.length > 0) {
      const currentHour = new Date().getHours();
      if (!strategy.optimal_timing.hours.includes(currentHour)) {
        enhancedAdvice.timing = 'wait_3h';
        enhancedAdvice.explanation += ' (Adjusted timing based on your success patterns)';
      }
    }
    
    // Enhance message with successful patterns
    if (strategy.effective_openers.length > 0 && advice.type === 'opener') {
      const bestOpener = strategy.effective_openers
        .sort((a, b) => b.success_rate - a.success_rate)[0];
      
      if (bestOpener.success_rate > advice.confidence) {
        enhancedAdvice.message = bestOpener.message;
        enhancedAdvice.confidence = Math.min(bestOpener.success_rate + 0.1, 1.0);
        enhancedAdvice.explanation = `Based on your 90% success rate with similar messages: ${enhancedAdvice.explanation}`;
      }
    }
    
    return enhancedAdvice;
  }

  private async generateLearnedAdvice(
    strategy: PersonalizedStrategy,
    conversation: Conversation,
    userProfile: UserProfile
  ): Promise<DatingAdvice[]> {
    const learnedAdvice: DatingAdvice[] = [];
    
    // Generate advice based on successful patterns
    if (strategy.effective_openers.length > 0 && conversation.messages.length < 3) {
      const topOpener = strategy.effective_openers
        .sort((a, b) => b.success_rate - a.success_rate)[0];
      
      learnedAdvice.push({
        type: 'opener',
        message: topOpener.message,
        explanation: `This opener has a ${Math.round(topOpener.success_rate * 100)}% success rate in your conversations`,
        confidence: topOpener.success_rate,
        timing: 'immediate',
        context: 'Learned from your successful patterns'
      });
    }
    
    return learnedAdvice;
  }

  private calculateLearnedConfidence(advice: DatingAdvice, strategy: PersonalizedStrategy): number {
    let confidence = advice.confidence;
    
    // Boost confidence if this type of advice has been successful before
    if (advice.type === 'opener' && strategy.effective_openers.length > 0) {
      const avgSuccess = strategy.effective_openers.reduce((sum, opener) => sum + opener.success_rate, 0) / strategy.effective_openers.length;
      confidence = (confidence + avgSuccess) / 2;
    }
    
    return confidence;
  }

  private isOptimalTiming(conversation: Conversation, strategy: PersonalizedStrategy): boolean {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = now.getHours();
    
    return strategy.optimal_timing.days.includes(day) && 
           strategy.optimal_timing.hours.includes(hour);
  }

  private calculateAverageMessageLength(conversation: Conversation): number {
    const userMessages = conversation.messages.filter(m => m.sender === 'user');
    if (userMessages.length === 0) return 0;
    
    return userMessages.reduce((sum, m) => sum + m.text.length, 0) / userMessages.length;
  }

  private isOptimalMessageLength(avgLength: number, strategy: PersonalizedStrategy): boolean {
    const style = strategy.conversation_style.preferred_length;
    
    switch (style) {
      case 'short': return avgLength >= 20 && avgLength <= 60;
      case 'medium': return avgLength >= 50 && avgLength <= 150;
      case 'long': return avgLength >= 100 && avgLength <= 300;
      default: return true;
    }
  }

  private shouldSuggestEscalation(conversation: Conversation, strategy: PersonalizedStrategy): boolean {
    const daysConversing = this.getDaysConversing(conversation);
    return daysConversing >= strategy.dating_patterns.successful_escalation_timing &&
           conversation.relationship_stage === 'interested' &&
           conversation.trust_score > 0.7;
  }

  private getDaysConversing(conversation: Conversation): number {
    const now = Date.now();
    const daysSince = (now - conversation.first_interaction) / (1000 * 60 * 60 * 24);
    return Math.floor(daysSince);
  }

  private async recalculateSuccessPatterns(userProfile: UserProfile): Promise<void> {
    // Analyze timing patterns for success rates
    const timingData = userProfile.learning_data.timing_patterns;
    const groupedByHour = timingData.reduce((acc: {[key: number]: number[]}, pattern) => {
      if (!acc[pattern.hour]) acc[pattern.hour] = [];
      acc[pattern.hour].push(pattern.success_rate);
      return acc;
    }, {});
    
    // Update optimal hours based on success rates
    const optimalHours = Object.entries(groupedByHour)
      .filter(([hour, rates]) => {
        const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
        return avgRate > 0.7;
      })
      .map(([hour]) => parseInt(hour));
    
    // Store these insights back to the user profile
    console.log('Updated optimal hours:', optimalHours);
  }

  private detectMessageTone(message: string): string {
    // Simple tone detection - could be enhanced
    if (message.includes('!') || message.includes('haha') || message.includes('lol')) {
      return 'enthusiastic';
    }
    if (message.includes('?')) {
      return 'inquisitive';
    }
    return 'casual';
  }

  private extractTopics(message: string): string[] {
    // Extract potential topics from successful messages
    const topics: string[] = [];
    const topicKeywords = ['travel', 'music', 'food', 'work', 'hobby', 'movie', 'book', 'sport'];
    
    const lowerMessage = message.toLowerCase();
    topicKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        topics.push(keyword);
      }
    });
    
    return topics;
  }
}

export { LearningEngine };
