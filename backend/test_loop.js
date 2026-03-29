require('dotenv').config();
const { runLoop } = require('./agent.js');

async function test() {
    try {
        console.log('Testing the autonomous loop...');
        const prompt = 'Should humanity prioritize space exploration or ocean exploration?';
        const result = await runLoop(prompt);
        console.log('Final Result:\n', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test Failed:', error);
    }
}
test();
