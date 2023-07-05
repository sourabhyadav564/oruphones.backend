const express = require('express');
const router = express.Router();
const eventModal = require('@/database/modals/others/event_logs');

require('@/database/connection');


router.get('/getsession', (req, res) => {
  console.log(req.session)
res.send('Session details ' + req.session);
});

module.exports = router;
