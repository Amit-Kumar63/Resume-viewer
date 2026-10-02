// Any OpenAI-compatible provider works (Gemini, Groq, OpenRouter, Mistral...).
// Defaults to Google Gemini's free tier.
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai';
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'gemini-flash-latest';
// Tried in order when the main model is overloaded or unavailable (comma separated)
const AI_FALLBACK_MODELS = (process.env.AI_FALLBACK_MODELS ?? (process.env.AI_BASE_URL ? '' : 'gemini-flash-lite-latest'))
    .split(',').map((m) => m.trim()).filter(Boolean);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// POST to /chat/completions, retrying on 429/5xx with exponential backoff
const chatComplete = async (body, retries = 3) => {
    for (let attempt = 0; ; attempt++) {
        const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${AI_API_KEY}`,
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(120000),
        });

        if (response.ok) return response.json();

        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt < retries) {
            await sleep(1000 * 2 ** attempt);
            continue;
        }

        const error = new Error(`AI API error ${response.status}: ${await response.text()}`);
        error.statusCode = response.status;
        throw error;
    }
};

const SCORE_CATEGORIES = [
    'Impact & Achievements',
    'Experience Relevance',
    'Skills & Keywords',
    'Structure & Readability',
    'Writing Quality',
    'ATS Compatibility',
];

const SYSTEM_PROMPT = `You are a senior technical recruiter and hiring manager with 15+ years of experience screening resumes across industries, and an expert in Applicant Tracking Systems (ATS). You give candid, specific, evidence-based resume reviews that measurably improve a candidate's interview rate.

## Input
- The resume text was extracted with OCR, so expect broken line wraps, merged columns, stray symbols and misspelled words. Do NOT penalise OCR artefacts as candidate mistakes; only flag real issues you are confident are in the original.
- A target role and/or job description may be provided. If provided, judge everything against it. If not, infer the most likely target role from the resume and say so.

## How to review
1. First decide whether the text is actually a resume/CV. If it is not, set "is_resume" to false and keep the other fields minimal.
2. Ground every claim in the resume. Quote or closely paraphrase the exact line in "evidence". Never invent experience, employers, numbers or skills.
3. Be specific. Banned: generic advice like "add more details" or "tailor your resume" unless you say exactly what to add and where.
4. Rewrites must keep the candidate's real facts. Use bracketed placeholders like [X%] or [number] for metrics the candidate must fill in, never fabricated numbers.
5. Calibrate scores honestly; do not inflate. Overall score bands:
   90-100 exceptional, top 5%; ready to send.
   75-89 strong; minor polish needed.
   60-74 average; noticeable gaps hurting interview chances.
   40-59 weak; major rework needed.
   0-39 poor or largely unusable.
   Category scores are 0-10 with the same calibration. The overall score must be consistent with the category scores.
6. ATS check: look for standard section headings, parseable dates, contact details, keyword coverage for the target role, and problems like tables/columns/graphics that OCR hints at.
7. Salary: estimate a realistic current market range for the best-fit role, experience level and location. Use the location in the resume; if none, state your assumption in "region". Use the local currency code (e.g. INR, USD, EUR) and annual figures as plain integers.
8. Use professional HR language. Be direct but constructive.

## Output
Reply with ONE JSON object only (no markdown, no code fences) matching exactly this shape:
{
  "is_resume": boolean,
  "candidate": {
    "name": string | null,
    "headline": string,                    // one line, e.g. "Frontend developer, ~2 yrs, React & TypeScript"
    "experience_level": "Student" | "Entry" | "Junior" | "Mid" | "Senior" | "Lead" | "Executive",
    "years_experience": number | null,
    "inferred_target_role": string
  },
  "overall_score": integer 0-100,
  "verdict": string,                       // 2-3 sentence executive summary a recruiter would write
  "category_scores": [                     // exactly these categories, in this order: ${SCORE_CATEGORIES.join(', ')}
    { "category": string, "score": integer 0-10, "comment": string }
  ],
  "strengths": [ { "title": string, "detail": string, "evidence": string } ],              // 3-5 items
  "weaknesses": [ { "title": string, "detail": string, "severity": "high" | "medium" | "low" } ],  // 3-6 items, most severe first
  "improvements": [                        // 3-6 highest-impact fixes, most impactful first
    { "title": string, "action": string, "before": string | null, "after": string | null }
  ],
  "ats": {
    "score": integer 0-100,
    "matched_keywords": [string],
    "missing_keywords": [string],          // important for the target role but absent
    "notes": string
  },
  "best_fit_roles": [ { "role": string, "match": integer 0-100, "reason": string } ],  // 3 items, best first
  "salary": { "currency": string, "min": integer, "max": integer, "region": string, "rationale": string },
  "red_flags": [string],                   // e.g. unexplained gaps, job hopping, missing contact info; [] if none
  "interview_questions": [string]          // 3 questions an interviewer would likely ask this candidate
}`;

const MAX_JD_CHARS = 6000;
const MAX_RESUME_CHARS = 20000;

const buildUserMessage = ({ resumeText, targetRole, jobDescription }) => {
    const parts = [];
    if (targetRole) parts.push(`<target_role>\n${targetRole}\n</target_role>`);
    if (jobDescription) parts.push(`<job_description>\n${jobDescription.slice(0, MAX_JD_CHARS)}\n</job_description>`);
    if (!targetRole && !jobDescription) parts.push('No target role or job description was given. Infer the most likely target role.');
    parts.push(`<resume_text source="ocr">\n${resumeText.slice(0, MAX_RESUME_CHARS)}\n</resume_text>`);
    parts.push('Review this resume now. Respond with the JSON object only.');
    return parts.join('\n\n');
};

// Models sometimes wrap JSON in ```json fences or add stray text around it
const parseJson = (raw) => {
    const cleaned = raw.replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start === -1 || end <= start) return null;
        try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
    }
};

// Try the main model, then each fallback when a model is busy, down or missing
const completeWithFallback = async (body) => {
    const models = [AI_MODEL, ...AI_FALLBACK_MODELS];
    for (const [i, model] of models.entries()) {
        try {
            return await chatComplete({ ...body, model }, i === models.length - 1 ? 3 : 1);
        } catch (error) {
            const switchable = error.statusCode === 429 || error.statusCode === 404 || error.statusCode >= 500;
            if (!switchable || i === models.length - 1) throw error;
            console.warn(`AI model ${model} failed (${error.statusCode}), falling back to ${models[i + 1]}`);
        }
    }
};

module.exports.analyzeResume = async ({ resumeText, targetRole, jobDescription }) => {
    const completion = await completeWithFallback({
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserMessage({ resumeText, targetRole, jobDescription }) },
        ],
    });

    const raw = completion.choices?.[0]?.message?.content || '';
    const analysis = parseJson(raw);

    // Fall back to showing the raw text if the model didn't return valid JSON
    if (!analysis || typeof analysis.overall_score !== 'number') {
        return { format: 'markdown', content: raw };
    }
    return { format: 'structured', content: analysis };
};
