require('dotenv').config();
const jenkinsapi = require('jenkins-api');

const { JENKINS_URL, JENKINS_USER, JENKINS_TOKEN } = process.env;
const jenkins = jenkinsapi.init(`http://${JENKINS_USER}:${JENKINS_TOKEN}@localhost:8080`);

const AUTHORIZED_USERS = ['subham', 'dev-lead']; // Add your Slack usernames

exports.isUserAuthorized = (user) => AUTHORIZED_USERS.includes(user);

exports.triggerBuild = (env, service) => {
  return new Promise((resolve, reject) => {
    const jobName = `${service}-${env}`;
    jenkins.build(jobName, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};
