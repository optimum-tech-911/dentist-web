// Emergency image generation system - creates beautiful images when all else fails
interface ImageGenerationOptions {
  width?: number;
  height?: number;
  title?: string;
  category?: string;
  theme?: 'medical' | 'dental' | 'health' | 'news' | 'generic';
  quality?: number;
}

class EmergencyImageGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Predefined color schemes for different themes
  private readonly colorSchemes = {
    medical: [
      { primary: '#3B82F6', secondary: '#93C5FD', accent: '#DBEAFE' },
      { primary: '#10B981', secondary: '#6EE7B7', accent: '#D1FAE5' },
      { primary: '#8B5CF6', secondary: '#C4B5FD', accent: '#EDE9FE' }
    ],
    dental: [
      { primary: '#06B6D4', secondary: '#67E8F9', accent: '#CFFAFE' },
      { primary: '#14B8A6', secondary: '#5EEAD4', accent: '#CCFBF1' },
      { primary: '#F59E0B', secondary: '#FCD34D', accent: '#FEF3C7' }
    ],
    health: [
      { primary: '#EF4444', secondary: '#FCA5A5', accent: '#FEE2E2' },
      { primary: '#F97316', secondary: '#FDBA74', accent: '#FED7AA' },
      { primary: '#84CC16', secondary: '#BEF264', accent: '#ECFCCB' }
    ],
    news: [
      { primary: '#1F2937', secondary: '#6B7280', accent: '#F3F4F6' },
      { primary: '#374151', secondary: '#9CA3AF', accent: '#F9FAFB' },
      { primary: '#111827', secondary: '#4B5563', accent: '#F7F8FA' }
    ],
    generic: [
      { primary: '#6366F1', secondary: '#A5B4FC', accent: '#E0E7FF' },
      { primary: '#EC4899', secondary: '#F9A8D4', accent: '#FCE7F3' },
      { primary: '#06B6D4', secondary: '#67E8F9', accent: '#CFFAFE' }
    ]
  };

  // Icon patterns for different themes
  private readonly iconPatterns = {
    medical: ['🏥', '⚕️', '🩺', '💊', '🧬', '🔬'],
    dental: ['🦷', '😁', '🪥', '✨', '💎', '🔧'],
    health: ['❤️', '💪', '🌟', '🍎', '🏃', '🧘'],
    news: ['📰', '📢', '💡', '📊', '🎯', '📈'],
    generic: ['✨', '🌟', '💫', '🔥', '⭐', '🎨']
  };

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Generate a hash from text for consistent randomization
  private hashText(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Select theme based on category or content
  private selectTheme(title: string, category?: string): 'medical' | 'dental' | 'health' | 'news' | 'generic' {
    const text = `${title} ${category || ''}`.toLowerCase();
    
    if (text.includes('dent') || text.includes('tooth') || text.includes('oral') || text.includes('bucco')) {
      return 'dental';
    }
    if (text.includes('medical') || text.includes('doctor') || text.includes('clinic') || text.includes('hospital')) {
      return 'medical';
    }
    if (text.includes('health') || text.includes('santé') || text.includes('wellness') || text.includes('care')) {
      return 'health';
    }
    if (text.includes('news') || text.includes('actualité') || text.includes('article') || text.includes('info')) {
      return 'news';
    }
    
    return 'generic';
  }

  // Create gradient background
  private createGradientBackground(width: number, height: number, colors: { primary: string; secondary: string; accent: string }): void {
    const gradient = this.ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.5, colors.secondary);
    gradient.addColorStop(1, colors.accent);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  // Add decorative elements
  private addDecorativeElements(width: number, height: number, theme: string): void {
    const icons = this.iconPatterns[theme as keyof typeof this.iconPatterns];
    
    // Add background pattern
    this.ctx.globalAlpha = 0.1;
    this.ctx.font = '60px Arial';
    
    for (let i = 0; i < 8; i++) {
      const x = (i % 4) * (width / 4) + Math.random() * 50;
      const y = Math.floor(i / 4) * (height / 2) + Math.random() * 50;
      const icon = icons[Math.floor(Math.random() * icons.length)];
      
      this.ctx.fillText(icon, x, y + 60);
    }
    
    this.ctx.globalAlpha = 1;
  }

  // Add text with proper wrapping and styling
  private addText(width: number, height: number, title: string): void {
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Add text shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    
    // Calculate font size based on canvas size
    const baseFontSize = Math.min(width, height) / 12;
    this.ctx.font = `bold ${baseFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    
    // Word wrapping
    const words = title.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + word + ' ';
      const metrics = this.ctx.measureText(testLine);
      if (metrics.width > width - 80 && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine.trim());
    
    // Draw lines
    const lineHeight = baseFontSize * 1.2;
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      this.ctx.fillText(line, width / 2, startY + (index * lineHeight));
    });
    
    // Reset shadow
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  // Add decorative border
  private addBorder(width: number, height: number, colors: { primary: string }): void {
    this.ctx.strokeStyle = colors.primary;
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(2, 2, width - 4, height - 4);
    
    // Add inner border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(8, 8, width - 16, height - 16);
  }

  // Generate emergency image
  generateImage(options: ImageGenerationOptions = {}): string {
    const {
      width = 400,
      height = 300,
      title = 'Article Image',
      category = '',
      theme = 'generic',
      quality = 0.9
    } = options;

    // Set canvas size
    this.canvas.width = width;
    this.canvas.height = height;

    // Select theme and colors
    const selectedTheme = theme === 'generic' ? this.selectTheme(title, category) : theme;
    const colorSchemes = this.colorSchemes[selectedTheme];
    const hash = this.hashText(title + category);
    const selectedColors = colorSchemes[hash % colorSchemes.length];

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Create background
    this.createGradientBackground(width, height, selectedColors);

    // Add decorative elements
    this.addDecorativeElements(width, height, selectedTheme);

    // Add border
    this.addBorder(width, height, selectedColors);

    // Add main text
    this.addText(width, height, title);

    // Add bottom accent
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.fillRect(0, height - 40, width, 40);
    
    // Add bottom text
    this.ctx.fillStyle = selectedColors.primary;
    this.ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('UFSBD', width / 2, height - 15);

    // Return as data URL
    return this.canvas.toDataURL('image/jpeg', quality);
  }

  // Generate multiple variations
  generateVariations(title: string, category?: string, count: number = 3): string[] {
    const variations: string[] = [];
    const themes: Array<'medical' | 'dental' | 'health' | 'news' | 'generic'> = ['medical', 'dental', 'health', 'news', 'generic'];
    
    for (let i = 0; i < count; i++) {
      const theme = themes[i % themes.length];
      const image = this.generateImage({
        title,
        category,
        theme,
        width: 400 + (i * 50), // Slight size variation
        height: 300 + (i * 30)
      });
      variations.push(image);
    }
    
    return variations;
  }

  // Generate placeholder with specific dimensions
  generatePlaceholder(width: number, height: number, text: string = 'Loading...'): string {
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Simple gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#E5E7EB');
    gradient.addColorStop(1, '#F3F4F6');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
    
    // Add text
    this.ctx.fillStyle = '#6B7280';
    this.ctx.font = `${Math.min(width, height) / 15}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, width / 2, height / 2);
    
    return this.canvas.toDataURL('image/jpeg', 0.8);
  }
}

// Global instance
export const emergencyImageGenerator = new EmergencyImageGenerator();

// Utility functions
export function generateEmergencyImage(
  title: string, 
  category?: string, 
  options?: Partial<ImageGenerationOptions>
): string {
  return emergencyImageGenerator.generateImage({
    title,
    category,
    ...options
  });
}

export function generateImageVariations(
  title: string, 
  category?: string, 
  count: number = 3
): string[] {
  return emergencyImageGenerator.generateVariations(title, category, count);
}

export function generateLoadingPlaceholder(
  width: number = 400, 
  height: number = 300, 
  text: string = 'Loading...'
): string {
  return emergencyImageGenerator.generatePlaceholder(width, height, text);
}

// Initialize on first import
if (typeof window !== 'undefined') {
  console.log('🎨 Emergency Image Generator Initialized');
}