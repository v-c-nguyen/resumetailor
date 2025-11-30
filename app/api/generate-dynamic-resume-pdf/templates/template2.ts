import { PDFPage, rgb } from 'pdf-lib';
import { TemplateContext, wrapText, wrapTextWithIndent, formatDate, drawTextWithBold, COLORS } from '../utils';

// Professional Body Content Renderer with Section Parsing
function renderBodyContentTemplateModern(
  context: TemplateContext,
  y: number,
  left: number,
  contentWidth: number,
  bodySize: number,
  bodyLineHeight: number,
  sectionHeaderSize: number,
  sectionLineHeight: number,
  marginBottom: number,
  titleToExclude?: string
): number {
  const { font, fontBold, body, PAGE_HEIGHT, PAGE_WIDTH, pdfDoc } = context;
  const BLACK = COLORS.BLACK;
  const MEDIUM_GRAY = rgb(0.4, 0.4, 0.4);
  const PROFESSIONAL_BLUE = rgb(0.2, 0.3, 0.5);

  // Parse body into sections
  if (!body || typeof body !== 'string') {
    return y; // Return early if body is invalid
  }
  
  const bodyLines = body.split('\n');
  const sections: { [key: string]: string[] } = {
    'Professional Summary': [],
    'Technical Skills': [],
    'Experience': [],
    'Education': []
  };

  let currentSection: string | null = null;
  const sectionMapping: { [key: string]: string } = {
    'summary': 'Professional Summary',
    'professional summary': 'Professional Summary',
    'skills': 'Technical Skills',
    'technical skills': 'Technical Skills',
    'experience': 'Experience',
    'professional experience': 'Experience',
    'education': 'Education'
  };

  for (let i = 0; i < bodyLines.length; i++) {
    const line = bodyLines[i].trim();
    if (!line) continue;

    // Check if line is a section header
    if (line.endsWith(':')) {
      const headerKey = line.slice(0, -1).toLowerCase();
      currentSection = sectionMapping[headerKey] || null;
      continue;
    }

    // Skip if this line matches the extracted title (to avoid duplication)
    if (titleToExclude && line === titleToExclude) {
      continue;
    }

    // Add line to current section
    if (currentSection && sections[currentSection] !== undefined) {
      sections[currentSection].push(line);
    } else if (!currentSection) {
      // If no section identified yet, assume it's summary
      sections['Professional Summary'].push(line);
    }
  }

  // Render sections in order: Professional Summary, Technical Skills, Experience, Education
  const sectionOrder = ['Professional Summary', 'Technical Skills', 'Experience', 'Education'];

  for (const sectionName of sectionOrder) {
    const sectionContent = sections[sectionName];
    if (!sectionContent || sectionContent.length === 0) continue;

    // Add spacing before section
    y -= 20;

    // Check for page break before section header
    if (y < marginBottom + 60) {
      context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - 72;
    }

    // Draw section header with underline
    const headerLines = wrapText(sectionName, fontBold, sectionHeaderSize, contentWidth);
    for (const h of headerLines) {
      if (y < marginBottom) {
        context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - 72;
      }
      context.page.drawText(h, {
        x: left,
        y,
        size: sectionHeaderSize,
        font: fontBold,
        color: PROFESSIONAL_BLUE
      });
      y -= sectionLineHeight;
    }

    // Draw underline for section header
    y -= 4;
    if (y < marginBottom) {
      context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - 72;
    }
    context.page.drawLine({
      start: { x: left, y: y },
      end: { x: left + contentWidth, y: y },
      thickness: 2,
      color: PROFESSIONAL_BLUE
    });
    y -= 16;

    // Render section content
    let firstJob = true;
    for (let i = 0; i < sectionContent.length; i++) {
      const line = sectionContent[i].trim();
      if (!line) {
        y -= 8;
        continue;
      }

      // Check for job experience format: "Job Title at Company: Period"
      const isJob = / at .+:.+/.test(line);
      if (isJob && sectionName === 'Experience') {
        const match = line.match(/^(.+?) at (.+?):\s*(.+)$/);
        if (match) {
          const [, jobTitle, companyName, period] = match;

          if (!firstJob) y -= 14;
          firstJob = false;

          // Job Title
          const titleLines = wrapText(jobTitle.trim(), fontBold, bodySize + 1, contentWidth);
          for (const t of titleLines) {
            if (y < marginBottom) {
              context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
              y = PAGE_HEIGHT - 72;
            }
            context.page.drawText(t, {
              x: left,
              y,
              size: bodySize + 1,
              font: fontBold,
              color: BLACK
            });
            y -= bodyLineHeight;
          }

          // Company + Period
          const formattedPeriod = formatDate(period.trim());
          const row = `${companyName.trim()}  |  ${formattedPeriod}`;
          const rowLines = wrapText(row, font, bodySize, contentWidth);

          for (const r of rowLines) {
            if (y < marginBottom) {
              context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
              y = PAGE_HEIGHT - 72;
            }
            context.page.drawText(r, {
              x: left,
              y,
              size: bodySize,
              font,
              color: MEDIUM_GRAY
            });
            y -= bodyLineHeight;
          }

          y -= 8;
          continue;
        }
      }

      // Regular content (bullets, text)
      const wrapped = wrapTextWithIndent(line, font, bodySize, contentWidth);
      for (let j = 0; j < wrapped.lines.length; j++) {
        if (y < marginBottom) {
          context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          y = PAGE_HEIGHT - 72;
        }

        const xPos = j === 0 ? left : left + wrapped.indentWidth;
        drawTextWithBold(context.page, wrapped.lines[j], xPos, y, font, fontBold, bodySize, BLACK);
        y -= bodyLineHeight;
      }
    }

    // Add spacing after section
    y -= 12;
  }

  return y;
}

