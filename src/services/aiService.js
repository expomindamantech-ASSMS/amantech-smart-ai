// src/services/aiService.js
// Powered by Google Gemini API (free tier)
import { GEMINI_CONFIG } from '../config/back4app';

const GHANA_CURRICULUM_CONTEXT = `
You are AmanTech Smart AI (ASS AI), an expert AI assistant built specifically for Ghana's education system.
You are deeply familiar with:
- Ghana Education Service (GES) standards
- NaCCA (National Council for Curriculum and Assessment) curriculum framework
- Ghana's Competency-Based Curriculum (CBC)
- BECE and WASSCE examination formats and WAEC marking schemes
- Ghana's three-term academic calendar system
- Ghana's grading system (A1-F9 for WASSCE, 1-9 for BECE)
- Ghanaian subjects: Mathematics, English Language, Integrated Science, Social Studies, RME, Ghanaian Languages, ICT, Creative Arts, etc.
- All grade levels: KG, Primary (1-6), JHS (1-3), SHS (1-3)
- Cultural context of Ghana and West Africa

Always provide practical, culturally-relevant, curriculum-aligned responses in clear English.
Format your responses well using markdown where appropriate.
`;

// ─── CORE GEMINI CALLER ───────────────────────────────────────────────────────

export const callAI = async (prompt, systemExtra = '', imageBase64 = null) => {
  const { API_KEY, MODEL, BASE_URL } = GEMINI_CONFIG;

  // Build the parts array for the user turn
  const parts = [];

  // For image + text requests
  if (imageBase64) {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    let mimeType = 'image/jpeg';
    if (imageBase64.startsWith('data:image/png')) mimeType = 'image/png';
    else if (imageBase64.startsWith('data:image/gif')) mimeType = 'image/gif';
    else if (imageBase64.startsWith('data:image/webp')) mimeType = 'image/webp';
    parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
  }

  parts.push({ text: prompt });

  const body = {
    system_instruction: {
      parts: [{ text: GHANA_CURRICULUM_CONTEXT + (systemExtra ? '\n' + systemExtra : '') }]
    },
    contents: [{ role: 'user', parts }],
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
    }
  };

  const url = `${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Gemini AI request failed');
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini AI. Please try again.');
  return text;
};

// ─── FEATURE PROMPTS ──────────────────────────────────────────────────────────

export const generateLessonPlan = (subject, grade, topic, duration, objectives) =>
  callAI(`Generate a detailed, Ghana NaCCA-aligned lesson plan with the following details:
Subject: ${subject}
Grade/Class: ${grade}
Topic: ${topic}
Duration: ${duration}
Learning Objectives: ${objectives || 'To be determined based on topic'}

Format the lesson plan with:
1. Title, Subject, Class, Duration, Date field
2. Learning Objectives (3-5 measurable objectives)
3. Teaching/Learning Materials
4. Relevant Previous Knowledge
5. Introduction/Motivation (5-10 mins)
6. Development/Teaching Steps (step-by-step with timing)
7. Activities (individual, group, class activities)
8. Assessment strategies
9. Conclusion/Summary
10. Assignment/Homework
11. Teacher's Reflection space

Make it practical for Ghanaian classroom context.`);

export const generateExamQuestions = (subject, grade, topic, qtype, count, difficulty) =>
  callAI(`Generate ${count} ${qtype} exam questions for Ghana education:
Subject: ${subject}
Grade: ${grade}
Topic: ${topic}
Difficulty: ${difficulty}
Question Type: ${qtype}

For each question provide:
- The question (clearly numbered)
- Mark allocation
- Model answer / marking scheme
- WAEC-style marking guide if applicable

Align with Ghana's ${grade.includes('SHS') ? 'WASSCE' : grade.includes('JHS') ? 'BECE' : 'end-of-term'} exam format.`);

export const generateMarkingScheme = (questions, subject, grade) =>
  callAI(`Create a comprehensive marking scheme for the following ${subject} ${grade} exam questions:

${questions}

For each question provide:
- Full mark allocation breakdown
- Acceptable answers/key points
- Partial marking guidance
- Common errors to watch for
- WAEC-style annotations where applicable`);

