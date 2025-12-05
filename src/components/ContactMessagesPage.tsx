import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, MailOpen, Trash2, Clock, User, MessageSquare, Tag, X, ExternalLink } from 'lucide-react';
import { contactAPI } from '../services/api';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  read: boolean;
  createdAt: string;
}

export function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await contactAPI.getMessages();
      console.log('Contact messages response:', response);
      if (response.success && response.data?.messages) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch contact messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await contactAPI.markAsRead(messageId);
      if (response.success) {
        setMessages(messages.map(m => 
          m._id === messageId ? { ...m, read: true, status: 'read' } : m
        ));
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      alert('❌ Failed to update message');
    }
  };

  const handleUpdateStatus = async (messageId: string, status: string) => {
    try {
      const response = await contactAPI.updateStatus(messageId, status);
      if (response.success) {
        setMessages(messages.map(m => 
          m._id === messageId ? { ...m, status: status as any } : m
        ));
        alert('✅ Status updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('❌ Failed to update status');
    }
  };

  const handleDelete = async (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        const response = await contactAPI.deleteMessage(messageId);
        if (response.success) {
          setMessages(messages.filter(m => m._id !== messageId));
          setSelectedMessage(null);
          alert('✅ Message deleted successfully!');
        }
      } catch (error) {
        console.error('Failed to delete message:', error);
        alert('❌ Failed to delete message');
      }
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.read) {
      handleMarkAsRead(message._id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'read': return 'bg-yellow-100 text-yellow-700';
      case 'replied': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(m => m.status === filter);

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Contact Messages</h1>
        <p className="text-sm sm:text-base text-gray-600">View and manage contact form submissions</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">New</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.new}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
              <MailOpen className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Read</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.read}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <MailOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Replied</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.replied}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'read', 'replied'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              filter === status
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredMessages.map((message, index) => (
          <motion.div
            key={message._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleViewMessage(message)}
            className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer ${
              message.read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
            }`}
          >
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                    message.read ? 'bg-gray-100' : 'bg-blue-100'
                  }`}>
                    {message.read ? (
                      <MailOpen className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    ) : (
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{message.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{message.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium shrink-0 ${getStatusColor(message.status)}`}>
                  {message.status}
                </span>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1 truncate">{message.subject}</p>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{message.message}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  {new Date(message.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(message._id);
                  }}
                  className="p-1.5 sm:p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600">No messages found</p>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function MessageDetailModal({ message, onClose, onUpdateStatus, onDelete }: any) {
  const handleReplyClick = () => {
    // Update status to replied
    if (message.status !== 'replied') {
      onUpdateStatus(message._id, 'replied');
    }
    // Open email client
    window.location.href = `mailto:${message.email}?subject=Re: ${message.subject}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{message.name}</h2>
              <a 
                href={`mailto:${message.email}`}
                className="text-sm sm:text-base text-blue-600 hover:underline flex items-center gap-1 truncate"
              >
                {message.email}
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Meta Info */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {new Date(message.createdAt).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-600" />
              <select
                value={message.status}
                onChange={(e) => onUpdateStatus(message._id, e.target.value)}
                className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium border-0 cursor-pointer ${
                  message.status === 'new' ? 'bg-blue-100 text-blue-700' :
                  message.status === 'read' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Subject</label>
            <p className="text-base sm:text-lg font-semibold text-gray-900">{message.subject}</p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Message</label>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{message.message}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all text-sm sm:text-base"
          >
            Close
          </button>
          <button
            onClick={handleReplyClick}
            className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-medium shadow-lg hover:shadow-xl transition-all text-center text-sm sm:text-base"
          >
            Reply via Email
          </button>
          <button
            onClick={() => {
              onDelete(message._id);
              onClose();
            }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-all text-sm sm:text-base"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
