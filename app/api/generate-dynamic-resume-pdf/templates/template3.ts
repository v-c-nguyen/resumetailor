import { PDFPage, rgb } from 'pdf-lib';
import { TemplateContext, wrapText, wrapTextWithIndent, formatDate, drawTextWithBold, COLORS } from '../utils';

// Template 3 Body Content Renderer - Modern style with right-side accent and header panels
function renderBodyContentTemplate3(
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
  const CORAL = rgb(0.9, 0.4, 0.3); // Coral accent color
  const LIGHT_CORAL = rgb(0.98, 0.92, 0.90); // Light coral background
  
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
          // Draw right-side accent stripe on new pages
          context.page.drawRectangle({
            x: PAGE_WIDTH - 25,
            y: 0,
            width: 25,
            height: PAGE_HEIGHT,
            color: CORAL,
          });
          y = PAGE_HEIGHT - 72;
        }
        
        // Draw background panel for section header
        const textWidth = fontBold.widthOfTextAtSize(sectionLine, sectionHeaderSize);
        const panelPadding = 6;
        const panelHeight = sectionHeaderSize + (panelPadding * 2);
        
        context.page.drawRectangle({
          x: left,
          y: y - panelPadding,
          width: textWidth + (panelPadding * 2),
          height: panelHeight,
          color: LIGHT_CORAL,
        });
        
        // Section header text
        context.page.drawText(sectionLine, { 
          x: left + panelPadding, 
          y, 
          size: sectionHeaderSize, 
          font: fontBold, 
          color: CORAL 
        });
        
        y -= panelHeight + 2;
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
          
          // Job title (bold, coral color)
          const titleLines = wrapText(jobTitle.trim(), fontBold, bodySize + 2, contentWidth - 20);
          for (const titleLine of titleLines) {
            if (y < marginBottom) {
              context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
              context.page.drawRectangle({
                x: PAGE_WIDTH - 25,
                y: 0,
                width: 25,
                height: PAGE_HEIGHT,
                color: CORAL,
              });
              y = PAGE_HEIGHT - 72;
            }
            drawTextWithBold(context.page, titleLine, left + 20, y, font, fontBold, bodySize + 2, CORAL);
            y -= bodyLineHeight + 2;
          }
          
          // Company and period combined
          const formattedPeriod = formatDate(period.trim());
          const companyPeriodLine = `${companyName.trim()}  •  ${formattedPeriod}`;
          const companyPeriodLines = wrapText(companyPeriodLine, font, bodySize, contentWidth - 20);
          for (const line of companyPeriodLines) {
            if (y < marginBottom) {
              context.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
              context.page.drawRectangle({
                x: PAGE_WIDTH - 25,
                y: 0,
                width: 25,
                height: PAGE_HEIGHT,
                color: CORAL,
              });
              y = PAGE_HEIGHT - 72;
            }
            drawTextWithBold(context.page, line, left + 20, y, font, fontBold, bodySize, MEDIUM_GRAY);
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
                x: PAGE_WIDTH - 25,
                y: 0,
                width: 25,
                height: PAGE_HEIGHT,
                color: CORAL,
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
                x: PAGE_WIDTH - 25,
                y: 0,
                width: 25,
                height: PAGE_HEIGHT,
                color: CORAL,
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
        x: PAGE_WIDTH - 25,
        y: 0,
        width: 25,
        height: PAGE_HEIGHT,
        color: CORAL,
      });
      y = PAGE_HEIGHT - 72;
    }
  }
  
  return y;
}

// MODERN TEMPLATE - Right-side accent stripe with header panel and coral color scheme
export async function renderTemplate3(context: TemplateContext): Promise<Uint8Array> {
  const { pdfDoc, page, font, fontBold, name, email, phone, location, PAGE_WIDTH, PAGE_HEIGHT } = context;
  const BLACK = COLORS.BLACK;
  const MEDIUM_GRAY = COLORS.MEDIUM_GRAY;
  const CORAL = rgb(0.9, 0.4, 0.3); // Coral accent color
  const LIGHT_CORAL = rgb(0.98, 0.92, 0.90); // Light coral background
  
  const MARGIN_TOP = 50;
  const MARGIN_BOTTOM = 50;
  const MARGIN_LEFT = 50;
  const MARGIN_RIGHT = 75; // Extra margin for right accent stripe
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  
  const NAME_SIZE = 26;
  const CONTACT_SIZE = 9;
  const SECTION_HEADER_SIZE = 13;
  const BODY_SIZE = 9.5;
  
  // Draw right-side vertical accent stripe
  page.drawRectangle({
    x: PAGE_WIDTH - 25,
    y: 0,
    width: 25,
    height: PAGE_HEIGHT,
    color: CORAL,
  });
  
  let y = PAGE_HEIGHT - MARGIN_TOP;
  const left = MARGIN_LEFT;
  const right = PAGE_WIDTH - MARGIN_RIGHT;
  
  // Header panel with name and contact info
  const headerPanelHeight = 80;
  const headerPanelY = PAGE_HEIGHT - headerPanelHeight;
  
  // Draw header panel background
  page.drawRectangle({
    x: 0,
    y: headerPanelY,
    width: PAGE_WIDTH - 24, // Don't cover the accent stripe
    height: headerPanelHeight,
    color: LIGHT_CORAL,
  });
  
  // Name in header panel (coral color, bold)
  if (name) {
    const nameLines = wrapText(name, fontBold, NAME_SIZE, CONTENT_WIDTH);
    let nameY = PAGE_HEIGHT - 35;
    for (const line of nameLines) {
      page.drawText(line, { 
        x: left, 
        y: nameY, 
        size: NAME_SIZE, 
        font: fontBold, 
        color: CORAL 
      });
      nameY -= NAME_SIZE * 0.85;
    }
  }
  
  // Contact info in header panel (below name, smaller, gray)
  const contactParts = [location, phone, email].filter(Boolean);
  if (contactParts.length > 0) {
    const contactLine = contactParts.join('  •  ');
    const contactLines = wrapText(contactLine, font, CONTACT_SIZE, CONTENT_WIDTH);
    let contactY = PAGE_HEIGHT - 65;
    for (const line of contactLines) {
      page.drawText(line, { 
        x: left, 
        y: contactY, 
        size: CONTACT_SIZE, 
        font, 
        color: MEDIUM_GRAY 
      });
      contactY -= CONTACT_SIZE * 1.3;
    }
  }
  
  // Start body content below header panel
  y = PAGE_HEIGHT - headerPanelHeight - 30;
  
  // Render body content
  y = renderBodyContentTemplate3(
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
