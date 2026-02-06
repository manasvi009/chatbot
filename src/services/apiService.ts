// apiService.ts - API communication layer with token injection and error handling

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Define retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
};

// API response interface
interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// API error interface
interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiService {
  private token: string | null = null;

  // Set token for authentication
  setToken(token: string | null) {
    this.token = token;
  }

  // Get headers with token
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Make API request with retry logic
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = RETRY_CONFIG.maxRetries
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Merge provided headers with default headers
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // If response is ok, return data
      if (response.ok) {
        const data = response.status !== 204 ? await response.json() : null;
        return {
          data,
          status: response.status,
        };
      }

      // If response is not ok, throw error
      const errorData = await response.json().catch(() => ({}));
      const error: ApiError = {
        message: errorData.message || `HTTP Error: ${response.status}`,
        status: response.status,
        details: errorData,
      };

      throw error;
    } catch (error) {
      // If it's an API error with a 4xx status, don't retry
      if (error instanceof Object && 'status' in error && (error as any).status >= 400 && (error as any).status < 500) {
        throw error;
      }

      // If we still have retries left, try again after delay
      if (retries > 0) {
        const delay = RETRY_CONFIG.baseDelay * (RETRY_CONFIG.maxRetries - retries + 1);
        await this.delay(delay);
        return this.makeRequest<T>(endpoint, options, retries - 1);
      }

      // If no retries left, re-throw the error
      throw error;
    }
  }

  // Helper to create delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // AUTHENTICATION METHODS
  async login(email: string, password: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async getMe(): Promise<ApiResponse> {
    return this.makeRequest('/auth/me');
  }

  // CHAT METHODS
  async getChats(): Promise<ApiResponse> {
    return this.makeRequest('/chat');
  }

  async getChat(chatId: string): Promise<ApiResponse> {
    return this.makeRequest(`/chat/${chatId}`);
  }

  async createChat(userId: string): Promise<ApiResponse> {
    return this.makeRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async sendMessage(chatId: string, content: string, sentiment?: string): Promise<ApiResponse> {
    return this.makeRequest(`/chat/${chatId}/message`, {
      method: 'POST',
      body: JSON.stringify({ content, sentiment }),
    });
  }

  async getChatHistory(chatId: string): Promise<ApiResponse> {
    return this.makeRequest(`/chat/${chatId}/history`);
  }

  // TICKET METHODS
  async getTickets(): Promise<ApiResponse> {
    return this.makeRequest('/tickets');
  }

  async getTicket(ticketId: string): Promise<ApiResponse> {
    return this.makeRequest(`/tickets/${ticketId}`);
  }

  async createTicket(subject: string, description: string, category: string, priority?: string): Promise<ApiResponse> {
    return this.makeRequest('/tickets', {
      method: 'POST',
      body: JSON.stringify({ subject, description, category, priority }),
    });
  }

  async updateTicket(ticketId: string, updates: any): Promise<ApiResponse> {
    return this.makeRequest(`/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async addTicketMessage(ticketId: string, content: string): Promise<ApiResponse> {
    return this.makeRequest(`/tickets/${ticketId}/message`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async closeTicket(ticketId: string): Promise<ApiResponse> {
    return this.makeRequest(`/tickets/${ticketId}/close`, {
      method: 'PUT',
    });
  }

  // ADMIN METHODS
  async getAnalytics(): Promise<ApiResponse> {
    return this.makeRequest('/admin/analytics');
  }

  async getAllTickets(): Promise<ApiResponse> {
    return this.makeRequest('/admin/tickets');
  }

  async assignTicket(ticketId: string, agentId: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/tickets/${ticketId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ agentId }),
    });
  }

  async updateTicketStatus(ticketId: string, status: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async addAdminMessage(ticketId: string, content: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/tickets/${ticketId}/message`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getFaqs(): Promise<ApiResponse> {
    return this.makeRequest('/admin/faqs');
  }

  async createFaq(question: string, answer: string, category: string, tags?: string[], isActive?: boolean, aiConfidenceScore?: number): Promise<ApiResponse> {
    return this.makeRequest('/admin/faqs', {
      method: 'POST',
      body: JSON.stringify({ 
        question, 
        answer, 
        category, 
        tags, 
        isActive, 
        aiConfidenceScore 
      }),
    });
  }

  async updateFaq(faqId: string, updates: any): Promise<ApiResponse> {
    return this.makeRequest(`/admin/faqs/${faqId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteFaq(faqId: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/faqs/${faqId}`, {
      method: 'DELETE',
    });
  }

  async getUsers(): Promise<ApiResponse> {
    return this.makeRequest('/admin/users');
  }

  async updateUser(userId: string, updates: any): Promise<ApiResponse> {
    return this.makeRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getUserChatLogs(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/users/${userId}/chats`);
  }
}

// Create a single instance of ApiService
export const apiService = new ApiService();

export type { ApiResponse, ApiError };