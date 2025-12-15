import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app, httpServer } from '../src/server';

describe('API Integration Tests', () => {
  beforeAll(() => { httpServer.listen(3002); });
  afterAll(() => { httpServer.close(); });

  it('creates a room', async () => {
    const res = await fetch('http://localhost:3002/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostName: 'Test', language: 'javascript' }),
    });
    const data = await res.json();
    expect(data.room.id).toBeDefined();
    expect(data.user.isHost).toBe(true);
  });

  it('joins a room', async () => {
    const createRes = await fetch('http://localhost:3002/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostName: 'Host' }),
    });
    const { room } = await createRes.json();
    
    const joinRes = await fetch(`http://localhost:3002/api/rooms/${room.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: 'Guest' }),
    });
    const data = await joinRes.json();
    expect(data.room.participants.length).toBe(2);
  });
});
