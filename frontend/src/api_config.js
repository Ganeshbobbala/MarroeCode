/**
 * centralized API base configuration.
 * Uses environment variable if provided, otherwise defaults to relative /api.
 * This ensures compatibility with both local development (via proxy)
 * and production deployment (where backend serves frontend).
 */
const API_BASE = import.meta.env.VITE_API_BASEURL || "/api";

export default API_BASE;
