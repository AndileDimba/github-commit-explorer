import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRepositoryStore } from '../../stores/repository';

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

global.localStorage = localStorageMock as Storage;

vi.mock('@/services/gitProvider', () => ({
  createGitProvider: () => ({
    fetchRepositories: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: 'test-repo',
        description: 'Test repository',
        owner: { login: 'testuser' },
        html_url: 'https://github.com/testuser/test-repo',
        updated_at: '2024-01-01T00:00:00Z',
        stargazers_count: 10,
        language: 'TypeScript',
      },
    ]),
    fetchCommits: vi.fn().mockResolvedValue([
      {
        sha: 'abc123',
        commit: {
          message: 'Test commit',
          author: {
            name: 'Test Author',
            date: '2024-01-01T00:00:00Z',
          },
        },
        author: {
          login: 'testuser',
          avatar_url: 'https://github.com/testuser.png',
        },
        html_url: 'https://github.com/testuser/test-repo/commit/abc123',
      },
    ]),
    fetchCommitDetail: vi.fn().mockResolvedValue({
      sha: 'abc123',
      commit: {
        message: 'Test commit',
        author: {
          name: 'Test Author',
          date: '2024-01-01T00:00:00Z',
        },
      },
      author: {
        login: 'testuser',
        avatar_url: 'https://github.com/testuser.png',
      },
      html_url: 'https://github.com/testuser/test-repo/commit/abc123',
      stats: {
        total: 1,
        additions: 10,
        deletions: 5,
      },
      files: [],
    }),
  }),
}));

