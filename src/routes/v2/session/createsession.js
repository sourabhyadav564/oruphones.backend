const express = require('express');
const router = express.Router();
const eventModal = require('@/database/modals/others/event_logs');

require('@/database/connection');

router.post('/session', async (req, res) => {
  try {
    const userUniqueId = req.session.User.userUniqueId;
    const sessionId = req.sessionID;
    const eventName = req.headers.eventname;
    const srcFrom = req.headers.srcfrom;
    const devicePlatform = req.headers.deviceplatform;
    const location = req.headers.location;

    if (!userUniqueId) {
      // User is not logged in
      if (!sessionId) {
        res.status(400).json({
          reason: 'Session ID is required for guest session',
          statusCode: 400,
          status: 'FAILURE',
        });
        return;
      }

      const guestSession = await eventModal.findOne({
        sessionId,
        userUniqueId: 'guest',
      });

      if (guestSession) {
        // Guest session already exists, append event
        guestSession.events.push({
          eventName,
        });
        await guestSession.save();
        res.status(200).json({
          reason: 'Event appended to guest session',
          statusCode: 200,
          status: 'SUCCESS',
          guestSession,
        });
      } else {
        // Create new guest session
        const headerInfo = {
          userUniqueId: 'guest',
          events: [
            {
              eventName,
            },
          ],
          srcFrom,
          sessionId,
          devicePlatform,
          location,
        };
        const guestSessionObject = new eventModal(headerInfo);
        const savedGuestSession = await guestSessionObject.save();
        res.status(201).json({
          reason: 'Guest session created successfully',
          statusCode: 201,
          status: 'SUCCESS',
          guestSession: savedGuestSession,
        });
      }
    } else {
      // User is logged in
      const userSession = await eventModal.findOne({
        userUniqueId,
      });
      if (userSession) {
        // User session already exists, append event
        userSession.events.push({
          eventName,
        });
        await userSession.save();
        res.status(200).json({
          reason: 'Event appended to user session',
          statusCode: 200,
          status: 'SUCCESS',
          userSession,
        });
      } else {
        // Create new user session
        const headerInfo = {
          userUniqueId,
          events: [
            {
              eventName,
            },
          ],
          srcFrom,
          sessionId,
          devicePlatform,
          location,
        };
        const userSessionObject = new eventModal(headerInfo);
        const savedUserSession = await userSessionObject.save();
        res.status(201).json({
          reason: 'User session created successfully',
          statusCode: 201,
          status: 'SUCCESS',
          userSession: savedUserSession,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get('/getsession', (req, res) => {
  console.log(req.session)
res.send('Session details ' + req.session);
});

module.exports = router;
