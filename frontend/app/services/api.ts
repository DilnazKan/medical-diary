import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://medical-diary-production.up.railway.app';

async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('token');
}

async function request(method: string, path: string, body?: object, auth = true) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Something went wrong');
  return data;
}

export const api = {
  // Auth
  register: (email: string, password: string, full_name: string) =>
    request('POST', '/auth/register', { email, password, full_name }, false),

  login: (email: string, password: string) =>
    request('POST', '/auth/login', { email, password }, false),

  // Diary
  createEntry: (notes: string, symptoms: object[]) =>
    request('POST', '/diary', { notes, symptoms }),

  getEntries: () =>
    request('GET', '/diary'),

  // Medical Records
  createRecord: (data: object) =>
    request('POST', '/medical-records', data),

  getRecords: () =>
    request('GET', '/medical-records'),

  // Search
  search: (query: string) =>
    request('POST', '/search', { query, max_results: 10 }),

  // Symptoms
  getSymptoms: () =>
    request('GET', '/symptoms'),
};
