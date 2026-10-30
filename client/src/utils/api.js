const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const user = JSON.parse(localStorage.getItem('mec_user') || 'null');
  const token = localStorage.getItem('mec_token') || '';

  const headers = {
    'Content-Type': 'application/json',
    ...(user ? { 'x-user-id': user.id } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  // Return blob if requested (e.g., for Excel download)
  if (options.responseType === 'blob') {
    return response.blob();
  }

  return response.json();
}
