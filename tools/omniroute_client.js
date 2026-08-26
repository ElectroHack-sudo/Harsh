/**
 * OmniRoute Client & Model Dispatcher (Layer 3 Deterministic Tool)
 * 
 * Interacts with OmniRoute local daemon (http://localhost:8080) to intelligently
 * route requests to optimal AI models and orchestrate multi-model workflows.
 */

const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

const DEFAULT_URL = process.env.OMNIROUTE_URL || 'http://localhost:8080';

async function checkOmniRouteHealth(url = DEFAULT_URL) {
    return new Promise((resolve) => {
        try {
            const parsed = new URL(url);
            const req = http.get({
                hostname: parsed.hostname,
                port: parsed.port || 8080,
                path: '/health',
                timeout: 1500
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ alive: res.statusCode < 400, data, statusCode: res.statusCode }));
            });
            req.on('error', (e) => resolve({ alive: false, error: e.message }));
            req.on('timeout', () => {
                req.destroy();
                resolve({ alive: false, error: 'Connection timed out' });
            });
        } catch (err) {
            resolve({ alive: false, error: err.message });
        }
    });
}

function routeTask(taskType, payload) {
    const routingRules = {
        'architecture': { preferredModel: 'claude-3-7-sonnet', temperature: 0.2, tier: 'high-reasoning' },
        'code': { preferredModel: 'claude-3-7-sonnet', temperature: 0.1, tier: 'execution' },
        'database': { preferredModel: 'claude-3-7-sonnet', temperature: 0.1, tier: 'schema-design' },
        'documentation': { preferredModel: 'claude-3-5-haiku', temperature: 0.3, tier: 'fast-synthesis' },
        'general': { preferredModel: 'auto', temperature: 0.5, tier: 'balanced' }
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
        checkOmniRouteHealth().then(res => {
            console.log('[OmniRoute Health Check]:', res);
            if (!res.alive) {
                console.log('[OmniRoute Note]: Local server is not running on 8080. Start via: omniroute start');
            }
        });
    } else if (cmd === 'route') {
        const type = args[1] || 'general';
        const query = args.slice(2).join(' ') || 'Hello OmniRoute';
        const plan = routeTask(type, query);
        console.log('[Routing Strategy]:', JSON.stringify(plan, null, 2));
    } else {
        console.log('Usage: node omniroute_client.js [status|test|route <type> <prompt>]');
    }
}

module.exports = {
    DEFAULT_URL,
    checkOmniRouteHealth,
    routeTask
};
