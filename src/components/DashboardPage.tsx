import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FolderKanban, 
  FileText, 
  MessageSquare, 
  Briefcase,
  Users,
  Mail
} from 'lucide-react';
import { StatCard } from './StatCard';
import { statsAPI } from '../services/api';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f472b6'];

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalBlogs: 0,
    totalTestimonials: 0,
    totalServices: 0,
    totalMessages: 0,
  });
  const [projectData, setProjectData] = useState<any[]>([]);
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsAPI.getDashboard();
        if (response.success) {
          setStats({
            totalProjects: response.data.totalProjects || 0,
            totalBlogs: response.data.totalBlogs || 0,
            totalTestimonials: response.data.totalTestimonials || 0,
            totalServices: response.data.totalServices || 0,
            totalMessages: response.data.totalMessages || 0,
          });
          setProjectData(response.data.projectsByYear || []);
          setSkillsData(response.data.servicesDistribution || []);
          setVisitorData(response.data.monthlyVisitors || []);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    { title: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, color: 'bg-blue-100 text-blue-600' },
    { title: 'Total Blogs', value: stats.totalBlogs, icon: FileText, color: 'bg-purple-100 text-purple-600' },
    { title: 'Total Testimonials', value: stats.totalTestimonials, icon: MessageSquare, color: 'bg-green-100 text-green-600' },
    { title: 'Total Services', value: stats.totalServices, icon: Briefcase, color: 'bg-orange-100 text-orange-600' },
    { title: 'Total Messages', value: stats.totalMessages, icon: Mail, color: 'bg-indigo-100 text-indigo-600' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here{"'"}s your overview.</p>
      </motion.div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsData.map((stat, index) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              delay={index * 0.1}
            />
          ))}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Projects Completed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-gray-900 mb-6">Projects Completed per Year</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#a78bfa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart - Skills Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-gray-900 mb-6">Services Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={skillsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {skillsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
