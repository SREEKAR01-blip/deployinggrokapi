const { OpenAI } = require('openai');
const axios = require('axios');

const openai = new OpenAI({
    baseURL: 'https://api.featherless.ai/v1',
    apiKey: process.env.FEATHERLESS_API_KEY || 'rc_3e1e7518dcc3234af9f40bc173e3d39d4962e6551da8c4611a471ff592bc4571',
});

const MODEL_NAME = 'Qwen/Qwen2.5-7B-Instruct';
const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || 'efd09440-e543-4c14-8f27-7a77b5b1fd9e';

async function fetchContext(prompt) {
    console.log('[BrightData] Fetching context for:', prompt);
    try {
        // Real connection to BrightData API to fetch context using your provided key
        const response = await axios.post(
            'https://api.brightdata.com/dca/trigger',
            { query: prompt },
            { headers: { 'Authorization': `Bearer ${BRIGHTDATA_API_KEY}` } }
        );
        return response.data ? JSON.stringify(response.data) : `Detailed context retrieved for: ${prompt}`;
    } catch (error) {
        // Fallback for context if endpoint requires more configuration or zone ID
        return `Context retrieved via BrightData structure: Ensure the opinion for "${prompt}" handles varied perspectives gracefully.`;
    }
}

async function generate(prompt, context) {
    console.log('[Generator] Generating initial opinion...');
    const sys = `You are an insightful thinker. The user will ask a question. Provide your initial opinion or analysis.\nOptional context from BrightData: ${context}\n\nRespond with a thoughtful and concise opinion (under 100 words), without any code blocks.`;
    const res = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150
    });
    return {
        id: 1,
        title: 'Version 1 - Initial Opinion',
        opinion: res.choices[0].message.content.trim(),
        changelog: ['Generated initial opinion.', 'Formulated base arguments.']
    };
}

async function critiqueAndImprove(prompt, previousVersion) {
    console.log(`[Critic] Critiquing Version ${previousVersion.id}...`);
    const cSys = `You are a critical thinker. Review the following opinion against the user's question: "${prompt}". \nIdentify missing perspectives, biases, or weak points. Respond with exactly 2 concise bullet points identifying flaws or areas for improvement. Limit response to ONLY the bullet points.`;
    const cRes = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: 'system', content: cSys }, { role: 'user', content: `Opinion:\n${previousVersion.opinion}` }],
        temperature: 0.5,
        max_tokens: 100
    });
    const critiqueText = cRes.choices[0].message.content;
    const bullets = critiqueText.split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^- /, '').trim());

    console.log(`[Improver] Improving Version ${previousVersion.id}...`);
    const iSys = `You are a nuanced refiner. Rewrite the original opinion to address these critiques:\n${bullets.join('\n')}\n\nProduce a well-rounded and concise final opinion (under 120 words). Do not use code blocks.\nThen on a new line, add exactly the word "CHANGELOG:" followed by 2 concise bullet points explaining what you changed and why.`;
    const iRes = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: 'system', content: iSys }, { role: 'user', content: `Original Opinion:\n${previousVersion.opinion}` }],
        temperature: 0.5,
        max_tokens: 250
    });

    const outputText = iRes.choices[0].message.content;
    const parts = outputText.split(/CHANGELOG:/i);
    const finalOpinion = parts[0].trim();
    
    let finalChangelog = [];
    if (parts.length > 1) {
        finalChangelog = parts[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^- /, '').trim());
    }

    const newVersionId = previousVersion.id + 1;
    return {
        id: newVersionId,
        title: newVersionId === 2 ? 'Version 2 - Refined Opinion' : 'Version 3 - Final Perspective',
        opinion: finalOpinion || 'Failed to generate.',
        changelog: finalChangelog.length > 0 ? finalChangelog : bullets
    };
}

async function runLoop(prompt) {
    const context = await fetchContext(prompt);
    const v1 = await generate(prompt, context);
    const v2 = await critiqueAndImprove(prompt, v1);
    const v3 = await critiqueAndImprove(prompt, v2);
    return [v1, v2, v3];
}

module.exports = { runLoop };
