const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Property backend is running. Use /api/... routes.");
});

app.post('/api/properties/batch', async (req, res) => {
  const properties = req.body;
  if (!Array.isArray(properties)) {
    return res.status(400).json({ error: 'Invalid input. Expected array.' });
  }

  try {
    const results = await Promise.all(properties.map(async (property) => {
      const { id, daft_api_key, myhome_api_key, acquaint_site_prefix } = property;
      const [daftData, myhomeData, acquaintData] = await Promise.all([
        fetchDaftProperty(id, daft_api_key),
        fetchMyhomeProperty(id, myhome_api_key),
        fetchAcquaintProperty(id, acquaint_site_prefix),
      ]);
      return { id, daftData, myhomeData, acquaintData };
    }));
    res.json(results);
  } catch (err) {
    console.error('Batch fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch batch properties' });
  }
});

const fetchDaftProperty = async (id, apiKey) => {
  if (!apiKey) return null;
  try {
    const res = await axios.get(`https://api.daft.ie/property/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.data;
  } catch { return null; }
};

const fetchMyhomeProperty = async (id, apiKey) => {
  if (!apiKey) return null;
  try {
    const res = await axios.get(`https://api.myhome.ie/property/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.data;
  } catch { return null; }
};

const fetchAcquaintProperty = async (id, sitePrefix) => {
  if (!sitePrefix) return null;
  try {
    const res = await axios.get(`https://api.integrators.acquaintcrm.co.uk/property/${id}`, {
      headers: { 'X-Site-Prefix': sitePrefix },
    });
    return res.data;
  } catch { return null; }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});