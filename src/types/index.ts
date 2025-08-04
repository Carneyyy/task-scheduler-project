// Type definitions for the application

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
}