// PROFESSIONAL TEMPLATE - Clean design with clear section separation
export async function renderTemplate2(context: TemplateContext): Promise<Uint8Array> {
  const { pdfDoc, page, font, fontBold, name, email, phone, location, body, PAGE_WIDTH, PAGE_HEIGHT } = context;
  const BLACK = COLORS.BLACK;
  const MEDIUM_GRAY = rgb(0.4, 0.4, 0.4);
  const PROFESSIONAL_BLUE = rgb(0.2, 0.3, 0.5);

  const MARGIN_TOP = 50;
  const MARGIN_BOTTOM = 50;
  const MARGIN_LEFT = 60;
  const MARGIN_RIGHT = 60;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  // Extract title from body (look for it in summary section or first non-section line)
  let title = '';
  if (body && typeof body === 'string') {
    const bodyLines = body.split('\n');
    let inSummary = false;
    
    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i].trim();
      if (!line) continue;
      
      // Check if entering summary section
      if (line.toLowerCase().includes('summary') && line.endsWith(':')) {
        inSummary = true;
        continue;
      }
      
      // If we hit another section, stop looking
      if (line.endsWith(':') && !line.toLowerCase().includes('summary')) {
        inSummary = false;
        if (title) break;
      }
      
      // Look for title: short line that's not a bullet, not a job entry, and not a section header
      if (!line.endsWith(':') && !line.startsWith('•') && !line.startsWith('-') && !/ at .+:.+/.test(line)) {
        // Prefer title from summary section, or take first reasonable candidate
        if (line.length < 80 && (inSummary || !title)) {
          title = line;
          if (inSummary) break; // Found in summary, we're done
        }
      }
    }
  }

  let y = PAGE_HEIGHT - MARGIN_TOP;

  // --- HEADER: Name ---
  if (name) {
    const nameLines = wrapText(name, fontBold, 32, CONTENT_WIDTH);
    for (const n of nameLines) {
      page.drawText(n, {
        x: MARGIN_LEFT,
        y,
        size: 32,
        font: fontBold,
        color: BLACK
      });
      y -= 38;
    }
  }

  // --- TITLE ---
  if (title) {
    const titleLines = wrapText(title, font, 14, CONTENT_WIDTH);
    for (const t of titleLines) {
      page.drawText(t, {
        x: MARGIN_LEFT,
        y,
        size: 14,
        font,
        color: MEDIUM_GRAY
      });
      y -= 18;
    }
    y -= 8;
  }

  // --- CONTACT INFORMATION ---
  const contactParts = [location, phone, email].filter(Boolean);
  if (contactParts.length > 0) {
    const contactLine = contactParts.join('  •  ');
    const contactLines = wrapText(contactLine, font, 10, CONTENT_WIDTH);
    for (const c of contactLines) {
      page.drawText(c, {
        x: MARGIN_LEFT,
        y,
        size: 10,
        font,
        color: MEDIUM_GRAY
      });
      y -= 14;
    }
  }

  // Divider line after header
  y -= 16;
  if (y < MARGIN_BOTTOM) {
    // Shouldn't happen at this point, but safety check
    y = PAGE_HEIGHT - 72;
  }
  page.drawLine({
    start: { x: MARGIN_LEFT, y: y },
    end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: y },
    thickness: 1.5,
    color: PROFESSIONAL_BLUE
  });
  y -= 24;

  // --- BODY SECTIONS ---
  y = renderBodyContentTemplateModern(
    context,
    y,
    MARGIN_LEFT,
    CONTENT_WIDTH,
    10.5,
    15,
    13,
    18,
    MARGIN_BOTTOM,
    title
  );

  return await pdfDoc.save();
}
