import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PDF_TEMPLATE_IDS } from '@/lib/pdfTemplateIds';

// Helper to verify admin session
function isAuthenticated(req: NextRequest): boolean {
  const sessionToken = req.cookies.get('admin_session');
  return !!sessionToken;
}

// GET - Fetch all available templates from the templates folder with usage counts
export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get usage counts from database
    const profileCounts = await prisma.profile.groupBy({
      by: ['pdfTemplate'],
      _count: {
        pdfTemplate: true,
      },
    });

    const countMap = new Map<number, number>();
    profileCounts.forEach((item) => {
      countMap.set(item.pdfTemplate, item._count.pdfTemplate);
    });

    // Fixed list so admin always shows every template (avoids readdir gaps on some hosts)
    const templates = PDF_TEMPLATE_IDS.map((value) => ({
      value,
      label: `Template${value}`,
      usageCount: countMap.get(value) || 0,
    }));

    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to read templates', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

