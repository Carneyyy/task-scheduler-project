import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const taskApi = {
  getTasks: (params?: any) => api.get<ApiResponse<any>>("/tasks", { params }),
  createTask: (data: any) => api.post<ApiResponse<any>>("/tasks", data),
  updateTask: (id: string, data: any) => api.put<ApiResponse<any>>(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete<ApiResponse>(`/tasks/${id}`),
  executeTask: (id: string) => api.post<ApiResponse>(`/tasks/${id}/execute`),
  getTaskDependencies: (id: string) => api.get<ApiResponse>(`/tasks/${id}/dependencies`),
  getTaskDependents: (id: string) => api.get<ApiResponse>(`/tasks/${id}/dependents`),
  checkDependencies: (id: string) => api.get<ApiResponse>(`/tasks/${id}/check-dependencies`),
  executeWithDependencies: (id: string) => api.post<ApiResponse>(`/tasks/${id}/execute-with-dependencies`),
  batchExecute: (ids: string[]) => api.post<ApiResponse>("/tasks/batch-execute", { ids }),
};

export const scriptApi = {
  getScripts: (params?: any) => api.get<ApiResponse<any>>("/scripts", { params }),
  createScript: (data: any) => api.post<ApiResponse<any>>("/scripts", data),
  updateScript: (id: string, data: any) => api.put<ApiResponse<any>>(`/scripts/${id}`, data),
  deleteScript: (id: string) => api.delete<ApiResponse>(`/scripts/${id}`),
};

export const nodeApi = {
  getNodes: (params?: any) => api.get<ApiResponse<any>>("/nodes", { params }),
  createNode: (data: any) => api.post<ApiResponse<any>>("/nodes", data),
  updateNode: (id: string, data: any) => api.put<ApiResponse<any>>(`/nodes/${id}`, data),
  deleteNode: (id: string) => api.delete<ApiResponse>(`/nodes/${id}`),
  executeNode: (id: string) => api.post<ApiResponse>(`/nodes/${id}/execute`),
};

export const authApi = {
  login: (credentials: any) => api.post<ApiResponse>("/auth/login", credentials),
  logout: () => api.post<ApiResponse>("/auth/logout"),
  refreshToken: () => api.post<ApiResponse>("/auth/refresh"),
  getProfile: () => api.get<ApiResponse>("/auth/profile"),
};

export const userApi = {
  getUsers: (params?: any) => api.get<ApiResponse<any>>("/users", { params }),
  getUser: (id: string) => api.get<ApiResponse>(`/users/${id}`),
  createUser: (data: any) => api.post<ApiResponse>("/users", data),
  updateUser: (id: string, data: any) => api.put<ApiResponse>(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete<ApiResponse>(`/users/${id}`),
};

export const notificationApi = {
  getNotifications: (params?: any) => api.get<ApiResponse<any>>("/notifications", { params }),
  getNotification: (id: string) => api.get<ApiResponse>(`/notifications/${id}`),
  createNotification: (data: any) => api.post<ApiResponse>("/notifications", data),
  updateNotification: (id: string, data: any) => api.put<ApiResponse>(`/notifications/${id}`, data),
  deleteNotification: (id: string) => api.delete<ApiResponse>(`/notifications/${id}`),
  markAsRead: (id: string) => api.put<ApiResponse>(`/notifications/${id}/read`),
  markAllAsRead: () => api.put<ApiResponse>("/notifications/read-all"),
  batchDelete: (ids: string[]) => api.post<ApiResponse>("/notifications/batch-delete", { ids }),
};

export const healthApi = {
  check: () => api.get<ApiResponse>("/health"),
};

export const settingsApi = {
  getSettings: () => api.get<ApiResponse>("/settings"),
  updateSettings: (data: any) => api.put<ApiResponse>("/settings", data),
};

export default api;