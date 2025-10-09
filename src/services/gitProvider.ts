import type { Repository, Commit, CommitDetail, GitProvider } from '../types/git';

class GitHubProvider implements GitProvider {
  private readonly baseUrl = 'https://api.github.com';

  async fetchRepositories(
    username: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<Repository[]> {
    const response = await fetch(
      `${this.baseUrl}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated`
    );
    
    this.handleErrors(response);
    return response.json();
  }

  async fetchCommits(
    username: string,
    repo: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<Commit[]> {
    const response = await fetch(
      `${this.baseUrl}/repos/${username}/${repo}/commits?page=${page}&per_page=${perPage}`
    );
    
    this.handleErrors(response);
    return response.json();
  }

  async fetchCommitDetail(
    username: string,
    repo: string,
    sha: string
  ): Promise<CommitDetail> {
    const response = await fetch(
      `${this.baseUrl}/repos/${username}/${repo}/commits/${sha}`
    );
    
    this.handleErrors(response);
    return response.json();
  }

  private handleErrors(response: Response): void {
    if (response.status === 404) {
      throw new Error('Resource not found');
    }
    if (response.status === 403) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
  }
}

// Factory function to create git provider instance
// This makes it easy to switch to a different provider (GitLab, Bitbucket, etc.)
export const createGitProvider = (): GitProvider => {
  return new GitHubProvider();
};