/**
 * Omada SDN Controller Integration Service
 * Handles TP-Link Omada device management via REST API
 */

const axios = require('axios');
const https = require('https');

// Agent that accepts self-signed SSL certificates (for local Omada controllers)
const ignoreHttpsAgent = new https.Agent({
  rejectUnauthorized: false
});

class OmadaController {
  constructor(config) {
    this.host = config?.host || process.env.OMADA_HOST;
    this.port = config?.port || process.env.OMADA_PORT || 8043;
    this.username = config?.username || process.env.OMADA_USERNAME;
    this.password = config?.password || process.env.OMADA_PASSWORD;
    this.siteId = config?.siteId || process.env.OMADA_SITE_ID || 'default';
    this.useHttps = config?.useHttps !== undefined ? config.useHttps : (process.env.OMADA_USE_HTTPS === 'true');
    this.baseURL = `${this.useHttps ? 'https' : 'http'}://${this.host}:${this.port}/web/api/v1/sites/${this.siteId}`;
    this.token = null;
    this.tokenExpiry = null;
  }

  isConfigured() {
    return !!(this.host && this.username && this.password);
  }

  async authenticate() {
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }
    try {
      const axiosConfig = this.useHttps 
        ? { httpsAgent: ignoreHttpsAgent, timeout: 30000 }
        : { timeout: 30000 };
      
      const loginUrl = `${this.useHttps ? 'https' : 'http'}://${this.host}:${this.port}/web/api/v1/auth/login`;
      console.log(`[Omada] Attempting login to: ${loginUrl}`);
      
      const response = await axios.post(
        loginUrl,
        { userId: this.username, password: this.password },
        { headers: { 'Content-Type': 'application/json' }, ...axiosConfig }
      );
      
      console.log('[Omada] Response status:', response.status);
      console.log('[Omada] Response data keys:', Object.keys(response.data || {}));
      
      // Token can be in different locations depending on Omada version
      let token = null;
      if (response.data?.data?.token) {
        token = response.data.data.token;
      } else if (response.data?.token) {
        token = response.data.token;
      } else if (response.data?.data?.['@token']) {
        token = response.data.data['@token'];
      }
      
      if (token) {
        this.token = token;
        this.tokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
        console.log('[Omada] Authenticated successfully');
        return this.token;
      }
      
      console.error('[Omada] Invalid authentication response structure:', JSON.stringify(response.data));
      throw new Error('Invalid authentication response');
    } catch (error) {
      console.error('[Omada] Auth failed:', error.message);
      if (error.response) {
        console.error('[Omada] Response status:', error.response.status);
        console.error('[Omada] Response data:', error.response.data);
      }
      throw new Error(`Omada auth failed: ${error.message}`);
    }
  }

  async getHeaders() {
    const token = await this.authenticate();
    return { 'Content-Type': 'application/json', 'X-Auth': token, 'X-Site-Id': this.siteId };
  }

  async getAxiosConfig() {
    const baseConfig = this.useHttps 
      ? { httpsAgent: ignoreHttpsAgent }
      : {};
    return { headers: await this.getHeaders(), timeout: 10000, ...baseConfig };
  }

  async getAccessPoints() {
    const config = await this.getAxiosConfig();
    const response = await axios.get(`${this.baseURL}/apInfos`, config);
    return response.data?.data || [];
  }

  async getConnectedClients() {
    const config = await this.getAxiosConfig();
    const response = await axios.get(`${this.baseURL}/clientInfos`, config);
    return response.data?.data || [];
  }

  async getClient(mac) {
    const config = await this.getAxiosConfig();
    const response = await axios.get(`${this.baseURL}/clientInfos/${mac}`, config);
    return response.data?.data || null;
  }

  async disconnectClient(mac) {
    const config = await this.getAxiosConfig();
    const response = await axios.post(`${this.baseURL}/kickClient`, { cMac: mac }, config);
    return response.data?.success !== false;
  }

  addToFilterList(currentList, mac, action) {
    const existing = currentList.find(item => item.mac === mac);
    if (existing) {
      existing.action = action;
      return currentList;
    }
    return [...currentList, { mac, action }];
  }

  removeFromFilterList(currentList, mac) {
    return currentList.filter(item => item.mac !== mac);
  }

  async blockClient(mac) {
    const config = await this.getAxiosConfig();
    const aps = await this.getAccessPoints();
    if (!aps || aps.length === 0) return false;
    const ap = aps[0];
    const apMac = ap.mac || ap.deviceMac;
    const response = await axios.put(
      `${this.baseURL}/ap/${apMac}`,
      {
        __action: 'setWifiConfig',
        data: {
          wifiConfigs: ap.wifiConfigs || [],
          macFilterList: this.addToFilterList(ap.macFilterList || [], mac, 'block')
        }
      },
      config
    );
    return response.data?.success !== false;
  }

  async allowClient(mac) {
    const config = await this.getAxiosConfig();
    const aps = await this.getAccessPoints();
    if (!aps || aps.length === 0) return false;
    const ap = aps[0];
    const apMac = ap.mac || ap.deviceMac;
    const response = await axios.put(
      `${this.baseURL}/ap/${apMac}`,
      {
        __action: 'setWifiConfig',
        data: {
          wifiConfigs: ap.wifiConfigs || [],
          macFilterList: this.addToFilterList(ap.macFilterList || [], mac, 'allow')
        }
      },
      config
    );
    return response.data?.success !== false;
  }

  async unblockClient(mac) {
    const config = await this.getAxiosConfig();
    const aps = await this.getAccessPoints();
    if (!aps || aps.length === 0) return false;
    const ap = aps[0];
    const apMac = ap.mac || ap.deviceMac;
    const currentList = ap.macFilterList || [];
    const filtered = this.removeFromFilterList(currentList, mac);
    const response = await axios.put(
      `${this.baseURL}/ap/${apMac}`,
      {
        __action: 'setWifiConfig',
        data: {
          wifiConfigs: ap.wifiConfigs || [],
          macFilterList: filtered
        }
      },
      config
    );
    return response.data?.success !== false;
  }
}

module.exports = OmadaController;