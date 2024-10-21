const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.saveSharedDashboardAnalyticsHttp = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { userId, callId, analyticsData } = req.body;

  if (!userId || !callId || !analyticsData) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  try {
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await userRef.update({
      [`analytics.${callId}`]: analyticsData
    });

    res.status(200).json({ success: true, message: 'Analytics saved successfully' });
  } catch (error) {
    console.error('Error saving shared dashboard analytics:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});