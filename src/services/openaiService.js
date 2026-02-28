const makeOpenAIRequest = async (messages) => {
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
    const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;

    const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=2024-02-01`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey
        },
        body: JSON.stringify({ messages })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI Error: ${response.status} - ${errorText}`);
    }

    return response.json();
};

export const detectSubjectWithAI = async (userInput) => {
    try {
        const systemPrompt = "You are a subject classifier for a classroom simulator. Given any user input — whether it's a topic, question, or concept — respond with ONLY one word: the school subject it belongs to. Choose from exactly these options: Biology, Physics, Chemistry, English, Geography, History, Mathematics, Computer Science. Return the subject name exactly as written here, nothing else.";

        const data = await makeOpenAIRequest([
            { role: "system", content: systemPrompt },
            { role: "user", content: userInput }
        ]);

        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error in detectSubjectWithAI:", error);
        throw error;
    }
};

export const generateTeachingSlides = async (topic, subject, personas) => {
    try {
        const systemPrompt = `You are Mr. Nova, a warm and engaging classroom teacher. You are teaching a lesson on ${topic} which is a ${subject} topic.

Your teaching style: Professional but warm. Uses simple analogies. Engaging and clear.

Generate exactly 1 teaching slide. Each slide should:
- Be 1-2 sentences maximum
- Explain one concept clearly
- Use a simple analogy or real-world example
- Sound like a teacher actually speaking out loud to students, not reading from a textbook

Return ONLY a valid JSON array with exactly 1 object. Each object has:
- slideNumber: number (1)
- content: string (what the teacher says out loud)
- concept: string (1-3 word title of this concept)

Return nothing else. No markdown. No explanation. Just the JSON array.`;

        const data = await makeOpenAIRequest([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Create teaching slides for the topic: ${topic}` }
        ]);

        const content = data.choices[0].message.content.trim();
        const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();

        return JSON.parse(cleanContent);
    } catch (error) {
        console.error("Error in generateTeachingSlides:", error);
        return [
            { slideNumber: 1, concept: "Introduction", content: "Let's explore this topic together with a quick overview." }
        ];
    }
};

export const generateConversation = async (topic, subject, teachingContent, personas, conversationHistory) => {
    try {
        const systemPrompt = `You are simulating a realistic classroom conversation between a teacher and 4 students after a lesson on ${topic} (${subject}).

The participants are:
- Mr. Nova (teacher): Patient, warm, uses analogies. Responds differently to each student type. Firm when needed, encouraging always.
- Ali (fast_learner): Eager and quick. Jumps to answers. Sometimes overconfident. Speaks confidently and directly.
- Kirtan (esl_student): Polite but struggles with English. Asks for word clarifications. Speaks in slightly broken but understandable English.
- Tayyab (distracted): Funny and off-topic. Makes jokes. Sometimes accidentally relevant. Speaks casually and humorously.
- Rana (emotional): Sensitive and empathetic. Overthinks. Takes things personally. Speaks with feeling and sometimes dramatic flair.

Rules for the conversation:
1. Generate exactly 6-7 conversation turns total
2. Each turn must feel natural and follow from the previous one
3. Students speak in their personality style ALWAYS — never break character
4. The teacher responds differently to each student (patient with Kirtan, firm-but-kind with Tayyab, encouraging with Rana, slightly challenging with Ali)
5. Keep each message SHORT — maximum 2 sentences per turn. No long paragraphs.
6. Include at least: 1 short student question, 1 short teacher response, 1 joke from Tayyab, 1 closing from Mr. Nova
7. The LAST turn must ALWAYS be Mr. Nova closing the class naturally (summarizing, saying goodbye, dismissing students) — it must feel like a real class ending (1-2 sentences max)
8. Every message must directly relate to the topic ${topic} — do not go completely off topic
8. The conversation must flow naturally — each message reacts to the previous one

Return ONLY a valid JSON array. Each object has:
- speakerId: string (ali, kirtan, tayyab, rana, or teacher)
- speakerName: string (Ali, Kirtan, Tayyab, Rana, or Mr. Nova)
- text: string (exactly what they say)
- type: string (one of: question, answer, joke, comment, teaching, closing)

Return nothing else. No markdown. No explanation. Just the JSON array.`;

        const historyStr = JSON.stringify(conversationHistory || []);

        const data = await makeOpenAIRequest([
            { role: "system", content: systemPrompt },
            { role: "user", content: `The lesson content was: ${teachingContent}. Previous conversation: ${historyStr}. Now generate the classroom conversation.` }
        ]);

        const content = data.choices[0].message.content.trim();
        const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(cleanContent);
        if (!parsed || parsed.length === 0) throw new Error("Empty conversation array");
        return parsed;
    } catch (error) {
        console.error("Error in generateConversation:", error);
        return [
            { speakerId: 'teacher', speakerName: 'Mr. Nova', text: 'Welcome everyone. Let us begin our lesson.', type: 'teaching' },
            { speakerId: 'ali', speakerName: 'Ali', text: 'I have a question about this topic!', type: 'question' },
            { speakerId: 'teacher', speakerName: 'Mr. Nova', text: 'Great question. Class dismissed.', type: 'closing' }
        ];
    }
};

export const generateEvaluation = async (topic, subject, conversationLog, personas) => {
    try {
        const systemPrompt = `You are an educational evaluator. Based on a classroom conversation transcript, evaluate the teacher and each student.

Topic taught: ${topic}
Subject: ${subject}

Evaluate Mr. Nova (teacher) on:
- teachingClarity: how clearly he explained concepts (score 0-100)
- studentEngagement: how well he engaged different student types (score 0-100)
- adaptability: how well he adapted his responses to each student's personality (score 0-100)
- patience: how patient he was (score 0-100)
- overallScore: average of above scores
- strengths: array of 2 strength strings
- improvements: array of 2 improvement strings
- summary: 2 sentence summary of his teaching performance

Evaluate each student (Ali, Kirtan, Tayyab, Rana) on:
- participation: how much they participated (score 0-100)
- relevance: how relevant their contributions were (score 0-100)
- understanding: how much they seemed to understand the topic (score 0-100)
- overallScore: average of above scores
- highlight: 1 sentence about their best moment
- summary: 1 sentence overall summary

Return ONLY a valid JSON object with this structure:
{
  "teacher": { "name": "string", "teachingClarity": 0, "studentEngagement": 0, "adaptability": 0, "patience": 0, "overallScore": 0, "strengths": [], "improvements": [], "summary": "string" },
  "students": [
    { "id": "string", "name": "string", "participation": 0, "relevance": 0, "understanding": 0, "overallScore": 0, "highlight": "string", "summary": "string" }
  ]
}

Return nothing else. No markdown. Just the JSON object.`;

        const transcript = (conversationLog || [])
            .map(msg => `${msg.speakerName}: ${msg.text}`)
            .join('\n');

        const data = await makeOpenAIRequest([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Here is the full conversation transcript:\n${transcript}` }
        ]);

        const content = data.choices[0].message.content.trim();
        const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();

        return JSON.parse(cleanContent);
    } catch (error) {
        console.error("Error in generateEvaluation:", error);
        return {
            teacher: { name: 'Mr. Nova', teachingClarity: 75, studentEngagement: 75, adaptability: 75, patience: 75, overallScore: 75, strengths: ['Clear explanations', 'Patient demeanor'], improvements: ['Could use more visual aids', 'Engage more with quieter students'], summary: 'Solid teaching performance overall.' },
            students: [
                { id: 'ali', name: 'Ali', participation: 75, relevance: 75, understanding: 75, overallScore: 75, highlight: 'Asked a great question.', summary: 'Good job overall.' },
                { id: 'kirtan', name: 'Kirtan', participation: 75, relevance: 75, understanding: 75, overallScore: 75, highlight: 'Tried hard to participate.', summary: 'Good effort.' },
                { id: 'tayyab', name: 'Tayyab', participation: 75, relevance: 75, understanding: 75, overallScore: 75, highlight: 'Made a funny but relevant joke.', summary: 'Needs a bit more focus.' },
                { id: 'rana', name: 'Rana', participation: 75, relevance: 75, understanding: 75, overallScore: 75, highlight: 'Showed great empathy.', summary: 'Very thoughtful.' }
            ]
        };
    }
};