describe('Repository Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('initializes with empty state', () => {
    const store = useRepositoryStore();
    
    expect(store.repositories).toEqual([]);
    expect(store.commits).toEqual([]);
    expect(store.favorites).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('loads repositories successfully', async () => {
    const store = useRepositoryStore();
    
    await store.loadRepositories('testuser');
    
    expect(store.repositories).toHaveLength(1);
    expect(store.repositories[0]?.name).toBe('test-repo');
    expect(store.currentUsername).toBe('testuser');
    expect(store.loading).toBe(false);
  });

  it('loads commits successfully', async () => {
    const store = useRepositoryStore();
    
    await store.loadCommits('testuser', 'test-repo');
    
    expect(store.commits).toHaveLength(1);
    expect(store.commits[0]?.sha).toBe('abc123');
    expect(store.loading).toBe(false);
  });

  it('loads commit details successfully', async () => {
    const store = useRepositoryStore();
    
    await store.loadCommitDetail('testuser', 'test-repo', 'abc123');
    
    expect(store.currentCommitDetail).toBeDefined();
    expect(store.currentCommitDetail?.sha).toBe('abc123');
    expect(store.currentCommitDetail?.stats?.additions).toBe(10);
  });

  it('adds commit to favorites', () => {
    const store = useRepositoryStore();
    const mockCommit = {
      sha: 'abc123',
      commit: {
        message: 'Test commit',
        author: {
          name: 'Test Author',
          date: '2024-01-01T00:00:00Z',
        },
      },
      author: {
        login: 'testuser',
        avatar_url: 'https://github.com/testuser.png',
      },
      html_url: 'https://github.com/testuser/test-repo/commit/abc123',
    };
    
    store.addToFavorites(mockCommit, 'test-repo', 'testuser');
    
    expect(store.favorites).toHaveLength(1);
    expect(store.favorites[0]?.commit.sha).toBe('abc123');
    expect(store.isFavorite('abc123')).toBe(true);
  });

  it('removes commit from favorites', () => {
    const store = useRepositoryStore();
    const mockCommit = {
      sha: 'abc123',
      commit: {
        message: 'Test commit',
        author: {
          name: 'Test Author',
          date: '2024-01-01T00:00:00Z',
        },
      },
      author: {
        login: 'testuser',
        avatar_url: 'https://github.com/testuser.png',
      },
      html_url: 'https://github.com/testuser/test-repo/commit/abc123',
    };
    
    store.addToFavorites(mockCommit, 'test-repo', 'testuser');
    expect(store.favorites).toHaveLength(1);
    
    store.removeFromFavorites('abc123');
    expect(store.favorites).toHaveLength(0);
    expect(store.isFavorite('abc123')).toBe(false);
  });

  it('toggles favorite status', () => {
    const store = useRepositoryStore();
    const mockCommit = {
      sha: 'abc123',
      commit: {
        message: 'Test commit',
        author: {
          name: 'Test Author',
          date: '2024-01-01T00:00:00Z',
        },
      },
      author: {
        login: 'testuser',
        avatar_url: 'https://github.com/testuser.png',
      },
      html_url: 'https://github.com/testuser/test-repo/commit/abc123',
    };
    
    store.toggleFavorite(mockCommit, 'test-repo', 'testuser');
    expect(store.isFavorite('abc123')).toBe(true);
    
    store.toggleFavorite(mockCommit, 'test-repo', 'testuser');
    expect(store.isFavorite('abc123')).toBe(false);
  });

  it('persists favorites to localStorage', () => {
    const store = useRepositoryStore();
    const mockCommit = {
      sha: 'abc123',
      commit: {
        message: 'Test commit',
        author: {
          name: 'Test Author',
          date: '2024-01-01T00:00:00Z',
        },
      },
      author: {
        login: 'testuser',
        avatar_url: 'https://github.com/testuser.png',
      },
      html_url: 'https://github.com/testuser/test-repo/commit/abc123',
    };
    
    store.addToFavorites(mockCommit, 'test-repo', 'testuser');
    
    const stored = localStorage.getItem('git_explorer_favorites');
    expect(stored).toBeDefined();
    
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].commit.sha).toBe('abc123');
  });

  it('sorts commits by newest first', () => {
    const store = useRepositoryStore();
    store.commits = [
      {
        sha: 'old',
        commit: {
          message: 'Old commit',
          author: { name: 'Author', date: '2024-01-01T00:00:00Z' },
        },
        author: { login: 'user', avatar_url: '' },
        html_url: '',
      },
      {
        sha: 'new',
        commit: {
          message: 'New commit',
          author: { name: 'Author', date: '2024-01-02T00:00:00Z' },
        },
        author: { login: 'user', avatar_url: '' },
        html_url: '',
      },
    ];
    
    const sorted = store.sortedCommits('newest');
    expect(sorted[0]?.sha).toBe('new');
    expect(sorted[1]?.sha).toBe('old');
  });

  it('sorts commits by oldest first', () => {
    const store = useRepositoryStore();
    store.commits = [
      {
        sha: 'new',
        commit: {
          message: 'New commit',
          author: { name: 'Author', date: '2024-01-02T00:00:00Z' },
        },
        author: { login: 'user', avatar_url: '' },
        html_url: '',
      },
      {
        sha: 'old',
        commit: {
          message: 'Old commit',
          author: { name: 'Author', date: '2024-01-01T00:00:00Z' },
        },
        author: { login: 'user', avatar_url: '' },
        html_url: '',
      },
    ];
    
    const sorted = store.sortedCommits('oldest');
    expect(sorted[0]?.sha).toBe('old');
    expect(sorted[1]?.sha).toBe('new');
  });

  it('groups favorites by repository', () => {
    const store = useRepositoryStore();
    
    store.addToFavorites(
      {
        sha: 'abc1',
        commit: { message: 'Commit 1', author: { name: 'Author', date: '2024-01-01T00:00:00Z' } },
        author: { login: 'user', avatar_url: '' },
        html_url: '',
      },
      'repo1',
      'user'
    );
    
    store.addToFavorites(
      {
        sha: 'abc2',
        commit: { message: 'Commit 2', author: { name: 'Author', date: '2024-01-01T00:00:00Z' } },
        author: { login: 'user', avatar_url: '' },
        html_url: '',
      },
      'repo2',
      'user'
    );
    
    const grouped = store.favoritesByRepo;
    expect(grouped['repo1']).toHaveLength(1);
    expect(grouped['repo2']).toHaveLength(1);
  });

  it('resets commits state', () => {
    const store = useRepositoryStore();
    store.commits = [
      {
        sha: 'abc',
        commit: { message: 'Test', author: { name: 'Author', date: '2024-01-01T00:00:00Z' } },
        author: { login: 'user', avatar_url: '' },
        html_url: '',
      },
    ];
    store.currentCommitPage = 5;
    
    store.resetCommits();
    
    expect(store.commits).toEqual([]);
    expect(store.currentCommitPage).toBe(1);
  });

  it('resets repositories state', () => {
    const store = useRepositoryStore();
    store.repositories = [
      {
        id: 1,
        name: 'test',
        description: 'Test',
        owner: { login: 'user' },
        html_url: '',
        updated_at: '',
        stargazers_count: 0,
        language: null,
      },
    ];
    store.currentRepoPage = 3;
    
    store.resetRepositories();
    
    expect(store.repositories).toEqual([]);
    expect(store.currentRepoPage).toBe(1);
  });

  it('clears error state', () => {
    const store = useRepositoryStore();
    store.error = 'Test error';
    
    store.clearError();
    
    expect(store.error).toBeNull();
  });
});