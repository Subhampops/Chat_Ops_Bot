# 🤖 ChatOps Deployment Bot (Slack + Jenkins)

A Slack bot that allows your dev team to **trigger and monitor CI/CD pipelines** using **slash commands** directly from Slack. Built using **Slack Bolt (Node.js)** and integrated with **Jenkins REST API**.

---

## 🚀 Features

* Slash command: `/deploy <env> <service>`

  * Example: `/deploy staging backend`
* Trigger Jenkins build jobs remotely
* Role-based permissions: only specific Slack users can deploy
* Easy token-based authentication
* Built using Node.js and Slack Bolt framework
* Extendable to rollback, build status, and Slack notifications

---

## 🧰 Tech Stack & Dependencies

| Tool/Library  | Purpose                         |
| ------------- | ------------------------------- |
| `@slack/bolt` | Slack bot framework for Node.js |
| `axios`       | HTTP requests to Jenkins API    |
| `dotenv`      | Environment variable management |
| `ngrok`       | Expose local server to Slack    |
| `Jenkins`     | CI/CD tool to trigger builds    |
| `Node.js`     | Backend runtime                 |

---

## 📁 Project Structure

```
slack-chatops-bot/
├── app.js           # Main Slack bot logic
├── jenkins.js       # Jenkins API logic
├── .env             # Secret tokens and config
├── package.json     # Node dependencies
```

---

## ✅ Prerequisites

* Node.js v14+ installed
* Jenkins installed & running on `http://localhost:8080`
* Slack Workspace + Slack App created
* [ngrok](https://ngrok.com/) installed (for tunneling Slack events)

---

## 📦 Install Dependencies

```bash
npm install
```

---

## 🔐 Create `.env` File

```env
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
PORT=3000

JENKINS_URL=http://localhost:8080
JENKINS_USER=admin
JENKINS_TOKEN=your-jenkins-api-token
AUTHORIZED_USERS=subham,teamlead,admin
```

> 💡 Tip: Generate your Jenkins token from:
> `Jenkins → Your Profile → Configure → API Token → Generate Token`

---

## 🧱 Slack App Setup Instructions

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Create a new app → **From Scratch**
3. Add a **Slash Command**:

   * `/deploy`
   * Request URL: `https://your-ngrok-url.ngrok.io/slack/events`
   * Short Description: `Trigger deployment to Jenkins`
4. Go to **OAuth & Permissions**:

   * Add Scopes: `chat:write`, `commands`
   * Install App to Workspace
5. Copy the **Bot Token** and **Signing Secret** into `.env`

---

## 🔧 Jenkins Job Naming Convention

Make sure Jenkins jobs follow this pattern:

```
<service-name>-<environment>
```

Example:

* `backend-staging`
* `frontend-production`

This is used to dynamically trigger the correct job from Slack.

---

## 🧠 How it Works

```bash
/deploy staging backend
```

* Slack sends a POST to `https://your-ngrok-url/slack/events`
* Bot checks user permission
* Bot calls Jenkins REST API to trigger the job `backend-staging`

---

## 🚀 Run Your Bot

### Start Node Server

```bash
node app.js
```

### Start ngrok (in a separate terminal)

```bash
ngrok http 3000
```

Update your Slack Slash Command URL with the HTTPS address from ngrok.

---

## 🛠 Example Code: `app.js`

```js
require('dotenv').config();
const { App } = require('@slack/bolt');
const jenkins = require('./jenkins');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: process.env.PORT || 3000,
});

app.command('/deploy', async ({ command, ack, say }) => {
  await ack();
  const [env, service] = command.text.trim().split(' ');
  const user = command.user_name;

  if (!env || !service) {
    return say('❗ Usage: `/deploy <env> <service>`');
  }

  if (!jenkins.isUserAuthorized(user)) {
    return say(`🚫 Sorry ${user}, you're not authorized to deploy.`);
  }

  try {
    await jenkins.triggerBuild(env, service);
    await say(`🚀 Triggered deployment of *${service}* to *${env}*`);
  } catch (err) {
    await say(`❌ Deployment failed: ${err.message}`);
  }
});

(async () => {
  await app.start();
  console.log('⚡ ChatOps Bot is running on port', process.env.PORT);
})();
```

---

## 🔧 Example Code: `jenkins.js`

```js
require('dotenv').config();
const axios = require('axios');

const AUTHORIZED_USERS = process.env.AUTHORIZED_USERS.split(',');

exports.isUserAuthorized = (username) => {
  return AUTHORIZED_USERS.includes(username);
};

exports.triggerBuild = async (env, service) => {
  const jobName = `${service}-${env}`;
  const url = `${process.env.JENKINS_URL}/job/${jobName}/build`;
  const auth = {
    username: process.env.JENKINS_USER,
    password: process.env.JENKINS_TOKEN,
  };

  const res = await axios.post(url, {}, { auth });
  if (res.status !== 201) {
    throw new Error(`Failed to trigger build. Jenkins responded with ${res.status}`);
  }
};
```

---

## 📌 Sample Slash Command

```
/deploy staging backend
```

✅ Deploys `backend-staging`
⛔ Fails if user is not in `AUTHORIZED_USERS`

---

## 💡 Future Improvements (Optional)

* `/rollback` command
* `/status` for pipeline status
* Slack notifications via Jenkins webhook
* Use HashiCorp Vault for secret storage
* Add logging with Winston

---

## 🧠 Author

Made with ❤️ by [Subham Bhattacharya](https://github.com/subhambhattacharya)
For educational and CI/CD automation use cases.

