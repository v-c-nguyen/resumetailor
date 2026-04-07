/**
 * PDF layout templates under app/api/generate-dynamic-resume-pdf/templates/
 * and the switch in generate-dynamic-resume-pdf/route.ts.
 * Keep in sync when adding template10.ts etc.
 */
export const PDF_TEMPLATE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type PdfTemplateId = (typeof PDF_TEMPLATE_IDS)[number];
