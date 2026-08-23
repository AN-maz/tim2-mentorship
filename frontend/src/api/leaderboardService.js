import axiosClient from './axiosClient';

export const leaderboardService = {
  getLeaderboard: () => axiosClient.get('/leaderboard'),
};