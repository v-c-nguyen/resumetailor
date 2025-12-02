import { PDFDocument, PDFFont, PDFPage, RGB, rgb } from 'pdf-lib';

// Shared interface for template rendering
export interface TemplateContext {
  pdfDoc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  name: string;
  email: string;
  phone: string;
  location: string;
  body: string;
  PAGE_WIDTH: number;
  PAGE_HEIGHT: number;
}

// Helper to parse resume text
export function parseResume(resumeText: string): {
  headline: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  body: string;
} {
  const lines = resumeText.split('\n');
  const info: string[] = [];
  let bodyStart = 0;
  for (let idx = 0; idx < lines.length; idx++) {
    if (lines[idx].trim()) info.push(lines[idx].trim());
    if (info.length === 6) {
      bodyStart = idx + 1;
      break;
    }
  }
  const [headline = '', name = '', email = '', phone = '', location = '', linkedin = ''] = info;
  while (bodyStart < lines.length && !lines[bodyStart].trim()) bodyStart++;
  const body = lines.slice(bodyStart).join('\n');
  return { headline, name, email, phone, location, linkedin, body };
}

// Helper to convert date format from MM/YYYY to MMM YYYY
export function formatDate(dateStr: string): string {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Handle different date formats
  if (dateStr.includes('–') || dateStr.includes('-')) {
    // Split by dash and format each part
    const parts = dateStr.split(/[–-]/).map(part => part.trim());
    return parts.map(part => {
      if (part.match(/^\d{2}\/\d{4}$/)) {
        const [month, year] = part.split('/');
        const monthIndex = parseInt(month) - 1;
        return `${monthNames[monthIndex]} ${year}`;
      }
      return part; // Return as-is if not in MM/YYYY format
    }).join(' – ');
  } else if (dateStr.match(/^\d{2}\/\d{4}$/)) {
    // Single date in MM/YYYY format
    const [month, year] = dateStr.split('/');
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  }

  return dateStr; // Return as-is if not in expected format
}

// Helper to wrap text within a max width
export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
    const testWidth = font.widthOfTextAtSize(testLine, size);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Helper to wrap text with proper indentation for lines starting with prefixes (like '- ' or '· ')
export function wrapTextWithIndent(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): { lines: string[]; prefix: string; indentWidth: number; hasBullet: boolean } {
  // Trim leading whitespace but preserve the structure
  const trimmedText = text.trimStart();
  const leadingWhitespace = text.slice(0, text.length - trimmedText.length);
  
  // Detect and normalize bullet formats: -, •, ·, *, or other common bullet chars
  // Match bullet with optional space, or bullet without space (we'll add space)
  // Using a more comprehensive regex to catch all bullet variations
  const bulletMatch = trimmedText.match(/^([\-\u2022\u00b7\u2023\u25E6\u2043\u2219\*▪▫◦‣⁃])(\s*)/);
  let content = trimmedText;
  let hasBullet = false;
  
  if (bulletMatch) {
    // Remove bullet from text - we'll draw it programmatically
    hasBullet = true;
    content = trimmedText.slice(bulletMatch[0].length).trimStart();
  }
  
  // Calculate prefix width for indentation (include leading whitespace if any)
  // For bullets, we'll use a fixed width for the bullet + space
  const bulletRadius = size * 0.2; // Match the radius used in drawBulletPoint
  const bulletWidth = bulletRadius * 2; // Full width of the bullet circle
  const spaceWidth = font.widthOfTextAtSize(' ', size);
  const prefixWidth = leadingWhitespace ? font.widthOfTextAtSize(leadingWhitespace, size) : 0;
  const fullIndentWidth = prefixWidth + (hasBullet ? bulletWidth + spaceWidth : 0);
  
  // Wrap the content part
  const wrappedContent = wrapText(content, font, size, maxWidth - fullIndentWidth);
  
  // Build lines without bullet character in text
  const lines: string[] = [];
  wrappedContent.forEach((line, index) => {
    if (index === 0) {
      lines.push(leadingWhitespace + line);
    } else {
      // For wrapped lines, add indentation but no bullet
      lines.push(leadingWhitespace + line);
    }
  });
  
  return {
    lines,
    prefix: leadingWhitespace,
    indentWidth: fullIndentWidth,
    hasBullet
  };
}

// Helper to draw a bullet point (filled circle) programmatically
export function drawBulletPoint(
  page: PDFPage,
  x: number,
  y: number,
  size: number,
  color: RGB
) {
  // Calculate bullet size - make it more visible
  const bulletRadius = size * 0.2; // Slightly larger for better visibility
  // Calculate y position to align with text baseline (text y is at baseline)
  const bulletY = y + (size * 0.35); // Adjust to center bullet with text
  
  // Draw filled circle for bullet point
  page.drawCircle({
    x: x + bulletRadius,
    y: bulletY,
    size: bulletRadius,
    color: color,
  });
}

// Helper to draw text with bold segments (markdown **bold**)
export function drawTextWithBold(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  fontBold: PDFFont,
  size: number,
  color: RGB
) {
  // Split by ** for bold
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  let offsetX = x;
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      page.drawText(content, { x: offsetX, y, size, font: fontBold, color });
      offsetX += fontBold.widthOfTextAtSize(content, size);
    } else {
      page.drawText(part, { x: offsetX, y, size, font, color });
      offsetX += font.widthOfTextAtSize(part, size);
    }
  }
}

// Color constants
export const COLORS = {
  BLACK: rgb(0, 0, 0),
  MEDIUM_GRAY: rgb(0.4, 0.4, 0.4),
  LIGHT_GRAY: rgb(0.6, 0.6, 0.6),
  DARK_GRAY: rgb(0.3, 0.3, 0.3),
};

