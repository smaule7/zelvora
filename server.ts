import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createZapierSdk } from '@zapier/zapier-sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

/**
 * Initializes the official Zapier SDK client.
 * Credentials are supplied via ZAPIER_CREDENTIALS_CLIENT_ID + ZAPIER_CREDENTIALS_CLIENT_SECRET.
 */
function getZapierClient() {
  if (
    process.env.ZAPIER_CREDENTIALS_CLIENT_ID &&
    process.env.ZAPIER_CREDENTIALS_CLIENT_SECRET
  ) {
    return createZapierSdk({
      credentials: {
        type: 'client_credentials',
        clientId: process.env.ZAPIER_CREDENTIALS_CLIENT_ID,
        clientSecret: process.env.ZAPIER_CREDENTIALS_CLIENT_SECRET,
      },
    });
  }
  return createZapierSdk();
}

/**
 * Helper to extract response text from the Zapier Agent action result.
 */
function extractAgentReply(resultData: unknown): string {
  if (!resultData) return '';
  if (typeof resultData === 'string') return resultData;

  if (Array.isArray(resultData) && resultData.length > 0) {
    return extractAgentReply(resultData[0]);
  }

  if (typeof resultData === 'object' && resultData !== null) {
    const data = resultData as Record<string, unknown>;

    // Common fields returned by Zapier Agent behaviors
    if (typeof data.reply === 'string') return data.reply;
    if (typeof data.response === 'string') return data.response;
    if (typeof data.agent_reply === 'string') return data.agent_reply;
    if (typeof data.agent_response === 'string') return data.agent_response;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.output === 'string') return data.output;
    if (typeof data.text === 'string') return data.text;
    if (typeof data.content === 'string') return data.content;

    // Look for nested reply or message objects
    for (const key of ['reply', 'response', 'data', 'output', 'result']) {
      if (data[key] && typeof data[key] === 'object') {
        const nested = extractAgentReply(data[key]);
        if (nested) return nested;
      }
    }
  }

  return JSON.stringify(resultData);
}

/**
 * Chat endpoint running the existing Zapier Agent server-side via @zapier/zapier-sdk.
 * Expected JSON payload:
 * {
 *   "message": "<User Message>"
 * }
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'A valid message string is required.' });
    }

    const zapier = getZapierClient();

    // 1. Locate the authorized connection for the "agents" app
    let connection: { id: string } | null = null;
    try {
      const connResponse = await zapier.findFirstConnection({
        app: 'agents',
        owner: 'me',
      });
      connection = connResponse?.data || null;
    } catch (connErr: unknown) {
      const msg = connErr instanceof Error ? connErr.message : 'Authentication failure';
      console.error('Error finding Zapier Agents connection:', msg);
      return res.status(401).json({
        error: `Zapier authorization error: ${msg}. Please ensure ZAPIER_CREDENTIALS_CLIENT_ID and ZAPIER_CREDENTIALS_CLIENT_SECRET are configured.`,
        code: 'ZAPIER_AUTH_REQUIRED',
      });
    }

    if (!connection || !connection.id) {
      return res.status(400).json({
        error:
          'No authorized Zapier Agents connection found for this account. Please authorize the Zapier Agents app in your Zapier account.',
        code: 'MISSING_ZAPIER_AGENTS_CONNECTION',
      });
    }

    // 2. Determine target Agent ID (prefers ZAPIER_AGENT_ID, or searches connected agents for "Zelvoro")
    let agentId = process.env.ZAPIER_AGENT_ID;

    if (!agentId) {
      try {
        const choices = await zapier.listActionInputFieldChoices({
          app: 'agents',
          action: 'run_behavior',
          actionType: 'write',
          connection: connection.id,
          inputField: 'agent',
        });

        const choicesList = Array.isArray(choices?.data) ? choices.data : [];
        const zelvoroMatch = choicesList.find(
          (c: { label?: string; value?: string }) =>
            c.label?.toLowerCase().includes('zelvoro') ||
            c.value?.toLowerCase().includes('zelvoro')
        );

        if (zelvoroMatch?.value) {
          agentId = String(zelvoroMatch.value);
        } else if (choicesList.length > 0 && choicesList[0]?.value) {
          agentId = String(choicesList[0].value);
        }
      } catch (inspectErr) {
        console.warn('Could not auto-discover agent choices:', inspectErr);
      }
    }

    if (!agentId) {
      return res.status(400).json({
        error:
          'Unable to identify the Zelvoro Agent ID. Please provide ZAPIER_AGENT_ID in your environment secrets or ensure your Zelvoro Agent has the "Trigger via Zap" trigger enabled.',
        code: 'MISSING_AGENT_ID',
      });
    }

    // 3. Run the official "run_behavior" action for Zapier Agents and wait for the Agent response
    const actionResult = await zapier.runAction({
      app: 'agents',
      action: 'run_behavior',
      actionType: 'write',
      connection: connection.id,
      inputs: {
        agent: agentId,
        instructions: message,
        message: message,
        wait_for_reply: true,
        pause: true,
      },
      timeoutSeconds: 75,
    });

    const reply = extractAgentReply(actionResult?.data);

    if (!reply) {
      return res.status(502).json({
        error: 'The Zapier Agent completed execution but did not return a response message.',
      });
    }

    return res.json({
      success: true,
      reply,
    });
  } catch (err: unknown) {
    console.error('Error invoking Zapier Agent:', err);
    const messageStr =
      err instanceof Error ? err.message : 'Unknown error during Zapier Agent execution.';
    return res.status(500).json({
      error: `Zapier Agent execution failed: ${messageStr}`,
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Zelvoro Zapier Agents SDK Gateway',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zelvoro server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
