/**
 * OmniRoute Client & Model Dispatcher (Layer 3 Deterministic Tool)
 * 
 * Interacts with OmniRoute local daemon (http://localhost:20128) to intelligently
 * route requests, inspect model catalog, and execute multi-model completions.
 */

const http = require('http');
const https = require('https');

const DEFAULT_URL = process.env.OMNIROUTE_URL || 'http://localhost:20128';
const API_KEY = process.env.OMNIROUTE_API_KEY || process.env.OPENAI_API_KEY || 'sk-28cd06a63e40d0fa-1d04bb-be07bf06';

/**
 * Checks OmniRoute daemon health and metrics.
 */
async function checkOmniRouteHealth(url = DEFAULT_URL, apiKey = API_KEY) {
    return new Promise((resolve) => {
        try {
            const parsed = new URL(url);
            const headers = {
                'Accept': 'application/json'
            };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const req = http.get({
                hostname: parsed.hostname,
                port: parsed.port || 20128,
                path: '/api/monitoring/health',
                headers,
                timeout: 3000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    let parsedData = null;
                    try { parsedData = JSON.parse(data); } catch (e) {}

                    if (res.statusCode >= 200 && res.statusCode < 400) {
                        resolve({
                            alive: true,
                            statusCode: res.statusCode,
                            version: parsedData?.system?.version || '3.8.49',
                            uptimeSeconds: parsedData?.system?.uptime ? Math.round(parsedData.system.uptime) : null,
                            url
                        });
                    } else {
                        checkModelsFallback(url, apiKey).then(resolve);
                    }
                });
            });
            req.on('error', () => {
                checkModelsFallback(url, apiKey).then(resolve);
            });
            req.on('timeout', () => {
                req.destroy();
                resolve({ alive: false, error: 'Connection timed out', url });
            });
        } catch (err) {
            resolve({ alive: false, error: err.message, url });
        }
    });
}

function checkModelsFallback(url, apiKey) {
    return new Promise((resolve) => {
        try {
            const parsed = new URL(url);
            const req = http.get({
                hostname: parsed.hostname,
                port: parsed.port || 20128,
                path: '/v1/models',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 2500
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    let parsedData = null;
                    try { parsedData = JSON.parse(data); } catch (e) {}
                    resolve({
                        alive: res.statusCode >= 200 && res.statusCode < 400,
                        statusCode: res.statusCode,
                        modelsCount: parsedData?.data?.length || 0,
                        url
                    });
                });
            });
            req.on('error', (e) => resolve({ alive: false, error: e.message, url }));
            req.on('timeout', () => {
                req.destroy();
                resolve({ alive: false, error: 'Connection timed out', url });
            });
        } catch (err) {
            resolve({ alive: false, error: err.message, url });
        }
    });
}

/**
 * Retrieves the catalog of models currently available in OmniRoute.
 */
async function getAvailableModels(url = DEFAULT_URL, apiKey = API_KEY) {
    return new Promise((resolve) => {
        try {
            const parsed = new URL(url);
            const req = http.get({
                hostname: parsed.hostname,
                port: parsed.port || 20128,
                path: '/v1/models',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 4000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        resolve(json.data || []);
                    } catch (e) {
                        resolve([]);
                    }
                });
            });
            req.on('error', () => resolve([]));
            req.on('timeout', () => { req.destroy(); resolve([]); });
        } catch (err) {
            resolve([]);
        }
    });
}

/**
 * Executes a chat completion query through OmniRoute.
 */
