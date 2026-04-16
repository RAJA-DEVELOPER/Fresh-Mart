const API_BASE_URL = '/api';

const api = {
    get: (url) => request(url, 'GET'),
    post: (url, data) => request(url, 'POST', data),
    put: (url, data) => request(url, 'PUT', data),
    delete: (url) => request(url, 'DELETE')
};

async function request(url, method, data = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);
        const result = await response.json();

        if (!response.ok) {
            // Handle unauthorized or other errors
            if (response.status === 401) {
                localStorage.removeItem('token');
                if (!window.location.pathname.endsWith('auth.html')) {
                    window.location.href = '/auth.html';
                }
            }
            throw new Error(result.message || 'Something went wrong');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error.message);
        throw error;
    }
}

window.api = api;
