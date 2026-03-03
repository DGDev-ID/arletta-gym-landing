import api from './api.js'

export async function login(email, password) {
	const { data } = await api.post('/api/auth/login', { email, password })
	if (!data.success) {
		throw new Error(data.message ?? 'Login failed')
	}
	return {
		user: data.data.user,
		token: data.data.token,
	}
}

export async function logout() {
	try {
		await api.post('/api/auth/logout')
	} catch {
		// ignore
	}
}

export default { login, logout }
