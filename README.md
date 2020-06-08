![](https://github.com/AbsolutelyNothingToSeeHere/Branch-Dictator/workflows/Build/badge.svg?branch=master)
![](https://github.com/AbsolutelyNothingToSeeHere/Branch-Dictator/workflows/Deploy/badge.svg)
[![codecov](https://codecov.io/gh/AbsolutelyNothingToSeeHere/Branch-Dictator/branch/master/graph/badge.svg)](https://codecov.io/gh/AbsolutelyNothingToSeeHere/Branch-Dictator)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/AbsolutelyNothingToSeeHere/Branch-Dictator.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/AbsolutelyNothingToSeeHere/Branch-Dictator/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/AbsolutelyNothingToSeeHere/Branch-Dictator.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/AbsolutelyNothingToSeeHere/Branch-Dictator/context:javascript)


# Branch Dictator 👑
Oh, you thought this was a democracy? Guess again... in this kingdom, branches are micromanaged and admins have less power ¯\\\_(ツ)\_/¯

## Setup
Interested in using Branch Dictator to keep your kingdom in line? Let's get started.

### Fork this Repo
The first step to setting up your own instance of Branch Dictator is to fork this repo. It's designed to be used within an org, so make sure to fork this repo into an org, not under a personal account. If you don't have an org, you can [create one for free](https://github.com/organizations/plan)!

### CI/CD
This app uses GitHub Secrets in conjunction with GitHub Actions to perform all CI and CD actions. After forking into your org, head over to [your app's Secrets](../../settings/secrets) and set the following values:

#### `CODECOV_API_KEY`
This project uses Codecov for coverage analysis. Navigate to `codecov.io` and follow the steps to link your org and repo. When you're done, you'll be provided with an API key.

#### Heroku
This app uses a GitHub Action to deploy to Heroku; if you'd prefer to use your own hosting solution, make sure to remove that action and ignore the following sections. If you'd like to use Heroku, make sure to [create an account](https://signup.heroku.com) before continuing if you don't already have one.

##### `HEROKU_API_KEY`
Create a new [Heroku Authorization](https://dashboard.heroku.com/account/applications/authorizations/new) with a description of `Branch Dictator API Key` or something similar, leave **Expires after (seconds)** blank, and hit **Create**.

##### `HEROKU_APP_NAME`
Choose a name for your app in Heroku. This name must be unique across all of Heroku, so make sure to use something like your GitHub org name to make it unique (e.g., `some-org-branch-dictator`).

##### `HEROKU_EMAIL`
The email account associated with your Heroku account. This can be found in your [Heroku Account Settings](https://dashboard.heroku.com/account).

### Environment Variables
This app has a handful of environment variables. The instructions below are for Heroku, but other cloud environments will have a similar method of setting them.

[Eventually these values will be stored within the repo's secrets](https://github.com/AbsolutelyNothingToSeeHere/Branch-Dictator/issues/25), but for now you'll need to set them manually. After creating your app, navigate to your app's Settings tab, scroll to **Config Vars** and set the following values:

#### `GITHUB_TOKEN`
Create a [Personal Access Token](https://github.com/settings/tokens) with a note of `Branch Dictator` (or something else of your choice) and enable just the `repo` scope (*NOTE*: when selecting `repo`, all the children of the `repo` scope will automatically be enabled) and click **Generate token**.

#### `WEBHOOK_SECRET`
This will be used within the [Configuring the Webhook](#configuring-the-webhook) section below, but can be whatever text you'd like (just make sure it's not blank!).

#### `NODE_ENV`
Set this value to `production` to ensure the app behaves as expected and will not start if certain required variables are not present.

#### LGTM
This project also uses [LGTM](https://lgtm.com) for codescanning. If you'd like to use LGTM within your project, create an account and follow the steps to link your repo and install the LGTM app within your org.

### Configuring the Webhook
Once your app is deployed and ready to go, you'll need to create a webhook to ensure the app is notified when repos are created. Head to your org's settings page and navigate to the **Webhooks** section. Click **Add webhook** and use the following values:
- Payload URL: `{your-app's-URL}/api/webhook/repository}` (e.g., https://my-branch-dictator/api/webhook/repository)
- Content type: `application/json`
- Secret: Your secret from the [`WEBHOOK_SECRET`](#webhook-secret) section above
- SSL verification: :white_check_mark: `Enable SSL Verification`
- Which events would you like to trigger this webhook?: `Let me select individual events` - uncheck all except:
  - `Repositories`
- Active: :white_check_mark:

Click **Add webhook** and wait for the response from your app. If you see anything but a `200` status code on the response, make sure to click back into the webhook settings, scroll down, and click on the `Response` tab to see more info. If you see a `200`, you're all set! To make sure things are working, create a new public repo with a `README` and then check the repo's branch protection settings and validate that an issue was creted notifying you of the change to the settings.

## Development
### Environment Variables
Project environment variables should first be defined in `.env.sample` without real values for their data (that file is tracked by git). After cloning, make sure to duplicate `.env.sample` as `.env` and then fill in all required variables.

### Dependencies
This project is reliant on the installation of the following dependencies:
- [Node (LTS)](https://nodejs.org/en/download/) (v12.0+)

After downlodaing the dependencies above, install all NPM dependencies by running `npm i`.

### Starting the App
The best way to start the app and work on it is by using `npm run dev`, which will start the app and then restart the app whenever a TypeScript file changes. After modifying a non-Typescript file, restart the app by typing `rs` into the same terminal you ran `npm run dev` from and then hitting return.

After the app starts, it will be accessible on `localhost:3000` (unless the port was modified via `.env`).
