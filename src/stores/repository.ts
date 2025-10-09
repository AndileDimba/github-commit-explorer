// src/stores/repository.ts
import { defineStore } from 'pinia';
import type { Repository, Commit, CommitDetail, FavoriteCommit } from '../types/git';
import { createGitProvider } from '../services/gitProvider';
import { storage } from '../utils/storage';

const FAVORITES_STORAGE_KEY = 'git_explorer_favorites';

export const useRepositoryStore = defineStore('repository', {
  state: () => ({
    repositories: [] as Repository[],
    commits: [] as Commit[],
    favorites: storage.get<FavoriteCommit[]>(FAVORITES_STORAGE_KEY) || [] as FavoriteCommit[],
    currentCommitDetail: null as CommitDetail | null,
    selectedRepo: null as Repository | null,
    currentUsername: '',
    loading: false,
    error: null as string | null,
    currentCommitPage: 1,
    currentRepoPage: 1,
    perPage: 10,
  }),

  getters: {
    sortedCommits: (state) => (order: 'newest' | 'oldest' = 'newest') => {
      return [...state.commits].sort((a, b) => {
        const dateA = new Date(a.commit.author.date).getTime();
        const dateB = new Date(b.commit.author.date).getTime();
        return order === 'newest' ? dateB - dateA : dateA - dateB;
      });
    },

    isFavorite: (state) => (sha: string): boolean => {
      return state.favorites.some(fav => fav.commit.sha === sha);
    },

    favoritesByRepo: (state) => {
      return state.favorites.reduce((acc, fav) => {
        if (!acc[fav.repoName]) {
          acc[fav.repoName] = [];
        }
        acc[fav.repoName]?.push(fav);
        return acc;
      }, {} as Record<string, FavoriteCommit[]>);
    },

    favoritesCount: (state): number => state.favorites.length,

    hasMoreCommits: (state): boolean => state.commits.length >= state.perPage,

    hasMoreRepos: (state): boolean => state.repositories.length >= state.perPage,
  },

  actions: {
    async loadRepositories(username: string, page: number = 1): Promise<void> {
      this.loading = true;
      this.error = null;
      this.currentUsername = username;
      this.currentRepoPage = page;

      try {
        const provider = createGitProvider();
        this.repositories = await provider.fetchRepositories(username, page, this.perPage);
      } catch (err) {
        this.handleError(err, 'Failed to load repositories');
        this.repositories = [];
      } finally {
        this.loading = false;
      }
    },

    async loadCommits(username: string, repoName: string, page: number = 1): Promise<void> {
      this.loading = true;
      this.error = null;
      this.currentCommitPage = page;

      try {
        const provider = createGitProvider();
        this.commits = await provider.fetchCommits(username, repoName, page, this.perPage);
      } catch (err) {
        this.handleError(err, 'Failed to load commits');
        this.commits = [];
      } finally {
        this.loading = false;
      }
    },

    async loadCommitDetail(username: string, repoName: string, sha: string): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        const provider = createGitProvider();
        this.currentCommitDetail = await provider.fetchCommitDetail(username, repoName, sha);
      } catch (err) {
        this.handleError(err, 'Failed to load commit details');
        this.currentCommitDetail = null;
      } finally {
        this.loading = false;
      }
    },

    async nextCommitPage(): Promise<void> {
      if (!this.selectedRepo || !this.hasMoreCommits) return;
      await this.loadCommits(this.currentUsername, this.selectedRepo.name, this.currentCommitPage + 1);
    },

    async previousCommitPage(): Promise<void> {
      if (!this.selectedRepo || this.currentCommitPage <= 1) return;
      await this.loadCommits(this.currentUsername, this.selectedRepo.name, this.currentCommitPage - 1);
    },

    async firstCommitPage(): Promise<void> {
      if (!this.selectedRepo || this.currentCommitPage === 1) return;
      await this.loadCommits(this.currentUsername, this.selectedRepo.name, 1);
    },

    async selectRepository(repo: Repository): Promise<void> {
      this.selectedRepo = repo;
      this.resetCommits();
      await this.loadCommits(this.currentUsername, repo.name, 1);
    },

    addToFavorites(commit: Commit, repoName: string, username: string): void {
      if (this.isFavorite(commit.sha)) return;

      const favorite: FavoriteCommit = {
        commit,
        repoName,
        username,
        repoUrl: `https://github.com/${username}/${repoName}`,
        commitUrl: commit.html_url,
        savedAt: new Date().toISOString(),
      };

      this.favorites.unshift(favorite);
      this.persistFavorites();
    },

    removeFromFavorites(sha: string): void {
      this.favorites = this.favorites.filter(fav => fav.commit.sha !== sha);
      this.persistFavorites();
    },

    toggleFavorite(commit: Commit, repoName: string, username: string): void {
      if (this.isFavorite(commit.sha)) {
        this.removeFromFavorites(commit.sha);
      } else {
        this.addToFavorites(commit, repoName, username);
      }
    },

    clearAllFavorites(): void {
      this.favorites = [];
      this.persistFavorites();
    },

    persistFavorites(): void {
      storage.set(FAVORITES_STORAGE_KEY, this.favorites);
    },

    resetCommits(): void {
      this.commits = [];
      this.currentCommitPage = 1;
      this.currentCommitDetail = null;
    },

    resetRepositories(): void {
      this.repositories = [];
      this.currentRepoPage = 1;
      this.selectedRepo = null;
    },

    resetAll(): void {
      this.resetRepositories();
      this.resetCommits();
      this.currentUsername = '';
      this.error = null;
    },

    clearError(): void {
      this.error = null;
    },

    handleError(err: unknown, fallbackMessage: string): void {
      this.error = err instanceof Error ? err.message : fallbackMessage;
    },
  },
});