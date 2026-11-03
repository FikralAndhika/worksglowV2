// API base URL - uses env variable in production, empty string (relative) in development
const API_BASE = import.meta.env.VITE_API_URL || ''

export default API_BASE
