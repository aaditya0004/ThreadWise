const { chatWithInbox } = require('../services/chatService');

// @desc    Chat with your email inbox
// @route   POST /api/chat
// @access  Private
const chat = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const answer = await chatWithInbox(req.user.id, query);
    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'AI Service failed' });
  }
};

module.exports = { chat };