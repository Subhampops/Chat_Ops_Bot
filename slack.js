const jenkins = require('./jenkins');

exports.handleSlashCommand = async (req, res) => {
  const { text, user_name } = req.body;
  const [env, service] = text.split(' ');

  if (!jenkins.isUserAuthorized(user_name)) {
    return res.send(`🚫 ${user_name}, you’re not allowed to deploy.`);
  }

  try {
    await jenkins.triggerBuild(env, service);
    res.send(`🚀 Deployment started for *${service}* on *${env}*`);
  } catch (err) {
    res.send(`❌ Deployment failed: ${err.message}`);
  }
};
