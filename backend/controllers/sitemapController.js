const { SitemapStream, streamToPromise } = require('sitemap');
const Mosque = require('../models/Mosque');

// @desc    Generate and serve dynamic sitemap.xml
// @route   GET /sitemap.xml
// @access  Public
const getSitemap = async (req, res) => {
  try {
    const sitemap = new SitemapStream({ hostname: 'https://salahdirectory.in' });

    // 1. Write Important Static Pages
    sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    sitemap.write({ url: '/nearby-mosques', changefreq: 'daily', priority: 0.8 });
    sitemap.write({ url: '/search', changefreq: 'daily', priority: 0.8 });
    sitemap.write({ url: '/register-mosque', changefreq: 'monthly', priority: 0.6 });

    // 2. Fetch all Mosques from DB and write dynamic paths
    // Only fetch slug and updatedAt for database and speed optimization
    const mosques = await Mosque.find({}, 'slug updatedAt');

    mosques.forEach((mosque) => {
      // Use fallback to id if slug is missing
      const identifier = mosque.slug || mosque._id.toString();
      sitemap.write({
        url: `/mosques/${identifier}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: mosque.updatedAt ? mosque.updatedAt.toISOString() : undefined
      });
    });

    sitemap.end();

    // 3. Convert stream to XML string
    const xml = await streamToPromise(sitemap).then((sm) => sm.toString());

    // 4. Return valid XML response
    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(500).send('Error generating sitemap');
  }
};

module.exports = {
  getSitemap
};
