export interface Repository {
  id: number;
  name: string;
  description: string | null;
  owner: {
    login: string;
  };
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
}