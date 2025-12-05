// API Configuration
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint: string, options: any = {}) => {
  const token = localStorage.getItem('cms_token');
  
  const config: any = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (credentials: any) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.success && data.data.token) {
      localStorage.setItem('cms_token', data.data.token);
      localStorage.setItem('cms_admin', JSON.stringify(data.data.admin));
    }
    
    return data;
  },

  logout: () => {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_admin');
  },

  verify: async () => {
    return await apiCall('/auth/verify');
  },

  getProfile: async () => {
    return await apiCall('/auth/me');
  },

  updateProfile: async (profileData: any) => {
    return await apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  updatePassword: async (passwords: any) => {
    return await apiCall('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    });
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('cms_token');
  },

  getToken: () => {
    return localStorage.getItem('cms_token');
  },

  getAdmin: () => {
    const admin = localStorage.getItem('cms_admin');
    return admin ? JSON.parse(admin) : null;
  },
};

// Hero API
export const heroAPI = {
  get: async () => await apiCall('/hero'),
  update: async (data: any) => await apiCall('/hero', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// About API
export const aboutAPI = {
  get: async () => await apiCall('/about'),
  update: async (data: any) => await apiCall('/about', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Projects API
export const projectsAPI = {
  get: async () => await apiCall('/projects'),
  update: async (data: any) => await apiCall('/projects', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  add: async (project: any) => await apiCall('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  }),
  delete: async (projectId: any) => await apiCall(`/projects/${projectId}`, {
    method: 'DELETE',
  }),
};

// Blogs API
export const blogsAPI = {
  get: async () => await apiCall('/blogs'),
  update: async (data: any) => await apiCall('/blogs', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  add: async (blog: any) => await apiCall('/blogs', {
    method: 'POST',
    body: JSON.stringify(blog),
  }),
  delete: async (blogId: any) => await apiCall(`/blogs/${blogId}`, {
    method: 'DELETE',
  }),
};

// Skills API
export const skillsAPI = {
  get: async () => await apiCall('/skills'),
  update: async (data: any) => await apiCall('/skills', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  add: async (skill: any) => await apiCall('/skills', {
    method: 'POST',
    body: JSON.stringify(skill),
  }),
  delete: async (skillId: any) => await apiCall(`/skills/${skillId}`, {
    method: 'DELETE',
  }),
};

// Experience API
export const experienceAPI = {
  get: async () => await apiCall('/experience'),
  update: async (data: any) => await apiCall('/experience', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  add: async (experience: any) => await apiCall('/experience', {
    method: 'POST',
    body: JSON.stringify(experience),
  }),
  delete: async (experienceId: any) => await apiCall(`/experience/${experienceId}`, {
    method: 'DELETE',
  }),
};

// Services API
export const servicesAPI = {
  get: async () => await apiCall('/services'),
  update: async (data: any) => await apiCall('/services', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  add: async (service: any) => await apiCall('/services', {
    method: 'POST',
    body: JSON.stringify(service),
  }),
  delete: async (serviceId: any) => await apiCall(`/services/${serviceId}`, {
    method: 'DELETE',
  }),
};

// Testimonials API
export const testimonialsAPI = {
  get: async () => await apiCall('/testimonials'),
  update: async (data: any) => await apiCall('/testimonials', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  add: async (testimonial: any) => await apiCall('/testimonials', {
    method: 'POST',
    body: JSON.stringify(testimonial),
  }),
  delete: async (testimonialId: any) => await apiCall(`/testimonials/${testimonialId}`, {
    method: 'DELETE',
  }),
};

// Contact API
export const contactAPI = {
  get: async () => await apiCall('/contact'),
  update: async (data: any) => await apiCall('/contact', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  submit: async (formData: any) => await apiCall('/contact/submit', {
    method: 'POST',
    body: JSON.stringify(formData),
  }),
  getMessages: async () => await apiCall('/contact/messages'),
  markAsRead: async (messageId: string) => await apiCall(`/contact/messages/${messageId}/read`, {
    method: 'PUT',
  }),
  updateStatus: async (messageId: string, status: string) => await apiCall(`/contact/messages/${messageId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  deleteMessage: async (messageId: string) => await apiCall(`/contact/messages/${messageId}`, {
    method: 'DELETE',
  }),
};

// Footer API
export const footerAPI = {
  get: async () => await apiCall('/footer'),
  update: async (data: any) => await apiCall('/footer', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Stats API - for dashboard
export const statsAPI = {
  getDashboard: async () => {
    try {
      // Fetch all data in parallel
      const [projects, blogs, testimonials, services, contactMessages] = await Promise.all([
        projectsAPI.get(),
        blogsAPI.get(),
        testimonialsAPI.get(),
        servicesAPI.get(),
        contactAPI.getMessages(),
      ]);

      // Process projects by year
      const projectsByYear: { [key: string]: number } = {};
      if (projects.data?.projects) {
        projects.data.projects.forEach((project: any) => {
          const year = project.date ? new Date(project.date).getFullYear().toString() : new Date().getFullYear().toString();
          projectsByYear[year] = (projectsByYear[year] || 0) + 1;
        });
      }

      // Convert to array format for charts, sorted by year
      const projectsChartData = Object.entries(projectsByYear)
        .map(([year, completed]) => ({ year, completed }))
        .sort((a, b) => parseInt(a.year) - parseInt(b.year));

      // Process services distribution
      const servicesDistribution = services.data?.services?.map((service: any) => ({
        name: service.title,
        value: 1 // Each service counts as 1, you can modify this based on your needs
      })) || [];

      // Generate monthly visitors data (you can replace this with actual data from Contact or Analytics collection)
      const currentYear = new Date().getFullYear();
      const monthlyVisitors = [
        { month: 'Jan', visitors: blogs.data?.blogs?.filter((b: any) => new Date(b.date).getMonth() === 0 && new Date(b.date).getFullYear() === currentYear).length || 0 },
        { month: 'Feb', visitors: blogs.data?.blogs?.filter((b: any) => new Date(b.date).getMonth() === 1 && new Date(b.date).getFullYear() === currentYear).length || 0 },
        { month: 'Mar', visitors: blogs.data?.blogs?.filter((b: any) => new Date(b.date).getMonth() === 2 && new Date(b.date).getFullYear() === currentYear).length || 0 },
        { month: 'Apr', visitors: blogs.data?.blogs?.filter((b: any) => new Date(b.date).getMonth() === 3 && new Date(b.date).getFullYear() === currentYear).length || 0 },
        { month: 'May', visitors: blogs.data?.blogs?.filter((b: any) => new Date(b.date).getMonth() === 4 && new Date(b.date).getFullYear() === currentYear).length || 0 },
        { month: 'Jun', visitors: blogs.data?.blogs?.filter((b: any) => new Date(b.date).getMonth() === 5 && new Date(b.date).getFullYear() === currentYear).length || 0 },
        { month: 'Jul', visitors: blogs.data?.blogs?.filter((b: any) => new Date(b.date).getMonth() === 6 && new Date(b.date).getFullYear() === currentYear).length || 0 },
        { month: 'Aug', visitors: blogs.data?.blogs?.filter((b: any) => new Date(b.date).getMonth() === 7 && new Date(b.date).getFullYear() === currentYear).length || 0 },
        { month: 'Sep', visitors: blogs.data?.blogs?.filter((b: any) => new Date(b.date).getMonth() === 8 && new Date(b.date).getFullYear() === currentYear).length || 0 },
        { month: 'Oct', visitors: blogs.data?.blogs?.filter((b: any) => new Date(b.date).getMonth() === 9 && new Date(b.date).getFullYear() === currentYear).length || 0 },
        { month: 'Nov', visitors: blogs.data?.blogs?.filter((b: any) => new Date(b.date).getMonth() === 10 && new Date(b.date).getFullYear() === currentYear).length || 0 },
        { month: 'Dec', visitors: blogs.data?.blogs?.filter((b: any) => new Date(b.date).getMonth() === 11 && new Date(b.date).getFullYear() === currentYear).length || 0 },
      ];

      return {
        success: true,
        data: {
          totalProjects: projects.data?.projects?.length || 0,
          totalBlogs: blogs.data?.blogs?.length || 0,
          totalTestimonials: testimonials.data?.testimonials?.length || 0,
          totalServices: services.data?.services?.length || 0,
          totalMessages: contactMessages.data?.messages?.length || 0,
          projectsByYear: projectsChartData,
          servicesDistribution: servicesDistribution,
          monthlyVisitors: monthlyVisitors,
        },
      };
    } catch (error) {
      console.error('Stats API Error:', error);
      throw error;
    }
  },
};

// Upload API
export const uploadAPI = {
  uploadSingle: async (file: File, folder: string = 'hero') => {
    const token = localStorage.getItem('cms_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await fetch(`${API_URL}/upload/single`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload API Error:', error);
      throw error;
    }
  },

  deleteFile: async (path: string) => {
    return apiCall('/upload', {
      method: 'DELETE',
      body: JSON.stringify({ path }),
    });
  },
};

export default {
  authAPI,
  heroAPI,
  aboutAPI,
  projectsAPI,
  blogsAPI,
  skillsAPI,
  experienceAPI,
  servicesAPI,
  testimonialsAPI,
  contactAPI,
  footerAPI,
  statsAPI,
  uploadAPI,
};
