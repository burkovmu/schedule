export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}
