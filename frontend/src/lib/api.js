import axios from "axios";

export const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

export const fetchInstructors = (params) => api.get("/instructors", { params }).then((r) => r.data);
export const fetchInstructor = (id) => api.get(`/instructors/${id}`).then((r) => r.data);
export const fetchSummary = (id) => api.get(`/instructors/${id}/summary`).then((r) => r.data);
export const fetchDashboard = (id) => api.get(`/instructors/${id}/dashboard`).then((r) => r.data);
export const fetchMeta = () => api.get("/meta").then((r) => r.data);
export const fetchLeaderboard = (skill) => api.get("/leaderboard", { params: skill ? { skill } : {} }).then((r) => r.data);
export const postMatch = (goal) => api.post("/match", { goal }).then((r) => r.data);
export const postPlatformSearch = (query) => api.post("/platform-search", { query }).then((r) => r.data);
export const postStory = (id, body) => api.post(`/instructors/${id}/stories`, body).then((r) => r.data);
export const createInstructor = (body) => api.post("/instructors", body).then((r) => r.data);
export const updateInstructor = (id, body) => api.put(`/instructors/${id}`, body).then((r) => r.data);
