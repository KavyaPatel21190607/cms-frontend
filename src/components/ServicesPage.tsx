import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Code, Palette, Smartphone, Cloud, Shield, Zap, X } from 'lucide-react';
import { servicesAPI } from '../services/api';

interface Service {
  _id: string;
  icon: string;
  title: string;
  description: string;
  link?: string;
}

const iconMap: { [key: string]: any } = {
  code: Code,
  palette: Palette,
  smartphone: Smartphone,
  cloud: Cloud,
  shield: Shield,
  zap: Zap,
};

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.get();
      console.log('Services response:', response);
      if (response.success && response.data) {
        setServices(response.data.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        console.log('Deleting service:', id);
        const response = await servicesAPI.delete(id);
        console.log('Delete response:', response);
        if (response.success) {
          setServices(services.filter(s => s._id !== id));
          alert('✅ Service deleted successfully!');
        } else {
          alert('❌ Failed to delete service: ' + (response.message || 'Unknown error'));
        }
      } catch (error: any) {
        console.error('Failed to delete service:', error);
        alert('❌ Failed to delete service: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleSave = async (serviceData: Partial<Service>) => {
    try {
      if (editingService) {
        const updatedServices = services.map(s => 
          s._id === editingService._id ? { ...s, ...serviceData } : s
        );
        console.log('Updating services:', { services: updatedServices });
        const response = await servicesAPI.update({ services: updatedServices });
        console.log('Update response:', response);
        if (response.success) {
          setServices(response.data.services);
          setShowModal(false);
          setEditingService(null);
          alert('✅ Service updated successfully!');
        } else {
          alert('❌ Failed to update service: ' + (response.message || 'Unknown error'));
        }
      } else {
        console.log('Adding service:', serviceData);
        const response = await servicesAPI.add(serviceData);
        console.log('Add response:', response);
        if (response.success) {
          setServices(response.data.services);
          setShowModal(false);
          setEditingService(null);
          alert('✅ Service added successfully!');
        } else {
          alert('❌ Failed to add service: ' + (response.message || 'Unknown error'));
        }
      }
    } catch (error: any) {
      console.error('Failed to save service:', error);
      alert('❌ Failed to save service: ' + (error.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-gray-900 mb-2">Services</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const IconComponent = iconMap[service.icon.toLowerCase()] || Code;
          
          return (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-6 flex items-center justify-center h-32">
                <IconComponent className="w-16 h-16 text-white" />
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-gray-900">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteService(service._id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showModal && (
        <ServiceModal
          service={editingService}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
}

function ServiceModal({ service, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    icon: service?.icon || 'code',
    title: service?.title || '',
    description: service?.description || '',
    link: service?.link || '#',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('❌ Please fill out the Title field');
      return;
    }
    if (!formData.description.trim()) {
      alert('❌ Please fill out the Description field');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {service ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Service Title */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Service Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter service title"
              required
            />
          </div>
            
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              rows={4}
              placeholder="Describe your service"
              required
            />
          </div>
            
          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Select Icon
            </label>
            <select
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="code">💻 Code</option>
              <option value="palette">🎨 Palette</option>
              <option value="smartphone">📱 Smartphone</option>
              <option value="cloud">☁️ Cloud</option>
              <option value="shield">🛡️ Shield</option>
              <option value="zap">⚡ Zap</option>
            </select>
          </div>
            
          {/* Link (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Link <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://example.com"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 bg-blue-600 text-black rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {service ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
