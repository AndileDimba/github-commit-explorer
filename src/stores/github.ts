import { defineStore } from 'pinia';
import type { Repository, Commit, CommitDetail, FavoriteCommit } from '../types/github';

const GITHUB_API = 'https://api.github.com';

export const useGithubStore = defineStore('github', {
  state: () => ({
    repositories: [] as Repository[],
    commits: [] as Commit[],
    favorites: [] as FavoriteCommit[],
    currentCommitDetail: null as CommitDetail | null,
    loading: false,
    error: null as string | null,
    currentPage: 1,
    perPage: 10,
  }),

  getters: {
    sortedCommits: (state) => (order: 'newest' | 'oldest') => {
      const sorted = [...state.commits].sort((a, b) => {
        const dateA = new Date(a.commit.author.date).getTime();
        const dateB = new Date(b.commit.author.date).getTime();
        return order === 'newest' ? dateB - dateA : dateA - dateB;
      });
      return sorted;
    },

    isFavorite: (state) => (sha: string) => {
      return state.favorites.some(fav => fav.commit.sha === sha);
    },
  },

  actions: {
    async fetchRepositories(username: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`${GITHUB_API}/users/${username}/repos`);
        
        if (response.status === 404) {
          throw new Error('User not found');
        }
        if (response.status === 403) {
          throw new Error('API rate limit exceeded. Please try again later.');
        }
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }

        this.repositories = await response.json();
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred';
        this.repositories = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchCommits(username: string, repo: string, page: number = 1) {
      this.loading = true;
      this.error = null;
      this.currentPage = page;
      
      try {
        const response = await fetch(
          `${GITHUB_API}/repos/${username}/${repo}/commits?page=${page}&per_page=${this.perPage}`
        );
        
        if (response.status === 404) {
          throw new Error('Repository not found');
        }
        if (response.status === 403) {
          throw new Error('API rate limit exceeded. Please try again later.');
        }
        if (!response.ok) {
          throw new Error('Failed to fetch commits');
        }

        this.commits = await response.json();
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred';
        this.commits = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchCommitDetail(username: string, repo: string, sha: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(
          `${GITHUB_API}/repos/${username}/${repo}/commits/${sha}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch commit details');
        }

        this.currentCommitDetail = await response.json();
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred';
        this.currentCommitDetail = null;
      } finally {
        this.loading = false;
      }
    },

    addFavorite(commit: Commit, repoName: string, username: string) {
      const exists = this.favorites.some(fav => fav.commit.sha === commit.sha);
      if (!exists) {
        this.favorites.push({ commit, repoName, username });
      }
    },

    removeFavorite(sha: string) {
      this.favorites = this.favorites.filter(fav => fav.commit.sha !== sha);
    },

    clearCommits() {
      this.commits = [];
      this.currentPage = 1;
    },
  },
});