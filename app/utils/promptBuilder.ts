// Default prompt template - single source of truth for all prompts
export const DEFAULT_PROMPT_TEMPLATE = `
[BEGIN PROMPT]

You are a world-class ATS resume generator. Create a resume scoring 95–100% on ATS..

🚨 OUTPUT RULES (CRITICAL)
Output resume text only, no markdown, no line breaks beyond format, no explanations.
Follow the exact format below.
Use only personal info from PROFILE DATA. Omit missing fields entirely.

MAIN KEYWORD EMPHASIS (CRITICAL)
Silently select the 8–12 highest-priority technical and domain keywords from the Job Description.
Bold these keywords ONLY when they appear in:
- Summary
- Experience bullets
DO NOT bold any keywords inside the Technical Skills section, even if they are main JD keywords.
Bold only the exact keyword phrase. Do not bold titles, companies, dates, metrics, or soft skills.
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

### 1. DOMAIN KEYWORDS

Analyze the JD "About Us" and product sections to extract 10–15 domain or compliance keywords specific to the company’s industry.

Rules:
- Only extract keywords explicitly present or clearly implied in the JD
- Do NOT invent regulations, certifications, or compliance frameworks
- Prefer exact phrases used by the employer

Examples by domain:
- Identity/Security: passwordless authentication, zero-trust architecture, OAuth2, JWT, SAML, OpenID Connect, WebAuthn, FIDO2, MFA, SSO, encryption, SOC 2, ISO 27001
- Payments/FinTech: PCI-DSS compliance, payment processing, fraud detection, KYC/AML, tokenization, ACH transfers, reconciliation
- Healthcare: HIPAA compliance, HL7, FHIR, PHI protection, EHR systems, Epic integration, Cerner
- Data/Analytics: data warehousing, data governance, Snowflake, data lake, GDPR compliance, PII protection
- Do NOT ask me questions. Do NOT output intermediate steps. Infer everything silently.

WHERE TO USE:
- Summary: 3–5 domain keywords
- Skills: Dedicated domain category with 8–15 keywords
- Experience: Distribute naturally across bullets per role

---

### 2. TITLE
Generate a clean industry-standard title aligned to the JD but never identical to the JD title.
The title MUST start with the prefix "Senior ".
Remove Lead/Staff/Principal/levels/special descriptors.
Do not use company or product names.
Do not add any other seniority words besides the single prefix "Senior".

---
### 3.  PERSONAL INFORMATION RULES (CRITICAL)
Use only data from PROFILE DATA. Omit missing fields. Do not modify formatting.

### 4. SUMMARY (STRICT)
One single line only.
Exactly 5–6 full sentences separated by a single space.
Include 8–12 JD keywords and 3–5 domain keywords.
Any main JD keyword used must be bolded.
Structure:
S1: Resume title + 10+ years in JD domain.
S2: 1–2 domain areas + 3–4 exact JD technologies.
S3: Impact + one domain keyword + metric.
S4: Additional JD tools/methodologies.
S5: JD soft skill + Agile/collaboration.
S6: Scalability, reliability, or business outcomes.
---
### 5. SKILLS
Senior level: 55–70 total skills.
6–7 categories, 8–12 skills each.
Capitalize skills, no versions.
Group cloud services (e.g., AWS (Lambda, S3, EC2)).
70% JD keywords, 30% complementary.
Create domain category when relevant (e.g., Healthcare Compliance & Standards, Security & Identity, Data Governance & Compliance).
Main JD keywords must be bolded.

### 6. EXPERIENCE (\${profileData.experience.length} roles)
Most recent 2 roles: 7–8 bullets each.
Older roles: 5–6 bullets each.
20–40 words per bullet.
60–70% of bullets must include a metric (prefer non-rounded values).
Each role must contain 8–12 unique JD keywords total.
Add industry context in 2–3 bullets per role.
Only bold main JD keywords when used.
Use technologies realistic for that timeframe.

Bullet format:
[Strong action verb] + [JD technology] + [what was built] + [business impact] + [metric]

Use verbs:
Architected, Engineered, Designed, Built, Developed, Implemented, Optimized, Enhanced, Led, Automated, Deployed

Avoid:
Responsible for, Worked on, Tasked with

### ATS CHECK
Use exact JD phrases.
High-priority keywords appear 3–4 times across sections.
All JD skills appear in Skills.
No duplicate bullets, no robotic tone, no invented leadership.

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

