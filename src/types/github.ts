/* eslint-disable camelcase */

export interface RepositoryWebhookPayload {
  action: 'created' | string;
  repository: {
    name: string;
    owner: {
      login: string;
    };
    private: boolean;
    default_branch: string;
  };
  // organization
  // installation
  sender: {
    login: string;
  };
}
