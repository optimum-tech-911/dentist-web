import { describe, it, expect } from 'vitest';
import { convertToPublicUrl } from './utils';

// Mock Supabase client
const mockSupabase = {
  storage: {
    from: () => ({
      getPublicUrl: (path: string) => ({
        data: {
          publicUrl: `https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery/${path}`
        }
      })
    })
  }
};

// Mock the supabase import
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('convertToPublicUrl', () => {
  it('converts signed URL to public URL', () => {
    const input = 'https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/sign/gallery/abc.png?token=xyz';
    const result = convertToPublicUrl(input);
    expect(result).toMatch(/^https:\/\/.*supabase.*\/gallery\/abc\.png$/);
    expect(result).not.toContain('/object/sign/');
    expect(result).toContain('/object/public/');
  });

  it('returns public URL as-is (idempotent)', () => {
    const input = 'https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery/abc.png';
    const result = convertToPublicUrl(input);
    expect(result).toBe(input);
  });

  it('returns raw path as-is', () => {
    const input = 'gallery/abc.png';
    const result = convertToPublicUrl(input);
    expect(result).toBe(input);
  });

  it('handles custom domain URLs', () => {
    const input = 'https://ufsbd34.fr/admin/gallery/abc.png';
    const result = convertToPublicUrl(input);
    expect(result).toBe(input);
  });

  it('handles URLs with query parameters', () => {
    const input = 'https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/sign/gallery/abc.png?token=xyz&expires=123';
    const result = convertToPublicUrl(input);
    expect(result).toMatch(/^https:\/\/.*supabase.*\/gallery\/abc\.png$/);
    expect(result).not.toContain('token=xyz');
  });

  it('handles complex file paths', () => {
    const input = 'https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/sign/gallery/user123/folder/image.jpg?token=abc';
    const result = convertToPublicUrl(input);
    expect(result).toMatch(/^https:\/\/.*supabase.*\/gallery\/user123\/folder\/image\.jpg$/);
  });

  it('handles non-gallery URLs', () => {
    const input = 'https://example.com/image.jpg';
    const result = convertToPublicUrl(input);
    expect(result).toBe(input);
  });

  it('handles empty string', () => {
    const input = '';
    const result = convertToPublicUrl(input);
    expect(result).toBe(input);
  });

  it('handles null/undefined gracefully', () => {
    // @ts-ignore - testing edge case
    const result = convertToPublicUrl(null);
    expect(result).toBe(null);
  });
});