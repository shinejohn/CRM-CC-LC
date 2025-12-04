// ============================================
// TTS WORKER - Eleven Labs Integration
// Processes TTS requests from SQS queue
// ============================================

const AWS = require('aws-sdk');
const https = require('https');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const s3 = new AWS.S3();
const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });

let elevenLabsApiKey = null;

async function getElevenLabsApiKey() {
  if (elevenLabsApiKey) return elevenLabsApiKey;

  try {
    const command = new GetSecretValueCommand({
      SecretId: process.env.ELEVEN_LABS_API_KEY_SECRET || 'learning-center/elevenlabs/api-key',
    });
    const response = await secretsManager.send(command);
    elevenLabsApiKey = JSON.parse(response.SecretString);
    return elevenLabsApiKey;
  } catch (error) {
    console.error('Failed to retrieve Eleven Labs API key:', error);
    throw error;
  }
}

async function generateTTS(text, voiceId, settings = {}) {
  const apiKey = await getElevenLabsApiKey();
  
  const payload = JSON.stringify({
    text,
    model_id: settings.model_id || 'eleven_multilingual_v2',
    voice_settings: {
      stability: settings.stability || 0.5,
      similarity_boost: settings.similarity_boost || 0.75,
      style: settings.style || 0.0,
      use_speaker_boost: settings.use_speaker_boost !== false,
    },
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
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
          resolve(Buffer.concat(chunks));
        } else {
          reject(new Error(`Eleven Labs API error: ${res.statusCode} - ${chunks.toString()}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function uploadToS3(audioBuffer, key) {
  const bucketName = process.env.AUDIO_BUCKET;
  
  return s3
    .putObject({
      Bucket: bucketName,
      Key: key,
      Body: audioBuffer,
      ContentType: 'audio/mpeg',
      CacheControl: 'public, max-age=31536000',
    })
    .promise();
}

exports.handler = async (event) => {
  console.log('TTS Worker received event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);
      const {
        content_type, // 'slide' | 'faq' | 'ai_response'
        content_id,
        text,
        voice_id,
        presentation_id,
        slide_id,
        faq_id,
      } = message;

      console.log(`Processing TTS request: ${content_type} - ${content_id}`);

      // Generate audio
      const audioBuffer = await generateTTS(text, voice_id, message.voice_settings);

      // Determine S3 key based on content type
      let s3Key;
      if (content_type === 'slide') {
        s3Key = `presentations/${presentation_id}/audio/slide-${slide_id}.mp3`;
      } else if (content_type === 'faq') {
        s3Key = `faqs/${faq_id}.mp3`;
      } else {
        s3Key = `ai-responses/${content_id}.mp3`;
      }

      // Upload to S3
      await uploadToS3(audioBuffer, s3Key);

      const audioUrl = `https://${process.env.AUDIO_CDN_DOMAIN || 'your-cdn-domain'}/${s3Key}`;

      console.log(`✅ Audio generated and uploaded: ${s3Key}`);

      // Update database with audio URL (if needed)
      // This would require database connection logic here

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          audio_url: audioUrl,
          s3_key: s3Key,
        }),
      };
    } catch (error) {
      console.error('Error processing TTS request:', error);
      
      // Return error but don't throw (let SQS handle retries)
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: error.message,
        }),
      };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Processed' }),
  };
};


