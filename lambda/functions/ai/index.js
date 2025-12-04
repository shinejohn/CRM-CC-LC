// ============================================
// AI CONVERSATION HANDLER
// Handles AI chat requests using OpenRouter
// ============================================

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { RDSDataClient, ExecuteStatementCommand } = require('@aws-sdk/client-rds-data');
const https = require('https');

const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });
const rdsData = new RDSDataClient({ region: process.env.AWS_REGION || 'us-east-1' });

let openRouterApiKey = null;
let dbSecret = null;

async function getOpenRouterApiKey() {
  if (openRouterApiKey) return openRouterApiKey;

  try {
    const command = new GetSecretValueCommand({
      SecretId: process.env.OPENROUTER_API_KEY_SECRET || 'learning-center/openrouter/api-key',
    });
    const response = await secretsManager.send(command);
    openRouterApiKey = response.SecretString;
    return openRouterApiKey;
  } catch (error) {
    console.error('Failed to retrieve OpenRouter API key:', error);
    throw error;
  }
}

async function getDatabaseSecret() {
  if (dbSecret) return dbSecret;

  try {
    const command = new GetSecretValueCommand({
      SecretId: process.env.DATABASE_SECRET_ARN,
    });
    const response = await secretsManager.send(command);
    dbSecret = JSON.parse(response.SecretString);
    return dbSecret;
  } catch (error) {
    console.error('Failed to retrieve database secret:', error);
    throw error;
  }
}

async function buildAIContext(customerId, tenantId) {
  // Build comprehensive AI context from database
  // This includes product knowledge, industry knowledge, and customer data
  
  const secret = await getDatabaseSecret();
  
  // Query knowledge base for relevant content
  const knowledgeQuery = `
    SELECT title, content, category, source, validation_status
    FROM knowledge_base
    WHERE tenant_id = :tenantId
      AND is_public = true
    ORDER BY usage_count DESC, helpful_count DESC
    LIMIT 50
  `;

  // Query customer data
  const customerQuery = `
    SELECT * FROM customers
    WHERE id = :customerId
    LIMIT 1
  `;

  // Query FAQs
  const faqQuery = `
    SELECT question, answer, category
    FROM knowledge_base
    WHERE tenant_id = :tenantId
      AND category = 'faq'
    LIMIT 100
  `;

  // Execute queries and build context
  // (Implementation would execute these queries and format the context)
  
  return {
    product_knowledge: [],
    industry_knowledge: [],
    customer_data: {},
    faqs: [],
  };
}

async function callOpenRouter(messages, context) {
  const apiKey = await getOpenRouterApiKey();

  const systemPrompt = `You are an AI assistant for Fibonacco, helping local businesses understand how AI employees can transform their operations.

CONTEXT:
${JSON.stringify(context, null, 2)}

INSTRUCTIONS:
- Answer questions based on the provided context
- If information is missing, ask intelligent questions to fill gaps
- Suggest creating FAQs when you provide new information
- Be conversational, helpful, and professional
- Focus on how AI can solve specific business problems

When you suggest actions, use this format:
ACTION: {"type": "update_customer_data", "data": {...}}
ACTION: {"type": "create_faq", "data": {"question": "...", "answer": "..."}}`;

  const payload = JSON.stringify({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://fibonacco.com',
        'X-Title': 'Fibonacco Learning Center',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(Buffer.concat(chunks).toString());
            resolve(response.choices[0].message.content);
          } catch (error) {
            reject(new Error(`Failed to parse OpenRouter response: ${error.message}`));
          }
        } else {
          reject(new Error(`OpenRouter API error: ${res.statusCode} - ${Buffer.concat(chunks).toString()}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

exports.handler = async (event) => {
  console.log('AI Handler received event:', JSON.stringify(event, null, 2));

  try {
    const { httpMethod, path, body, headers } = event;
    const route = path.split('/').pop();

    if (httpMethod === 'POST' && route === 'chat') {
      const request = JSON.parse(body);
      const { message, context, agent_id } = request;

      // Build AI context
      const aiContext = await buildAIContext(
        context?.customer_id,
        headers['x-tenant-id'] || 'default'
      );

      // Get conversation history if conversation_id exists
      const conversationMessages = context?.conversation_id
        ? [] // TODO: Load from database
        : [];

      // Add user message
      conversationMessages.push({ role: 'user', content: message });

      // Call OpenRouter
      const aiResponse = await callOpenRouter(conversationMessages, aiContext);

      // Parse actions from response
      const actions = [];
      const actionRegex = /ACTION:\s*(\{.*?\})/g;
      let match;
      while ((match = actionRegex.exec(aiResponse)) !== null) {
        try {
          actions.push(JSON.parse(match[1]));
        } catch (e) {
          console.error('Failed to parse action:', match[1]);
        }
      }

      // Clean response (remove ACTION markers)
      const cleanResponse = aiResponse.replace(/ACTION:\s*\{.*?\}/g, '').trim();

      // Save conversation to database
      // TODO: Implement conversation saving

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          response: cleanResponse,
          conversation_id: context?.conversation_id || `conv-${Date.now()}`,
          message_id: `msg-${Date.now()}`,
          suggested_actions: actions,
          confidence_score: 0.9,
        }),
      };
    }

    if (httpMethod === 'POST' && route === 'context') {
      const request = JSON.parse(body);
      const { customer_id } = request;

      const context = await buildAIContext(
        customer_id,
        headers['x-tenant-id'] || 'default'
      );

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          context: JSON.stringify(context),
          product_knowledge: context.product_knowledge,
          industry_knowledge: context.industry_knowledge,
          customer_data: context.customer_data,
        }),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error in AI handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};