export const generateTimetable = (classes, subjects, teachers, periods) =>
  callAI(`Generate a complete school timetable for Ghana:
Classes: ${classes}
Subjects: ${subjects}
Teachers: ${teachers}
Periods per day: ${periods}

Create a conflict-free weekly timetable following Ghana Education Service guidelines.
Include:
- Monday to Friday schedule
- Morning assembly period
- Break times (10:00 AM, 12:00 PM lunch)
- Sports/PE slots
- Ensure no teacher teaches two classes simultaneously
Format as a clear markdown table.`);

export const generateReportCard = (studentName, grade, scores, term, year, teacherComment) =>
  callAI(
    `Generate a professional Ghana GES-format report card:
Student: ${studentName}
Class: ${grade}
Term: ${term}
Academic Year: ${year}
Scores: ${JSON.stringify(scores)}
Teacher's Comment: ${teacherComment || 'Good effort this term.'}

Include:
- Subject performance table with class scores and exam scores (continuous assessment)
- Total marks and grades using Ghana grading scale:
  A1 (80-100) Excellent, B2 (70-79) Very Good, B3 (65-69) Good,
  C4 (60-64) Credit, C5 (55-59) Credit, C6 (50-54) Credit,
  D7 (45-49) Pass, E8 (40-44) Pass, F9 (0-39) Fail
- Class position indication area
- Teacher's overall comment
- Recommended areas for improvement
- Next term's school resumption date placeholder`,
    'Format this as a professional, structured report card that can be printed.'
  );

export const generateProjectGuide = (subject, grade, topic, type) =>
  callAI(`Create a comprehensive project/research guide:
Subject: ${subject}
Grade: ${grade}
Topic: ${topic}
Project Type: ${type}

Provide:
1. Introduction and background
2. Research questions
3. Objectives (3-5)
4. Methodology / how to conduct the research
5. Materials needed
6. Step-by-step guidance
7. Data collection methods
8. How to present findings
9. Citation guide (APA format)
10. Rubric / marking criteria
11. Suggested credible Ghanaian sources (GES, MOEC, Ghana Statistical Service, etc.)`);

export const generateEducationalGame = (subject, grade, topic, gameType) =>
  callAI(`Design a detailed educational game for Ghana students:
Subject: ${subject}
Grade: ${grade}
Topic: ${topic}
Game Type: ${gameType}

Provide:
1. Game title and objective
2. Materials needed
3. Number of players
4. Setup instructions
5. How to play (step-by-step rules)
6. 20 game questions/challenges related to ${topic}
7. Scoring system
8. Learning outcomes
9. Variations for different ability levels
10. Teacher facilitation tips`);

export const generateCalendar = (term, year, schoolName) =>
  callAI(`Generate a comprehensive Ghana academic calendar:
School: ${schoolName}
Term: ${term}
Year: ${year}

Create a detailed term calendar including:
1. Term opening and closing dates (aligned with GES calendar)
2. Week-by-week breakdown
3. Key dates: exams, continuous assessment, sports day, speech day, parent-teacher meetings
4. Public holidays (Ghana national holidays)
5. Mid-term break
6. End-of-term exams schedule
7. Important submission deadlines
8. Back-to-school dates

Follow Ghana's three-term system and GES guidelines.`);

export const researchAssistant = (query, subject, grade) =>
  callAI(`Help with this educational research/question:
Query: ${query}
Subject Context: ${subject || 'General'}
Grade Level: ${grade || 'Not specified'}

Provide a comprehensive, curriculum-aligned response that:
- Directly answers the question
- Uses examples relevant to Ghana
- Cites relevant curriculum standards where applicable
- Suggests further reading/resources
- Is age-appropriate for ${grade || 'the relevant'} students`);

export const analyzeImage = (prompt, imageBase64) =>
  callAI(
    prompt || 'Analyze this educational image and provide detailed feedback, explanations, or suggestions relevant to Ghana education curriculum. Describe what you see, identify the subject area, and suggest how this can be used in teaching.',
    '',
    imageBase64
  );
