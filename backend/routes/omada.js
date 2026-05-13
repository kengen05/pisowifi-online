const express = require('express');
const OmadaController = require('../services/omada');

const router = express.Router();

// Initialize Omada controller
const omada = new OmadaController();

// GET /api/omada/config - Get Omada configuration (frontend expects this)
router.get('/config', (req, res) => {
  res.json({
    configured: omada.isConfigured(),
    host: omada.isConfigured() ? omada.host : null,
    port: omada.isConfigured() ? omada.port : null,
    username: omada.isConfigured() ? omada.username : null,
    siteId: omada.isConfigured() ? omada.siteId : null,
    isConnected: omada.isConfigured(),
    message: omada.isConfigured() ? 'Omada controller is configured' : 'Omada controller is not configured'
  });
});

// GET /api/omada/status - Check if Omada is configured and available
router.get('/status', (req, res) => {
  res.json({
    configured: omada.isConfigured(),
    host: omada.isConfigured() ? omada.host : null,
    siteId: omada.isConfigured() ? omada.siteId : null,
    message: omada.isConfigured() ? 'Omada controller is configured' : 'Omada controller is not configured'
  });
});

// POST /api/omada/test-connection - Test Omada connection (frontend expects this)
router.post('/test-connection', async (req, res) => {
  try {
    if (!omada.isConfigured()) {
      return res.status(503).json({ success: false, message: 'Omada controller is not configured' });
    }
    // Try to authenticate
    await omada.authenticate();
    res.json({ success: true, message: 'Connection successful' });
  } catch (error) {
    console.error('[Omada Routes] Test connection failed:', error);
    res.status(500).json({ success: false, message: error.message || 'Test connection failed' });
  }
});

// GET /api/omada/devices - Get devices (frontend expects this)
router.get('/devices', async (req, res) => {
  try {
    if (!omada.isConfigured()) {
      return res.status(503).json({ success: false, devices: [], message: 'Omada controller is not configured' });
    }
    const aps = await omada.getAccessPoints();
    res.json({ devices: aps });
  } catch (error) {
    console.error('[Omada Routes] Error getting devices:', error);
    res.status(500).json({ success: false, devices: [], message: 'Failed to get devices' });
  }
});

// POST /api/omada/kick-client - Kick a client (frontend expects this)
router.post('/kick-client', async (req, res) => {
  try {
    const { mac } = req.body;
    if (!mac) {
      return res.status(400).json({ success: false, message: 'MAC address is required' });
    }
    if (!omada.isConfigured()) {
      return res.status(503).json({ success: false, message: 'Omada controller is not configured' });
    }
    const success = await omada.disconnectClient(mac);
    if (success) {
      res.json({ success: true, message: `Client ${mac} disconnected` });
    } else {
      res.status(500).json({ success: false, message: 'Failed to disconnect client' });
    }
  } catch (error) {
    console.error('[Omada Routes] Error kicking client:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to kick client' });
  }
});

// POST /api/omada/block-client - Block a client (frontend expects this)
router.post('/block-client', async (req, res) => {
  try {
    const { mac, disable } = req.body;
    if (!mac) {
      return res.status(400).json({ success: false, message: 'MAC address is required' });
    }
    if (!omada.isConfigured()) {
      return res.status(503).json({ success: false, message: 'Omada controller is not configured' });
    }
    
    if (disable) {
      const success = await omada.blockClient(mac);
      if (success) {
        res.json({ success: true, message: `Client ${mac} blocked` });
      } else {
        res.status(500).json({ success: false, message: 'Failed to block client' });
      }
    } else {
      const success = await omada.allowClient(mac);
      if (success) {
        res.json({ success: true, message: `Client ${mac} allowed` });
      } else {
        res.status(500).json({ success: false, message: 'Failed to allow client' });
      }
    }
  } catch (error) {
    console.error('[Omada Routes] Error blocking client:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to block client' });
  }
});