async function generateCompletion(prompt, options = {}) {
    const {
        model = 'auto/best-coding',
        system = 'You are an expert software architect and assistant.',
        temperature = 0.2,
        maxTokens = 1500,
        url = DEFAULT_URL,
        apiKey = API_KEY
    } = options;

    return new Promise((resolve, reject) => {
        try {
            const parsed = new URL(url);
            const payload = JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: prompt }
                ],
                temperature,
                max_tokens: maxTokens,
                stream: false
            });

            const req = http.request({
                hostname: parsed.hostname,
                port: parsed.port || 20128,
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 25000
            }, (res) => {
                let rawData = '';
                res.on('data', chunk => rawData += chunk);
                res.on('end', () => {
                    try {
                        if (rawData.includes('data: {')) {
                            const lines = rawData.split('\n');
                            let text = '';
                            for (const line of lines) {
                                if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                                    try {
                                        const chunk = JSON.parse(line.substring(6));
                                        text += chunk.choices?.[0]?.delta?.content || '';
                                    } catch (e) {}
                                }
                            }
                            resolve({
                                content: text.trim(),
                                model,
                                raw: rawData
                            });
                        } else {
                            const parsedData = JSON.parse(rawData);
                            resolve({
                                content: parsedData.choices?.[0]?.message?.content || '',
                                model: parsedData.model || model,
                                usage: parsedData.usage
                            });
                        }
                    } catch (e) {
                        resolve({ content: rawData.trim(), model, raw: rawData });
                    }
                });
            });

            req.on('error', (err) => reject(err));
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('OmniRoute request timed out after 25s'));
            });

            req.write(payload);
            req.end();
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Intelligent task strategy router based on task classification.
 */
function routeTask(taskType, payload) {
    const routingRules = {
        'architecture': { preferredModel: 'claude-3-7-sonnet', fallbackModel: 'auto/best-coding', temperature: 0.2, tier: 'high-reasoning' },
        'code': { preferredModel: 'auto/best-coding', fallbackModel: 'claude-3-7-sonnet', temperature: 0.1, tier: 'execution' },
        'database': { preferredModel: 'auto/best-coding', fallbackModel: 'claude-3-7-sonnet', temperature: 0.1, tier: 'schema-design' },
        'documentation': { preferredModel: 'claude-haiku-4.5', fallbackModel: 'auto/best-coding', temperature: 0.3, tier: 'fast-synthesis' },
        'general': { preferredModel: 'auto/best-coding', fallbackModel: 'claude-haiku-4.5', temperature: 0.5, tier: 'balanced' }
    };

    const strategy = routingRules[taskType] || routingRules['general'];
    console.log(`[OmniRoute Router] Task "${taskType}" dispatched with tier: [${strategy.tier}] using model: ${strategy.preferredModel}`);

    return {
        strategy,
        timestamp: new Date().toISOString(),
        payload
    };
}

// CLI entrypoint
if (require.main === module) {
    const args = process.argv.slice(2);
    const cmd = args[0] || 'status';

    if (cmd === 'status' || cmd === 'test') {
        checkOmniRouteHealth().then(async (res) => {
            console.log('[OmniRoute Health Check]:', res);
            if (res.alive) {
                const models = await getAvailableModels();
                console.log(`[OmniRoute Connected]: Active with ${models.length} models.`);
                models.slice(0, 5).forEach(m => console.log(`  - ${m.id} (${m.owned_by || 'provider'})`));
            } else {
                console.log('[OmniRoute Note]: Server not reachable on port 20128. Start via: omniroute serve');
            }
        });
    } else if (cmd === 'ask' || cmd === 'chat') {
        const prompt = args.slice(1).join(' ') || 'Explain the Nexus Architecture in 2 sentences.';
        console.log(`Querying OmniRoute: "${prompt}"...`);
        generateCompletion(prompt)
            .then(res => console.log('\n[OmniRoute Response]:\n' + res.content))
            .catch(err => console.error('Error:', err.message));
    } else if (cmd === 'route') {
        const type = args[1] || 'general';
        const query = args.slice(2).join(' ') || 'Hello OmniRoute';
        const plan = routeTask(type, query);
        console.log('[Routing Strategy]:', JSON.stringify(plan, null, 2));
    } else {
        console.log('Usage: node omniroute_client.js [status|chat <prompt>|route <type> <prompt>]');
    }
}

module.exports = {
    DEFAULT_URL,
    API_KEY,
    checkOmniRouteHealth,
    getAvailableModels,
    generateCompletion,
    routeTask
};

