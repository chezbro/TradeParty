import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL || '',
  token: env.UPSTASH_REDIS_REST_TOKEN || '',
});

export class MeetingMonitor {
  static async trackMeetingStart(userId: string, meetingId: string) {
    const key = `user:${userId}:active_meetings`;
    const activeMeetings = await redis.sadd(key, meetingId);
    
    // Set TTL for cleanup
    await redis.expire(key, 24 * 60 * 60); // 24 hours
    
    return activeMeetings;
  }

  static async checkUserLimits(userId: string): Promise<boolean> {
    const key = `user:${userId}:active_meetings`;
    const activeMeetings = await redis.scard(key);
    
    // Limit users to 3 simultaneous meetings
    return activeMeetings < 3;
  }

  static async trackParticipantJoin(meetingId: string) {
    const key = `meeting:${meetingId}:participants`;
    const count = await redis.incr(key);
    
    // Set TTL for cleanup
    await redis.expire(key, 24 * 60 * 60);
    
    return count;
  }

  static async checkMeetingLimits(meetingId: string): Promise<boolean> {
    const key = `meeting:${meetingId}:participants`;
    const count = await redis.get(key);
    
    // Limit meetings to 50 participants
    return (count ? parseInt(count) : 0) < 50;
  }
} 