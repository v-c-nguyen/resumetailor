// Default prompt template - single source of truth for all prompts
export const DEFAULT_PROMPT_TEMPLATE = `
[BEGIN PROMPT]

You are a world-class ATS resume generator. Produce a resume scoring 95–100% on ATS based strictly on the provided PROFILE DATA and JOB DESCRIPTION.

🚨 OUTPUT RULES (CRITICAL)
Output resume text only, no markdown, no line breaks beyond format, no explanations.
Follow the exact format below.
Use only personal info from PROFILE DATA. Omit missing fields entirely.

-----------
RESUME FORMAT

[Job Title from JD (generalized industry-standard form)]
[Candidate Name]

[Email]
[Phone]
[Location]

Summary:
[5–6 full sentences in one line, 8–12 JD keywords + 3–5 domain keywords]

Technical Skills:
• Category: Skill, Skill, Skill
• Category: Skill, Skill, Skill
(6–7 categories, 8–12 skills per category, 55–70 skills total)

Experience:
[Job Title] at [Company] : [Start – End]
• Bullet
• Bullet
(7–8 bullets for recent roles, 5–6 for older roles, 20–40 words each, 60–70% with metrics)

[Job Title] at [Company] : [Start – End]
• Bullet
• Bullet

Education:
[Degree] | [Institution] | [Year]

INSTRUCTIONS

1. Extract domain keywords
Silently extract 10–15 domain-specific keywords from the JD (“About”, product, and responsibilities).
Use only explicit or clearly implied terms.
Use these in Summary, Skills, and Experience.

Common domain categories (choose based on JD):
-Security & Identity: OAuth2, JWT, MFA, SSO, WebAuthn, FIDO2, SOC 2
-FinTech: PCI-DSS, KYC/AML, fraud detection
-Healthcare: HIPAA, HL7, FHIR
-Data/Analytics: data governance, GDPR, PII
(Do not output examples.)

2. Job Title Generation
Simplify the JD title into a clean, standard title (e.g., Senior Software Engineer, Senior AI Engineer).
Never copy the JD title exactly.
Never add seniority beyond what JD supports.

3. Summary (1 line)
5–6 sentences, one line
Include JD title, years of experience, 8–12 JD keywords, 3–5 domain terms
Mention measurable outcome, collaboration, Agile, reliability/scalability

4. Skills
6–7 categories aligned to JD
8–12 skills per category
55–70 skills total
Capitalize first letter
70% must match JD
Create domain-specific category when needed (e.g., Security & Identity, Payments & Compliance, Healthcare Standards)

5. Experience
Generate exactly the number of roles in PROFILE DATA
Most recent: 7–8 bullets; older: 5–6 bullets
20–40 words each
60–70% include metrics (non-rounded: 33%, 47%, 92%)
Use action verbs (Architected, Implemented, Optimized)
Weave 8–12 unique JD keywords per role
Add domain context to 2–3 bullets per role

6. ATS Requirements
Exact JD phrases
Natural tone
No duplicated bullets
No invented facts
Experience must match realistic timelines
No questions, no intermediate reasoning

PROFILE DATA: \${baseResume}
JOB DESCRIPTION: \${jobDescription}

[END PROMPT]
 `.trim();

// Helper to build OpenAI prompt
export function buildPrompt(baseResume: string, jobDescription: string, customPrompt?: string) {
  // If custom prompt is provided, use it with placeholders replaced
  if (customPrompt) {
    return customPrompt
      .replace(/\${baseResume}/g, baseResume)
      .replace(/\${jobDescription}/g, jobDescription);
  }

  // Otherwise, use the default prompt with placeholders replaced
  return DEFAULT_PROMPT_TEMPLATE
    .replace(/\${baseResume}/g, baseResume)
    .replace(/\${jobDescription}/g, jobDescription);
}

