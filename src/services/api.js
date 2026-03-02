import axios from 'axios'

// Export a shared axios instance so other modules can import and use it.
export const api = axios.create({})