require('dotenv').config();
const path = require('path');
const Fastify = require('fastify');
const fastifyStatic = require('@fastify/static');
const twilio = require('twilio');

const app = Fastify({ logger: true });

// Serve static files
app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/',
});

// Twilio setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

// API: Lookup phone number
app.post('/api/lookup', async (req, reply) => {
  const { phone } = req.body;
  if (!phone) return reply.code(400).send({ valid: false, error: 'Phone required' });
  try {
    const result = await client.lookups.v2.phoneNumbers(phone).fetch();
    // Extract only the essential information to avoid circular reference issues
    reply.send({
      valid: true, 
      phoneNumber: result.phoneNumber,
      nationalFormat: result.nationalFormat,
      countryCode: result.countryCode,
      callingCountryCode: result.callingCountryCode
    });
  } catch (err) {
    reply.code(400).send({ valid: false, error: err.message });
  }
});

// API: Start phone verification
app.post('/api/verify/phone', async (req, reply) => {
  const { phone } = req.body;
  if (!phone) return reply.code(400).send({ error: 'Phone required' });
  try {
    await client.verify.v2.services(VERIFY_SERVICE_SID).verifications.create({
      to: phone,
      channel: 'sms',
    });
    reply.send({ success: true });
  } catch (err) {
    reply.code(400).send({ success: false, error: err.message });
  }
});

// API: Validate phone verification
app.post('/api/verify/phone/validate', async (req, reply) => {
  const { phone, code } = req.body;
  if (!phone || !code) return reply.code(400).send({ error: 'Phone and code required' });
  try {
    const result = await client.verify.v2.services(VERIFY_SERVICE_SID).verificationChecks.create({
      to: phone,
      code,
    });
    reply.send({ valid: result.status === 'approved' });
  } catch (err) {
    reply.code(400).send({ valid: false, error: err.message });
  }
});

// API: Start email verification
app.post('/api/verify/email', async (req, reply) => {
  const { email } = req.body;
  if (!email) return reply.code(400).send({ error: 'Email required' });
  try {
    await client.verify.v2.services(VERIFY_SERVICE_SID).verifications.create({
      to: email,
      channel: 'email',
    });
    reply.send({ success: true });
  } catch (err) {
    reply.code(400).send({ success: false, error: err.message });
  }
});

// API: Validate email verification
app.post('/api/verify/email/validate', async (req, reply) => {
  const { email, code } = req.body;
  if (!email || !code) return reply.code(400).send({ error: 'Email and code required' });
  try {
    const result = await client.verify.v2.services(VERIFY_SERVICE_SID).verificationChecks.create({
      to: email,
      code,
    });
    reply.send({ valid: result.status === 'approved' });
  } catch (err) {
    reply.code(400).send({ valid: false, error: err.message });
  }
});

// Fallback: serve index.html for all other routes
app.setNotFoundHandler((req, reply) => {
  reply.sendFile('index.html');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen({ port: PORT, host: '0.0.0.0' }, err => {
  if (err) throw err;
  console.log(`Server running on port ${PORT}`);
});
