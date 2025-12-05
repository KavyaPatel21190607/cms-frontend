import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileEdit, 
  FolderKanban, 
  FileText, 
  MessageSquare, 
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  Code,
  Award,
  Inbox
} from 'lucide-react';

type Page = 'dashboard' | 'content-editor' | 'projects' | 'blogs' | 'testimonials' | 'services' | 'skills' | 'experience' | 'contact-messages' | 'settings';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'content-editor' as Page, label: 'Content Editor', icon: FileEdit },
  { id: 'projects' as Page, label: 'Projects', icon: FolderKanban },
  { id: 'blogs' as Page, label: 'Blogs', icon: FileText },
  { id: 'testimonials' as Page, label: 'Testimonials', icon: MessageSquare },
  { id: 'services' as Page, label: 'Services', icon: Briefcase },
  { id: 'skills' as Page, label: 'Skills', icon: Code },
  { id: 'experience' as Page, label: 'Experience', icon: Award },
  { id: 'contact-messages' as Page, label: 'Contact Messages', icon: Inbox },
  { id: 'settings' as Page, label: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-gray-900">
          CMS Pro
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileOpen(false);
              }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          onClick={onLogout}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-40 shadow-xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