export async function generateResponseToObserver(observerName, observerMessage, topic, subject, conversationHistory, personas) {
    try {
        const systemPrompt = `You are simulating a classroom where a real person named ${observerName} has just joined as a student and said something. 
  
  The class topic is ${topic} (${subject}).
  
  The other participants are:
  - Mr. Nova (teacher): Patient, warm, engaging. Always addresses students by name.
  - Ali (fast_learner): Eager, confident, sometimes competitive
  - Kirtan (esl_student): Polite, careful with words
  - Tayyab (distracted): Funny, makes jokes
  - Rana (emotional): Sensitive, empathetic
  
  ${observerName} just said: '${observerMessage}'
  
  Generate a natural classroom reaction to this. Include:
  1. Mr. Nova MUST respond directly to ${observerName} by name — warmly acknowledge their contribution, answer their question or respond to their statement in 1-2 sentences
  2. ONE other student (randomly pick one) also reacts to what ${observerName} said — in their personality style, 1 sentence max
  3. The responses must feel natural and connected to what ${observerName} said
  
  Return ONLY a valid JSON array with 2 objects:
  [
    { "speakerId": "teacher", "speakerName": "Mr. Nova", "text": "...", "type": "answer" },
    { "speakerId": "ali" | "kirtan" | "tayyab" | "rana", "speakerName": "...", "text": "...", "type": "comment" }
  ]
  
  Return nothing else. No markdown. Just the JSON array.`;

        const historyStr = conversationHistory
            .map(msg => `${msg.speakerName}: ${msg.text}`)
            .join('\n');

        const data = await makeOpenAIRequest([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Previous conversation context:\n${historyStr}\n\n${observerName} says: ${observerMessage}` }
        ]);

        const content = data.choices[0].message.content.trim();
        const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();

        return JSON.parse(cleanContent);
    } catch (error) {
        console.error("Error in generateResponseToObserver:", error);
        return [
            { speakerId: 'teacher', speakerName: 'Mr. Nova', text: `Great point, ${observerName}! That's exactly what we were discussing.`, type: 'answer' },
            { speakerId: 'ali', speakerName: 'Ali', text: 'I was thinking the same thing!', type: 'comment' }
        ];
    }
}
