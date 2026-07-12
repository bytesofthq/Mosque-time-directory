const express = require('express');
const router = express.Router();
const { getSitemap } = require('../controllers/sitemapController');

// @route   GET /sitemap.xml
// @desc    Get dynamic SEO sitemap
// @access  Public
router.get('/sitemap.xml', getSitemap);

module.exports = router;
