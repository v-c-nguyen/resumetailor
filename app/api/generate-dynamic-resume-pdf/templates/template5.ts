import { PDFPage, rgb } from 'pdf-lib';
import { TemplateContext, wrapText, wrapTextWithIndent, formatDate, drawTextWithBold, COLORS } from '../utils';

// Template 5 Body Content Renderer - Structured style with top/bottom borders
function renderBodyContentTemplate5(
  context: TemplateContext,
  y: number,
  left: number,
  right: number,
  contentWidth: number,
  bodySize: number,
  bodyLineHeight: number,
  sectionHeaderSize: number,
  sectionLineHeight: number,
  marginBottom: number
): number {
  const { font, fontBold, body, PAGE_HEIGHT, PAGE_WIDTH, pdfDoc } = context;
  const BLACK = COLORS.BLACK;
  const MEDIUM_GRAY = COLORS.MEDIUM_GRAY;
  const BURGUNDY = rgb(0.5, 0.1, 0.2); // Burgundy/wine red accent
  const LIGHT_BURGUNDY = rgb(0.98, 0.95, 0.96); // Light burgundy background
  
  const bodyLines = body.split('\n');
  let firstJob = true;
  
  for (let i = 0; i < bodyLines.length; i++) {
    const line = bodyLines[i].trim();
    if (!line) {
      y -= 6;
      continue;
    }
    
    if (line.endsWith(':')) {
      y -= 16;
      const sectionHeader = line.slice(0, -1);
      const sectionLines = wrapText(sectionHeader, fontBold, sectionHeaderSize, contentWidth - 30);
      
      for (const sectionLine of sectionLines) {
        if (y < marginBottom) {
          context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          // Draw top and bottom borders on new pages
          context.page.drawRectangle({
            x: 0,
            y: PAGE_HEIGHT - 15,
            width: PAGE_WIDTH,
            height: 15,
            color: BURGUNDY,
          });
          context.page.drawRectangle({
            x: 0,
            y: 0,
            width: PAGE_WIDTH,
            height: 15,
            color: BURGUNDY,
          });
          y = PAGE_HEIGHT - 72;
        }
        
        // Section header with burgundy background box
        const textWidth = fontBold.widthOfTextAtSize(sectionLine, sectionHeaderSize);
        const boxPadding = 5;
        const boxWidth = textWidth + (boxPadding * 2);
        const boxHeight = sectionHeaderSize + (boxPadding * 2);
        
        // Background box
        context.page.drawRectangle({
          x: left,
          y: y - boxPadding,
          width: boxWidth,
          height: boxHeight,
          color: LIGHT_BURGUNDY,
        });
        
        // Border around box (draw lines for border)
        const boxX = left;
        const boxY = y - boxPadding;
        // Top border
        context.page.drawLine({
          start: { x: boxX, y: boxY + boxHeight },
          end: { x: boxX + boxWidth, y: boxY + boxHeight },
          thickness: 1,
          color: BURGUNDY,
        });
        // Bottom border
        context.page.drawLine({
          start: { x: boxX, y: boxY },
          end: { x: boxX + boxWidth, y: boxY },
          thickness: 1,
          color: BURGUNDY,
        });
        // Left border
        context.page.drawLine({
          start: { x: boxX, y: boxY },
          end: { x: boxX, y: boxY + boxHeight },
          thickness: 1,
          color: BURGUNDY,
        });
        // Right border
        context.page.drawLine({
          start: { x: boxX + boxWidth, y: boxY },
          end: { x: boxX + boxWidth, y: boxY + boxHeight },
          thickness: 1,
          color: BURGUNDY,
        });
        
        // Section header text
        context.page.drawText(sectionLine, { 
          x: left + boxPadding, 
          y, 
          size: sectionHeaderSize, 
          font: fontBold, 
          color: BURGUNDY 
        });
        
        y -= boxHeight + 12;
      }
    } else {
      const isJobExperience = / at .+:.+/.test(line);
      
      if (isJobExperience) {
        const match = line.match(/^(.+?) at (.+?):\s*(.+)$/);
        if (match) {
          const [, jobTitle, companyName, period] = match;
          
          if (!firstJob) {
            y -= 14;
          }
          firstJob = false;
          
          // Job title (bold, burgundy)
          const titleLines = wrapText(jobTitle.trim(), fontBold, bodySize + 2, contentWidth - 20);
          for (const titleLine of titleLines) {
            if (y < marginBottom) {
              context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
              context.page.drawRectangle({
                x: 0,
                y: PAGE_HEIGHT - 15,
                width: PAGE_WIDTH,
                height: 15,
                color: BURGUNDY,
              });
              context.page.drawRectangle({
                x: 0,
                y: 0,
                width: PAGE_WIDTH,
                height: 15,
                color: BURGUNDY,
              });
              y = PAGE_HEIGHT - 72;
            }
            context.page.drawText(titleLine, { 
              x: left + 20, 
              y, 
              size: bodySize + 2, 
              font: fontBold, 
              color: BURGUNDY 
            });
            y -= bodyLineHeight + 2;
          }
          
          // Company and period
          const formattedPeriod = formatDate(period.trim());
          const companyPeriodLine = `${companyName.trim()}  |  ${formattedPeriod}`;
          const companyPeriodLines = wrapText(companyPeriodLine, font, bodySize, contentWidth - 20);
          for (const line of companyPeriodLines) {
            if (y < marginBottom) {
              context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
              context.page.drawRectangle({
                x: 0,
                y: PAGE_HEIGHT - 15,
                width: PAGE_WIDTH,
                height: 15,
                color: BURGUNDY,
              });
              context.page.drawRectangle({
                x: 0,
                y: 0,
                width: PAGE_WIDTH,
                height: 15,
                color: BURGUNDY,
              });
              y = PAGE_HEIGHT - 72;
            }
            context.page.drawText(line, { 
              x: left + 20, 
              y, 
              size: bodySize, 
              font, 
              color: MEDIUM_GRAY 
            });
            y -= bodyLineHeight;
          }
          
          y -= 8;
        }
      } else {
        const isSkillsCategory = line.startsWith('·');
        if (isSkillsCategory) {
          const categoryName = line.trim();
          const categoryLines = wrapText(categoryName, fontBold, bodySize + 1, contentWidth - 20);
          for (const categoryLine of categoryLines) {
            if (y < marginBottom) {
              context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
              context.page.drawRectangle({
                x: 0,
                y: PAGE_HEIGHT - 15,
                width: PAGE_WIDTH,
                height: 15,
                color: BURGUNDY,
              });
              context.page.drawRectangle({
                x: 0,
                y: 0,
                width: PAGE_WIDTH,
                height: 15,
                color: BURGUNDY,
              });
              y = PAGE_HEIGHT - 72;
            }
            context.page.drawText(categoryLine, { 
              x: left + 20, 
              y, 
              size: bodySize + 1, 
              font: fontBold, 
              color: BLACK 
            });
            y -= bodyLineHeight + 2;
          }
        } else {
          const wrapped = wrapTextWithIndent(line, font, bodySize, contentWidth - 20);
          for (let i = 0; i < wrapped.lines.length; i++) {
            if (y < marginBottom) {
              context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
              context.page.drawRectangle({
                x: 0,
                y: PAGE_HEIGHT - 15,
                width: PAGE_WIDTH,
                height: 15,
                color: BURGUNDY,
              });
              context.page.drawRectangle({
                x: 0,
                y: 0,
                width: PAGE_WIDTH,
                height: 15,
                color: BURGUNDY,
              });
              y = PAGE_HEIGHT - 72;
            }
            const xPos = i === 0 ? left + 20 : left + 20 + wrapped.indentWidth;
            drawTextWithBold(context.page, wrapped.lines[i], xPos, y, font, fontBold, bodySize, BLACK);
            y -= bodyLineHeight;
          }
        }
      }
    }
    
    if (y < marginBottom) {
      context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      context.page.drawRectangle({
        x: 0,
        y: PAGE_HEIGHT - 15,
        width: PAGE_WIDTH,
        height: 15,
        color: BURGUNDY,
      });
      context.page.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: 15,
        color: BURGUNDY,
      });
      y = PAGE_HEIGHT - 72;
    }
  }
  
  return y;
}

