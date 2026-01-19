'use client';
import { useState, useEffect } from 'react';
import { BaseResumeProfile } from '@/app/data/baseResumes';

interface ProfileEditorProps {
  profiles: BaseResumeProfile[];
  onUpdate: () => void;
}

interface TemplateOption {
  value: number;
  label: string;
  usageCount?: number;
}

export default function ProfileEditor({ profiles, onUpdate }: ProfileEditorProps) {
  const [selectedProfileName, setSelectedProfileName] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<BaseResumeProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pdfTemplates, setPdfTemplates] = useState<TemplateOption[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Default resume text template
  const defaultResumeText = `Candidate: Name
Contact: Email | Phone Number | Location | Linkedin
Experience: 10 years

WORK HISTORY:
Job title at Company2, Location: MM/YYYY – MM/YYYY(OR Present)
Job title at Company1, Location: MM/YYYY – MM/YYYY(OR Present)

EDUCATION:
Degree | Institute | Period
`;

  // Default prompt template
  const defaultPromptTemplate = `
You are a world-class ATS optimization expert. Create a resume that scores 95–100% on ATS.

🚨 CRITICAL OUTPUT:
Return ONLY a clean, professional resume text, not markdown, no line breaks, no markdown formatting.
- Use the **exact format shown below** (do not add extra lines, separators, or JSON formatting).
- Do NOT include explanations, comments, or any text outside the resume.
---
### Required Format:
[Job Title from JD]
[Candidate Name]

[Email]
[Phone]
[Location]

Summary:
[5–6 line professional summary with domain and JD keywords]

Technical Skills:
• Category: Skill, Skill, Skill
• Category: Skill, Skill, Skill

Experience:
[Job Title] at [Company] : [Start Date] – [End Date]
• Bullet
• Bullet

[Job Title] at [Company] : [Start Date] – [End Date]
• Bullet
• Bullet

Education:
[Degree] | [Institution] | [Year]

## INSTRUCTIONS:

### 1. EXTRACT DOMAIN KEYWORDS (Critical for high ATS score)

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

Generate a clean, standard industry resume headline that reflects the role described in the Job Description, **but never copy the JD title exactly**.

Rules:
- Use a natural, widely recognized title (e.g., Senior Software Engineer, Senior Full Stack Engineer, Senior AI Engineer, Senior ML Engineer,Senior Backend Engineer, Senior QA Engineer).
- Standardize or simplify the JD title by removing modifiers such as “Lead”, “Principal”, “Staff”, “Applied”, “Specialist”, “I/II/III”, “Seniority codes”, or uncommon descriptors.
- If the JD title is overly specific or niche, generalize it into a common industry equivalent.
- Ensure the headline matches the JD’s domain and responsibilities, but is **not identical in wording**.
- Avoid adding seniority that is not clearly supported by the JD.
- Avoid generating titles with company-specific or product-specific language.

Examples (do NOT output examples in the resume):
- “Applied AI Engineer” → Senior AI Engineer  
- “Machine Learning Specialist” → Senior Machine Learning Engineer  
- “Full Stack Engineer II” → Senior Full Stack Engineer  
- “Backend API Developer” → Senior Backend Engineer  
- “Senior Staff Software Developer” → Senior Software Engineer  

---
### 3.  PERSONAL INFORMATION RULES (CRITICAL)
- Use **only** the personal details provided in **PROFILE DATA**.
- If a field is missing or blank, **omit it entirely**. Do not create, guess, or infer any missing information.
- Do not fabricate emails, phone numbers, locations, or formatting variations.
- Output the candidate’s name, email, phone, and location **exactly as provided** and only if they exist.

Examples (do not output examples in the resume):
- Missing phone → no phone line  
- Missing location → no location line
---

### 3. SUMMARY (5–6 lines)

Include 8–12 JD keywords and 3–5 domain keywords total.

Formatting Rules (STRICT): 
- Write the entire summary on **one single line** 
- Use **5–6 full sentences** 
- Separate sentences using **a single space only** 
- Do NOT insert line breaks or bullet points 
- Do NOT use semicolons to replace sentence structure  

Structure:
- Line 1: JD title with {yearsOfExperience}+ years in JD domain
- Line 2: Expertise in 1–2 domain areas + 3–4 exact JD technologies
- Line 3: Proven impact with 1 domain keyword and a measurable outcome
- Line 4: Proficiency in additional JD tools or methodologies
- Line 5: Soft skill from JD + collaboration or Agile context
- Line 6: Focus on scalability, reliability, or business outcomes

---

### 4. SKILLS

Total skills by seniority:
- Junior/Mid: 40–55
- Senior: 55–70
- Staff/Principal: 50–65 (favor depth over breadth)

Rules:
- 6–7 categories aligned to JD focus
- 8–12 skills per category
- Capitalize first letter of each skill
- No version spam
- Group cloud services (e.g., AWS (Lambda, S3, EC2))
- 70% JD keywords, 30% complementary skills
- Categories must be technically correct

Create domain-specific category when relevant:
- FinTech → Payment & Compliance
- Healthcare → Healthcare Compliance & Standards
- Security → Security & Identity
- Data → Data Governance & Compliance

---

### 5. EXPERIENCE ({profileData.experience.length} roles)

Requirements:
- Generate exactly {profileData.experience.length} roles
- Most recent roles: 7–8 bullets
- Older roles: 5–6 bullets
- 20–40 words per bullet
- At least 60–70% of bullets must include a metric
- Prefer non-rounded percentages (33%, 47%, 92%).
- Remaining bullets should emphasize scope, ownership, architecture, or leadership
- Across each role, include 8–12 unique JD keywords total
- Do NOT force multiple JD keywords into a single bullet if it reduces readability
- Ensure all technologies listed were realistically available during that role’s timeframe
- Add industry context to 2–3 bullets per role

Bullet structure:
[Action Verb] + [JD technology] + [what was built] + [business impact] + [metric if applicable]

Use strong action verbs:
Architected, Engineered, Designed, Built, Developed, Implemented, Optimized, Enhanced, Led, Automated, Deployed

Avoid:
Responsible for, Worked on, Tasked with

If employer industry is unknown, default to JD company’s industry or “SaaS platform”.

---

### ATS OPTIMIZATION CHECKLIST

- Use EXACT JD phrases (no synonyms)
- High-priority keywords appear 3–4 times across Summary, Skills, and Experience
- All required and preferred JD skills appear in Skills
- No duplicated bullets or near-identical bullet structures across roles
- No repeated metric phrasing
- Natural, human-written tone (not robotic)
- Do NOT fabricate leadership scope or people management
- If JD is vague, infer responsibilities only when consistent with candidate’s experience

PROFILE DATA: \${baseResume}
Job description: \${jobDescription}

`.trim();

   // Fetch templates on component mount
   useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/admin/templates');
        if (response.ok) {
          const data = await response.json();
          if (data.templates && Array.isArray(data.templates)) {
            setPdfTemplates(data.templates);
          }
        } else {
          console.error('Failed to fetch templates:', response.statusText);
          // Fallback to default templates if API fails
          setPdfTemplates([
            { value: 2, label: 'Template2' },
            { value: 3, label: 'Template3' },
            { value: 4, label: 'Template4' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        // Fallback to default templates if API fails
        setPdfTemplates([
          { value: 2, label: 'Template2' },
          { value: 3, label: 'Template3' },
          { value: 4, label: 'Template4' },
        ]);
      } finally {
        setTemplatesLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileName) {
      setSelectedProfileName(profiles[0].name);
    }
  }, [profiles, selectedProfileName]);

  const selectedProfile = profiles.find(p => p.name === selectedProfileName);

  const handleCreate = () => {
    setEditingProfile({
      name: '',
      resumeText: defaultResumeText,
      customPrompt: undefined,
      pdfTemplate: pdfTemplates.length > 0 ? pdfTemplates[0].value : 1
    });
    setIsCreating(true);
    setError('');
    setSelectedProfileName(null);
  };

  const handleEdit = (profile: BaseResumeProfile) => {
    setEditingProfile({ ...profile });
    setIsCreating(false);
    setError('');
    setSelectedProfileName(profile.name);
  };

  const handleSave = async () => {
    if (!editingProfile) return;

    if (!editingProfile.name.trim() || !editingProfile.resumeText.trim()) {
      setError('Name and Resume Text are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = '/api/admin/profiles';
      const method = isCreating ? 'POST' : 'PUT';
      const body = isCreating
        ? {
            name: editingProfile.name,
            resumeText: editingProfile.resumeText,
            customPrompt: editingProfile.customPrompt || undefined,
            pdfTemplate: editingProfile.pdfTemplate || (pdfTemplates.length > 0 ? pdfTemplates[0].value : 1)
          }
        : {
            oldName: profiles.find(p => p.name === editingProfile.name)?.name || editingProfile.name,
            name: editingProfile.name,
            resumeText: editingProfile.resumeText,
            customPrompt: editingProfile.customPrompt || undefined,
            pdfTemplate: editingProfile.pdfTemplate || (pdfTemplates.length > 0 ? pdfTemplates[0].value : 1)
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
        setEditingProfile(null);
        setIsCreating(false);
        setSelectedProfileName(editingProfile.name);
        onUpdate();
        // Refresh template counts after profile update
        const templatesResponse = await fetch('/api/admin/templates');
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          if (templatesData.templates && Array.isArray(templatesData.templates)) {
            setPdfTemplates(templatesData.templates);
          }
        }
      } else {
        setError(data.error || 'Failed to save profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/profiles?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteConfirm(null);
        if (selectedProfileName === name) {
          setSelectedProfileName(null);
        }
        onUpdate();
        // Refresh template counts after profile deletion
        const templatesResponse = await fetch('/api/admin/templates');
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          if (templatesData.templates && Array.isArray(templatesData.templates)) {
            setPdfTemplates(templatesData.templates);
          }
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If editing, show the edit form
  if (editingProfile) {
    const currentPrompt = editingProfile.customPrompt || defaultPromptTemplate;

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {isCreating ? 'Create New Profile' : 'Edit Profile'}
          </h2>
          <button
            onClick={() => {
              setEditingProfile(null);
              setIsCreating(false);
              setError('');
              setSuccess('');
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Basic Info */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Name *
                </label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Text *
                </label>
                <textarea
                  value={editingProfile.resumeText}
                  onChange={(e) => setEditingProfile({ ...editingProfile, resumeText: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-gray-900"
                  placeholder={`{
Candidate: Name
Contact: Email | Phone Number | Location | Linkedin
Experience: 10 years

WORK HISTORY:
Job title at Company2, Location: MM/YYYY – MM/YYYY(OR Present)
Job title at Company1, Location: MM/YYYY – MM/YYYY(OR Present)

EDUCATION:
Degree | Institute | Period

}`}
                />
              </div>
            </div>
          </div>

          {/* PDF Template Selection */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">PDF Template</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF Template
              </label>
              <div className="flex gap-2">
                <select
                  value={editingProfile.pdfTemplate || (pdfTemplates.length > 0 ? pdfTemplates[0].value : 1)}
                  onChange={(e) => {
                    const newTemplate = Number(e.target.value);
                    setEditingProfile({ ...editingProfile, pdfTemplate: newTemplate });
                    setShowPreview(false);
                    setPreviewUrl(null);
                  }}
                  disabled={templatesLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {templatesLoading ? (
                    <option value="">Loading templates...</option>
                  ) : pdfTemplates.length > 0 ? (
                    pdfTemplates.map((template) => (
                      <option key={template.value} value={template.value}>
                        {template.label} {template.usageCount !== undefined ? `(${template.usageCount} ${template.usageCount === 1 ? 'profile' : 'profiles'})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value={1}>Template1 (default)</option>
                  )}
                </select>
                <button
                  onClick={async () => {
                    const template = editingProfile.pdfTemplate || (pdfTemplates.length > 0 ? pdfTemplates[0].value : 1);
                    // Clean up old preview URL if exists
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }
                    setPreviewLoading(true);
                    setShowPreview(true);
                    try {
                      const response = await fetch(`/api/admin/templates/preview?template=${template}`);
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        setPreviewUrl(url);
                      } else {
                        setError('Failed to load preview');
                        setShowPreview(false);
                      }
                    } catch (err) {
                      setError('Failed to load preview');
                      setShowPreview(false);
                    } finally {
                      setPreviewLoading(false);
                    }
                  }}
                  disabled={templatesLoading || previewLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
                >
                  {previewLoading ? 'Loading...' : 'Preview'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Choose the PDF template style for this profile. Click Preview to see how it looks.
              </p>
              {pdfTemplates.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Template Usage:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {pdfTemplates.map((template) => (
                      <div key={template.value} className="text-xs text-gray-600">
                        <span className="font-medium">{template.label}:</span>{' '}
                        <span className="text-gray-500">
                          {template.usageCount !== undefined 
                            ? `${template.usageCount} ${template.usageCount === 1 ? 'profile' : 'profiles'}`
                            : '0 profiles'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Preview Section */}
            {showPreview && (
              <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">Template Preview</h4>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                      }
                      setPreviewUrl(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  {previewLoading ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Generating preview...</p>
                      </div>
                    </div>
                  ) : previewUrl ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <iframe
                        src={previewUrl}
                        className="w-full h-[600px] border-0"
                        title="Template Preview"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Custom Prompt Editor */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Custom Prompt</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingProfile({ ...editingProfile, customPrompt: undefined });
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Reset to Default
                </button>
              </div>
            </div>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Use <code className="bg-blue-100 px-1 rounded">{"${baseResume}"}</code> to reference the base resume
                and <code className="bg-blue-100 px-1 rounded">{"${jobDescription}"}</code> to reference the job description.
              </p>
            </div>
            <textarea
              value={currentPrompt}
              onChange={(e) => {
                const newPrompt = e.target.value;
                // If user edits away from default, set as custom
                if (newPrompt !== defaultPromptTemplate) {
                  setEditingProfile({ ...editingProfile, customPrompt: newPrompt });
                } else {
                  setEditingProfile({ ...editingProfile, customPrompt: undefined });
                }
              }}
              rows={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-gray-900"
              placeholder="Enter custom prompt here..."
            />
            <p className="mt-2 text-xs text-gray-500">
              {currentPrompt.length} characters
              {editingProfile.customPrompt && (
                <span className="ml-2 text-blue-600">• Custom prompt is active</span>
              )}
              {!editingProfile.customPrompt && (
                <span className="ml-2 text-gray-500">• Using default prompt</span>
              )}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              onClick={() => {
                setEditingProfile(null);
                setIsCreating(false);
                setError('');
                setSuccess('');
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show profile list and selection
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Resume Profiles</h2>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Profile
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No profiles found. Create your first profile!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {profiles.map((profile) => (
            <div key={profile.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{profile.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Resume Text: {profile.resumeText.length} characters</p>
                    {profile.customPrompt && (
                      <p className="text-blue-600">✓ Custom prompt configured</p>
                    )}
                    <p>PDF Template: {(() => {
                      const template = pdfTemplates.find(t => t.value === (profile.pdfTemplate || (pdfTemplates.length > 0 ? pdfTemplates[0].value : 1)));
                      const templateLabel = template?.label || `Template${profile.pdfTemplate || 1}`;
                      const usageCount = template?.usageCount;
                      return usageCount !== undefined 
                        ? `${templateLabel} (${usageCount} ${usageCount === 1 ? 'profile' : 'profiles'})`
                        : templateLabel;
                    })()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(profile)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(profile.name)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the profile &quot;{showDeleteConfirm}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

