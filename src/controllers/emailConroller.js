const {searchEmails} = require('../services/searchService');

// @desc    search through synced emails
// @route   GET /api/emails/search?q=keyword
// @access  Private
const search = async (req, res) => {
    const {q} = req.query;          // Get the query form the URL

    if(!q){
        return res.status(400).json({message: "Please provide a search query"});
    }

    const results = await searchEmails(req.user.id, q);
    res.json(results);
}

module.exports = {search};