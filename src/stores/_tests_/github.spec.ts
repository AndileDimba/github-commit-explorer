import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGithubStore } from '../github';
import type { Repository, Commit } from './../../types/github';

global.fetch = vi.fn();

describe('GitHub Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchRepositories', () => {
    it('should fetch repositories successfully', async () => {
      const mockRepos: Repository[] = [
        {
          id: 1,
          name: 'test-repo',
          description: 'Test description',
          owner: { login: 'testuser' }
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockRepos,
      });

      const store = useGithubStore();
      await store.fetchRepositories('testuser');

      expect(store.repositories).toEqual(mockRepos);
      expect(store.error).toBeNull();
      expect(store.loading).toBe(false);
    });

    it('should handle user not found error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const store = useGithubStore();
      await store.fetchRepositories('nonexistentuser');

      expect(store.repositories).toEqual([]);
      expect(store.error).toBe('User not found');
    });

    it('should handle rate limit error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      const store = useGithubStore();
      await store.fetchRepositories('testuser');

      expect(store.repositories).toEqual([]);
      expect(store.error).toBe('API rate limit exceeded. Please try again later.');
    });
  });

  describe('fetchCommits', () => {
    it('should fetch commits successfully', async () => {
      const mockCommits: Commit[] = [
        {
          sha: 'abc123',
          commit: {
            message: 'Test commit',
            author: {
              name: 'Test Author',
              date: '2024-01-01T00:00:00Z'
            }
          },
          author: {
            login: 'testuser',
            avatar_url: 'https://example.com/avatar.jpg'
          }
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockCommits,
      });

      const store = useGithubStore();
      await store.fetchCommits('testuser', 'test-repo');

      expect(store.commits).toEqual(mockCommits);
      expect(store.error).toBeNull();
      expect(store.currentPage).toBe(1);
    });

    it('should handle pagination', async () => {
      const mockCommits: Commit[] = [];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockCommits,
      });

      const store = useGithubStore();
      await store.fetchCommits('testuser', 'test-repo', 2);

      expect(store.currentPage).toBe(2);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });

    it('should handle repository not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const store = useGithubStore();
      await store.fetchCommits('testuser', 'nonexistent-repo');

      expect(store.commits).toEqual([]);
      expect(store.error).toBe('Repository not found');
    });
  });

  describe('fetchCommitDetail', () => {
    it('should fetch commit details successfully', async () => {
      const mockCommitDetail = {
        sha: 'abc123',
        commit: {
          message: 'Test commit',
          author: {
            name: 'Test Author',
            date: '2024-01-01T00:00:00Z'
          }
        },
        author: {
          login: 'testuser',
          avatar_url: 'https://example.com/avatar.jpg'
        },
        stats: {
          total: 2,
          additions: 10,
          deletions: 5
        },
        files: [
          {
            filename: 'test.js',
            status: 'modified',
            additions: 10,
            deletions: 5,
            changes: 15,
            patch: '@@ -1,3 +1,3 @@'
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockCommitDetail,
      });

      const store = useGithubStore();
      await store.fetchCommitDetail('testuser', 'test-repo', 'abc123');

      expect(store.currentCommitDetail).toEqual(mockCommitDetail);
      expect(store.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const store = useGithubStore();
      await store.fetchCommitDetail('testuser', 'test-repo', 'abc123');

      expect(store.currentCommitDetail).toBeNull();
      expect(store.error).toBe('Failed to fetch commit details');
    });
  });

  describe('favorites management', () => {
    it('should add a commit to favorites', () => {
      const store = useGithubStore();
      const mockCommit: Commit = {
        sha: 'abc123',
        commit: {
          message: 'Test commit',
          author: {
            name: 'Test Author',
            date: '2024-01-01T00:00:00Z'
          }
        },
        author: {
          login: 'testuser',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      };

      store.addFavorite(mockCommit, 'test-repo', 'testuser');

      expect(store.favorites).toHaveLength(1);
      expect(store.favorites[0]?.commit.sha).toBe('abc123');
      expect(store.favorites[0]?.repoName).toBe('test-repo');
      expect(store.favorites[0]?.username).toBe('testuser');
    });

    it('should not add duplicate favorites', () => {
      const store = useGithubStore();
      const mockCommit: Commit = {
        sha: 'abc123',
        commit: {
          message: 'Test commit',
          author: {
            name: 'Test Author',
            date: '2024-01-01T00:00:00Z'
          }
        },
        author: {
          login: 'testuser',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      };

      store.addFavorite(mockCommit, 'test-repo', 'testuser');
      store.addFavorite(mockCommit, 'test-repo', 'testuser');

      expect(store.favorites).toHaveLength(1);
    });

    it('should remove a commit from favorites', () => {
      const store = useGithubStore();
      const mockCommit: Commit = {
        sha: 'abc123',
        commit: {
          message: 'Test commit',
          author: {
            name: 'Test Author',
            date: '2024-01-01T00:00:00Z'
          }
        },
        author: {
          login: 'testuser',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      };

      store.addFavorite(mockCommit, 'test-repo', 'testuser');
      expect(store.favorites).toHaveLength(1);

      store.removeFavorite('abc123');
      expect(store.favorites).toHaveLength(0);
    });

    it('should check if a commit is favorited', () => {
      const store = useGithubStore();
      const mockCommit: Commit = {
        sha: 'abc123',
        commit: {
          message: 'Test commit',
          author: {
            name: 'Test Author',
            date: '2024-01-01T00:00:00Z'
          }
        },
        author: {
          login: 'testuser',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      };

      expect(store.isFavorite('abc123')).toBe(false);

      store.addFavorite(mockCommit, 'test-repo', 'testuser');
      expect(store.isFavorite('abc123')).toBe(true);
    });
  });

  describe('sorting commits', () => {
    it('should sort commits by newest first', () => {
      const store = useGithubStore();
      store.commits = [
        {
          sha: '1',
          commit: {
            message: 'Old commit',
            author: {
              name: 'Author',
              date: '2024-01-01T00:00:00Z'
            }
          },
          author: null
        },
        {
          sha: '2',
          commit: {
            message: 'New commit',
            author: {
              name: 'Author',
              date: '2024-12-01T00:00:00Z'
            }
          },
          author: null
        }
      ];

      const sorted = store.sortedCommits('newest');
      expect(sorted[0]?.sha).toBe('2');
      expect(sorted[1]?.sha).toBe('1');
    });

    it('should sort commits by oldest first', () => {
      const store = useGithubStore();
      store.commits = [
        {
          sha: '1',
          commit: {
            message: 'New commit',
            author: {
              name: 'Author',
              date: '2024-12-01T00:00:00Z'
            }
          },
          author: null
        },
        {
          sha: '2',
          commit: {
            message: 'Old commit',
            author: {
              name: 'Author',
              date: '2024-01-01T00:00:00Z'
            }
          },
          author: null
        }
      ];

      const sorted = store.sortedCommits('oldest');
      expect(sorted[0]?.sha).toBe('2');
      expect(sorted[1]?.sha).toBe('1');
    });
  });

  describe('clearCommits', () => {
    it('should clear commits and reset page', () => {
      const store = useGithubStore();
      store.commits = [
        {
          sha: '1',
          commit: {
            message: 'Test',
            author: {
              name: 'Author',
              date: '2024-01-01T00:00:00Z'
            }
          },
          author: null
        }
      ];
      store.currentPage = 3;

      store.clearCommits();

      expect(store.commits).toEqual([]);
      expect(store.currentPage).toBe(1);
    });
  });
});