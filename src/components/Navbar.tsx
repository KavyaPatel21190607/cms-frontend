import { useState, useEffect } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authAPI } from '../services/api';

export function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  
  useEffect(() => {
    // Get admin info from localStorage
    const adminData = authAPI.getAdmin();
    setAdmin(adminData);
  }, []);
  
  const notifications = [
    { id: 1, text: 'New comment on "Web Design Project"', time: '5 min ago' },
    { id: 2, text: 'Project "E-commerce App" published', time: '1 hour ago' },
    { id: 3, text: 'New testimonial received', time: '2 hours ago' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowNotifications(false)}
                    className="fixed inset-0 z-10"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <p className="text-gray-900">{notification.text}</p>
                          <p className="text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-gray-200">
                      <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">
                        View all notifications
                      </a>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 p-2 pr-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-gray-900">{admin?.username || 'Admin User'}</p>
              <p className="text-gray-500">{admin?.email || 'admin@cms.com'}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
