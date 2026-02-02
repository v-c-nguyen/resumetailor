import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { getBaseResumeByName } from '@/app/data/db';
import { buildPrompt } from '@/app/utils/promptBuilder';
import { parseResume, TemplateContext } from './utils';
import { renderTemplate1 } from './templates/template1';
import { renderTemplate2 } from './templates/template2';
import { renderTemplate3 } from './templates/template3';
import { renderTemplate4 } from './templates/template4';
import { renderTemplate5 } from './templates/template5';
import { renderTemplate6 } from './templates/template6';
import { renderTemplate7 } from './templates/template7';
import { renderTemplate8 } from './templates/template8';
import { renderTemplate9 } from './templates/template9';

// Template router - routes to appropriate template renderer
async function generateResumePdf(resumeText: string, template: number = 1): Promise<Uint8Array> {
  const parsed = parseResume(resumeText);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const context: TemplateContext = {
    pdfDoc,
    page,
    font,
    fontBold,
    headline: parsed.headline,
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    location: parsed.location,
    body: parsed.body,
    PAGE_WIDTH: 595,
    PAGE_HEIGHT: 842
  };

  // Route to appropriate template
  switch (template) {
    case 1:
      return await renderTemplate1(context);
    case 2:
      return await renderTemplate2(context);
    case 3:
      return await renderTemplate3(context);
    case 4:
      return await renderTemplate4(context);
    case 5:
      return await renderTemplate5(context);
    case 6:
      return await renderTemplate6(context);
    case 7:
      return await renderTemplate7(context);
    case 8:
      return await renderTemplate8(context);
    case 9:
      return await renderTemplate9(context);
    default:
      return await renderTemplate5(context);
  }
}

const LOG_PREFIX = '[generate-dynamic-resume-pdf]';

export async function POST(req: NextRequest) {
  try {
    console.log(LOG_PREFIX, '1. Parsing form data...');
    const formData = await req.formData();
    const jobDescription = formData.get('job_description') as string;
    const company = formData.get('company') as string;
    const role = formData.get('role') as string;
    const baseResumeProfile = formData.get('base_resume_profile') as string | null;
    console.log(LOG_PREFIX, '1. Done. profile:', baseResumeProfile, 'company:', company, 'role:', role);

    // Validate required fields
    if (!jobDescription) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: job_description' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Load base resume based on selected profile, fallback to default embedded
    console.log(LOG_PREFIX, '2. Loading profile from DB...');
    const profile = await getBaseResumeByName(baseResumeProfile);
    const baseResume: string = profile?.resumeText || ``;
    const customPrompt = profile?.customPrompt;
    const pdfTemplate = profile?.pdfTemplate || 1;
    console.log(LOG_PREFIX, '2. Done. baseResume length:', baseResume?.length ?? 0, 'pdfTemplate:', pdfTemplate);

    // 3. Tailor resume with OpenAI
    console.log(LOG_PREFIX, '3. Building prompt and calling OpenAI...');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = buildPrompt(baseResume, jobDescription, customPrompt);

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_VERSION || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for creating professional resume content.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 15000,
    });

    const tailoredResume = completion.choices[0].message.content || '';
    console.log(LOG_PREFIX, '3. OpenAI done. tailoredResume length:', tailoredResume?.length ?? 0);
    if (!tailoredResume) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to generate tailored resume content' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Generate PDF with template
    console.log(LOG_PREFIX, '4. Generating PDF (template:', pdfTemplate, ')...');
    const pdfBytes = await generateResumePdf(tailoredResume, pdfTemplate);
    console.log(LOG_PREFIX, '4. PDF generated. size:', pdfBytes?.length ?? 0);

    // 5. Return PDF as response
    const sanitize = (v: string | null) => {
      if (!v) return '';
      return v.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_'); // Replace special chars and collapse multiple underscores
    };

    const fileBase = [
      baseResumeProfile,
      company,
      role
    ]
      .map(sanitize)
      .filter(v => v && v.trim().length > 0) // Remove empty strings after sanitization
      .join('_')
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .trim() || 'resume'; // Trim any whitespace, default to 'resume' if empty

    // Ensure filename ends with .pdf (not .pdf_) - clean and construct properly
    // Remove .pdf from fileBase if it already exists, then add .pdf cleanly
    const cleanFileBase = fileBase.replace(/\.pdf.*$/, ''); // Remove .pdf and anything after if it exists
    const filename = `${cleanFileBase}.pdf`.replace(/\.pdf_+$/, '.pdf'); // Ensure it ends with .pdf, not .pdf_

    console.log(LOG_PREFIX, '5. Returning PDF response.');
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename.replace(/"/g, '\\"')}"`
      }
    });
  } catch (error) {
    console.error(LOG_PREFIX, 'ERROR:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error(LOG_PREFIX, 'Stack:', error.stack);
    }
    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
