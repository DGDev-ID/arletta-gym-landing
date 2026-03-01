// Simple in-memory mock auth for local development/demo
const users = [
  {
    id: 1,
    name: 'Demo Member',
    email: 'member@example.com',
    password: 'memberpass',
    role: 'member',
  },
  {
    id: 2,
    name: 'Demo Trainer',
    email: 'pt@example.com',
    password: 'ptpass',
    role: 'pt',
  },
]

export function login(email, password) {
  return new Promise((resolve, reject) => {
    // simulate network latency
    setTimeout(() => {
      const u = users.find((x) => x.email === email && x.password === password)
      if (u) {
        // return a copy without password
        const { password: _p, ...safe } = u
        resolve(safe)
      } else {
        reject(new Error('Invalid credentials'))
      }
    }, 700)
  })
}

export function getDummyAccounts() {
  return users.map((u) => ({ email: u.email, password: u.password, role: u.role, name: u.name }))
}

export default { login, getDummyAccounts }
