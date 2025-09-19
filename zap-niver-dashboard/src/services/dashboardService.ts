import apiService from './apiService';

export interface DashboardStatsResponse {
  stats: {
    total_contacts: number;
    events_today: number;
    messages_sent_today: number;
    active_templates: number;
  };
}

class DashboardService {
  async getStats() {
    const { data } = await apiService.get<DashboardStatsResponse>('/dashboard/stats');
    return data;
  }

  async getUpcomingEvents() {
    const { data } = await apiService.get('/dashboard/upcoming-events');
    return data;
  }

  async getRecentActivity() {
    const { data } = await apiService.get('/dashboard/recent-activity');
    return data;
  }
}

export const dashboardService = new DashboardService();