// POST /api/omada/disconnect-user - Disconnect all sessions for a user (frontend expects this)
router.post('/disconnect-user', async (req, res) => {
  try {
    const { mac, username } = req.body;
    if (!mac && !username) {
      return res.status(400).json({ success: false, message: 'MAC address or username is required' });
    }
    if (!omada.isConfigured()) {
      return res.status(503).json({ success: false, message: 'Omada controller is not configured' });
    }
    
    let success;
    if (mac) {
      success = await omada.disconnectClient(mac);
    } else {
      // Disconnect by username (search all clients)
      const clients = await omada.getConnectedClients();
      const targetClients = clients.filter(c => c.username === username);
      success = targetClients.length > 0;
      for (const client of targetClients) {
        await omada.disconnectClient(client.mac);
      }
    }
    
    if (success) {
      res.json({ success: true, message: 'All sessions for user disconnected' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to disconnect user' });
    }
  } catch (error) {
    console.error('[Omada Routes] Error disconnecting user:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to disconnect user' });
  }
});


// GET /api/omada/aps - Get all access points
router.get('/aps', async (req, res) => {
  try {
    if (!omada.isConfigured()) {
      return res.status(503).json({ error: 'Omada controller is not configured' });
    }
    const aps = await omada.getAccessPoints();
    res.json({ data: aps });
  } catch (error) {
    console.error('[Omada Routes] Error getting APs:', error);
    res.status(500).json({ error: 'Failed to get access points' });
  }
});

// GET /api/omada/clients - Get all connected clients
router.get('/clients', async (req, res) => {
  try {
    if (!omada.isConfigured()) {
      return res.status(503).json({ error: 'Omada controller is not configured' });
    }
    const clients = await omada.getConnectedClients();
    res.json({ data: clients });
  } catch (error) {
    console.error('[Omada Routes] Error getting clients:', error);
    res.status(500).json({ error: 'Failed to get connected clients' });
  }
});

// GET /api/omada/client/:mac - Get specific client
router.get('/client/:mac', async (req, res) => {
  try {
    if (!omada.isConfigured()) {
      return res.status(503).json({ error: 'Omada controller is not configured' });
    }
    const client = await omada.getClient(req.params.mac);
    if (client) {
      res.json({ data: client });
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    console.error('[Omada Routes] Error getting client:', error);
    res.status(500).json({ error: 'Failed to get client' });
  }
});

// POST /api/omada/client/:mac/disconnect - Disconnect a client
router.post('/client/:mac/disconnect', async (req, res) => {
  try {
    if (!omada.isConfigured()) {
      return res.status(503).json({ error: 'Omada controller is not configured' });
    }
    const success = await omada.disconnectClient(req.params.mac);
    if (success) {
      res.json({ message: `Client ${req.params.mac} disconnected` });
    } else {
      res.status(500).json({ error: 'Failed to disconnect client' });
    }
  } catch (error) {
    console.error('[Omada Routes] Error disconnecting client:', error);
    res.status(500).json({ error: 'Failed to disconnect client' });
  }
});

// POST /api/omada/client/:mac/block - Block a client
router.post('/client/:mac/block', async (req, res) => {
  try {
    if (!omada.isConfigured()) {
      return res.status(503).json({ error: 'Omada controller is not configured' });
    }
    const success = await omada.blockClient(req.params.mac);
    if (success) {
      res.json({ message: `Client ${req.params.mac} blocked` });
    } else {
      res.status(500).json({ error: 'Failed to block client' });
    }
  } catch (error) {
    console.error('[Omada Routes] Error blocking client:', error);
    res.status(500).json({ error: 'Failed to block client' });
  }
});

// POST /api/omada/client/:mac/allow - Allow a client (grant WiFi access)
router.post('/client/:mac/allow', async (req, res) => {
  try {
    if (!omada.isConfigured()) {
      return res.status(503).json({ error: 'Omada controller is not configured' });
    }
    const success = await omada.allowClient(req.params.mac);
    if (success) {
      res.json({ message: `Client ${req.params.mac} allowed - WiFi access granted` });
    } else {
      res.status(500).json({ error: 'Failed to allow client' });
    }
  } catch (error) {
    console.error('[Omada Routes] Error allowing client:', error);
    res.status(500).json({ error: 'Failed to allow client' });
  }
});

// POST /api/omada/client/:mac/unblock - Unblock a client
router.post('/client/:mac/unblock', async (req, res) => {
  try {
    if (!omada.isConfigured()) {
      return res.status(503).json({ error: 'Omada controller is not configured' });
    }
    const success = await omada.unblockClient(req.params.mac);
    if (success) {
      res.json({ message: `Client ${req.params.mac} unblocked` });
    } else {
      res.status(500).json({ error: 'Failed to unblock client' });
    }
  } catch (error) {
    console.error('[Omada Routes] Error unblocking client:', error);
    res.status(500).json({ error: 'Failed to unblock client' });
  }
});

// POST /api/omada/update-config - Update Omada configuration
router.post('/update-config', (req, res) => {
  try {
    const { host, port, username, password, siteId } = req.body;
    
    if (!host || !port || !username) {
      return res.status(400).json({ success: false, message: 'Host, port, and username are required' });
    }

    // Update Omada controller instance with new configuration
    omada.host = host;
    omada.port = port;
    omada.username = username;
    omada.password = password || omada.password;
    omada.siteId = siteId || 'default';
    omada.baseURL = `${omada.useHttps ? 'https' : 'http'}://${omada.host}:${omada.port}/web/api/v1/sites/${omada.siteId}`;
    omada.token = null; // Reset token when config changes
    omada.tokenExpiry = null;

    // Also update environment variables for persistence
    process.env.OMADA_HOST = host;
    process.env.OMADA_PORT = port;
    process.env.OMADA_USERNAME = username;
    if (password) process.env.OMADA_PASSWORD = password;
    process.env.OMADA_SITE_ID = siteId || 'default';

    res.json({ 
      success: true, 
      message: 'Configuration updated successfully',
      config: {
        host: omada.host,
        port: omada.port,
        username: omada.username,
        siteId: omada.siteId
      }
    });
  } catch (error) {
    console.error('[Omada Routes] Error updating config:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update configuration' });
  }
});

module.exports = router;