// STRUCTURED TEMPLATE - Top and bottom borders with asymmetric layout
export async function renderTemplate5(context: TemplateContext): Promise<Uint8Array> {
  const { pdfDoc, page, font, fontBold, name, email, phone, location, PAGE_WIDTH, PAGE_HEIGHT } = context;
  const BLACK = COLORS.BLACK;
  const MEDIUM_GRAY = COLORS.MEDIUM_GRAY;
  const BURGUNDY = rgb(0.5, 0.1, 0.2); // Burgundy/wine red accent color
  const LIGHT_BURGUNDY = rgb(0.98, 0.95, 0.96); // Light burgundy background
  
  const MARGIN_TOP = 80;
  const MARGIN_BOTTOM = 70; // Extra space for bottom border
  const MARGIN_LEFT = 60;
  const MARGIN_RIGHT = 60;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  
  const NAME_SIZE = 28;
  const CONTACT_SIZE = 9;
  const SECTION_HEADER_SIZE = 13;
  const BODY_SIZE = 9.5;
  
  // Draw top border
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 15,
    width: PAGE_WIDTH,
    height: 15,
    color: BURGUNDY,
  });
  
  // Draw bottom border
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: 15,
    color: BURGUNDY,
  });
  
  let y = PAGE_HEIGHT - MARGIN_TOP;
  const left = MARGIN_LEFT;
  const right = PAGE_WIDTH - MARGIN_RIGHT;
  
  // Name positioned on the right side (asymmetric layout)
  if (name) {
    const nameLines = wrapText(name, fontBold, NAME_SIZE, CONTENT_WIDTH * 0.6);
    for (const line of nameLines) {
      const textWidth = fontBold.widthOfTextAtSize(line, NAME_SIZE);
      // Right-align the name
      const actualX = right - textWidth;
      page.drawText(line, { 
        x: actualX, 
        y, 
        size: NAME_SIZE, 
        font: fontBold, 
        color: BURGUNDY 
      });
      y -= NAME_SIZE * 0.85;
    }
    y -= 12;
  }
  
  // Contact info positioned on the left side (asymmetric)
  const contactParts = [location, phone, email].filter(Boolean);
  if (contactParts.length > 0) {
    const contactLine = contactParts.join('  •  ');
    const contactLines = wrapText(contactLine, font, CONTACT_SIZE, CONTENT_WIDTH * 0.6);
    for (const line of contactLines) {
      page.drawText(line, { 
        x: left, 
        y, 
        size: CONTACT_SIZE, 
        font, 
        color: MEDIUM_GRAY 
      });
      y -= CONTACT_SIZE * 1.3;
    }
    y -= 20;
  }
  
  // Decorative burgundy line separator
  const separatorY = y;
  page.drawLine({
    start: { x: left, y: separatorY },
    end: { x: right, y: separatorY },
    thickness: 1.5,
    color: BURGUNDY,
  });
  y -= 24;
  
  // Render body content
  y = renderBodyContentTemplate5(
    context, 
    y, 
    left, 
    right, 
    CONTENT_WIDTH, 
    BODY_SIZE, 
    BODY_SIZE * 1.5, 
    SECTION_HEADER_SIZE, 
    SECTION_HEADER_SIZE * 1.4, 
    MARGIN_BOTTOM
  );
  
  return await pdfDoc.save();
}
