export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  settings?: Record<string, any>;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface UserFilters {
  page: number;
  limit: number;
  search?: string;
  role?: User['role'];
  status?: User['status'];
  sort_by?: 'name' | 'email' | 'created_at' | 'last_login_at';
  sort_order?: 'asc' | 'desc';
}

export interface UserFormData {
  name: string;
  email: string;
  role: User['role'];
  password?: string;
  confirm_password?: string;
  status?: User['status'];
  avatar?: string;
}