module.exports = {
  id (session, args) {
    // hash the session id
    const crypto = require('crypto')
    return crypto
      .createHmac('sha256', process.env.SESSION_SECRET)
      .update(session.sid)
      .digest('hex')
  },
  ipAddress (session, args) {
    return session.sess.ip
  },
  userAgent (session, args) {
    return session.sess.ua
  },
  email (session, args) {
    return session.sess.email
  },
  expiresAt (session, args) {
    return session.expire
  },
  cookie (session, args) {
    return JSON.stringify(session.sess.cookie)
  }
}
