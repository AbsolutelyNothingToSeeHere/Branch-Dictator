import { Octokit } from '@octokit/rest';

const githubToken = process.env.GITHUB_TOKEN;

const github = new Octokit({
  auth: githubToken,
  userAgent: 'Branch Dictator',
});

export default github;
