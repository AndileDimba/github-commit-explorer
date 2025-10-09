export interface Repository {
  id: number;
  name: string;
  description: string | null;
  owner: {
    login: string;
  };
  html_url: string;
  updated_at: string;
  stargazers_count: number;
  language: string | null;
}

export interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
}

export interface CommitDetail extends Commit {
  files?: FileChange[];
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
}

export interface FileChange {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface FavoriteCommit {
  commit: Commit;
  repoName: string;
  username: string;
  repoUrl: string;
  commitUrl: string;
  savedAt: string;
}

export interface GitProvider {
  fetchRepositories(username: string, page?: number, perPage?: number): Promise<Repository[]>;
  fetchCommits(username: string, repo: string, page?: number, perPage?: number): Promise<Commit[]>;
  fetchCommitDetail(username: string, repo: string, sha: string): Promise<CommitDetail>;
}