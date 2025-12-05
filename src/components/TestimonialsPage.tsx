import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Upload, Quote, X } from 'lucide-react';
import { testimonialsAPI, uploadAPI } from '../services/api';

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  text: string;
}

export function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await testimonialsAPI.get();
      console.log('Testimonials response:', response);
      if (response.success && response.data) {
        setTestimonials(response.data.testimonials || []);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      try {
        console.log('Deleting testimonial:', id);
        const response = await testimonialsAPI.delete(id);
        console.log('Delete response:', response);
        if (response.success) {
          setTestimonials(testimonials.filter(t => t._id !== id));
          alert('✅ Testimonial deleted successfully!');
        } else {
          alert('❌ Failed to delete testimonial: ' + (response.message || 'Unknown error'));
        }
      } catch (error: any) {
        console.error('Failed to delete testimonial:', error);
        alert('❌ Failed to delete testimonial: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingTestimonial(null);
    setShowModal(true);
  };

  const handleSave = async (testimonialData: Partial<Testimonial>) => {
    try {
      if (editingTestimonial) {
        const updatedTestimonials = testimonials.map(t => 
          t._id === editingTestimonial._id ? { ...t, ...testimonialData } : t
        );
        console.log('Updating testimonials:', { testimonials: updatedTestimonials });
        const response = await testimonialsAPI.update({ testimonials: updatedTestimonials });
        console.log('Update response:', response);
        if (response.success) {
          setTestimonials(response.data.testimonials);
          setShowModal(false);
          setEditingTestimonial(null);
          alert('✅ Testimonial updated successfully!');
        } else {
          alert('❌ Failed to update testimonial: ' + (response.message || 'Unknown error'));
        }
      } else {
        console.log('Adding testimonial:', testimonialData);
        const response = await testimonialsAPI.add(testimonialData);
        console.log('Add response:', response);
        if (response.success) {
          setTestimonials(response.data.testimonials);
          setShowModal(false);
          setEditingTestimonial(null);
          alert('✅ Testimonial added successfully!');
        } else {
          alert('❌ Failed to add testimonial: ' + (response.message || 'Unknown error'));
        }
      }
    } catch (error: any) {
      console.error('Failed to save testimonial:', error);
      alert('❌ Failed to save testimonial: ' + (error.message || 'Unknown error'));
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Testimonials</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage client feedback and reviews</p>
        </div>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-blue-200" />
              
              <p className="text-gray-700 italic leading-relaxed text-sm sm:text-base line-clamp-4">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium text-sm sm:text-base truncate">{testimonial.name}</p>
                  <p className="text-gray-600 text-xs sm:text-sm truncate">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 sm:pt-4 border-t">
                <button
                  onClick={() => handleEdit(testimonial)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => deleteTestimonial(testimonial._id)}
                  className="px-3 sm:p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <TestimonialModal
          testimonial={editingTestimonial}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingTestimonial(null);
          }}
        />
      )}
    </div>
  );
}

function TestimonialModal({ testimonial, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    name: testimonial?.name || '',
    role: testimonial?.role || '',
    company: testimonial?.company || '',
    image: testimonial?.image || '',
    text: testimonial?.text || '',
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadAPI.uploadSingle(file, 'testimonials');
      if (result.success && result.data.url) {
        setFormData({ ...formData, image: result.data.url });
        alert('✅ Image uploaded successfully!');
      }
    } catch (error: any) {
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('❌ Please fill out the Name field');
      return;
    }
    if (!formData.role.trim()) {
      alert('❌ Please fill out the Role field');
      return;
    }
    if (!formData.company.trim()) {
      alert('❌ Please fill out the Company field');
      return;
    }
    if (!formData.text.trim()) {
      alert('❌ Please fill out the Testimonial Text field');
      return;
    }
    if (!formData.image.trim()) {
      alert('❌ Please upload an image');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all"
                placeholder="e.g., John Doe"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all"
                placeholder="e.g., CEO"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all"
                placeholder="e.g., Tech Corp"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image <span className="text-red-500">*</span>
            </label>
            <div className="mb-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg text-sm sm:text-base">
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all"
              placeholder="Or paste image URL here..."
              required
            />
            {formData.image && (
              <div className="mt-3 flex items-center gap-3">
                <img src={formData.image} alt="Preview" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
                <span className="text-xs sm:text-sm text-green-600">✓ Image loaded</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testimonial Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base transition-all"
              rows={5}
              placeholder="What did they say about you..."
              required
            />
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-medium transition-all text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:flex-1 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-medium shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
          >
            {testimonial ? '✓ Update Testimonial' : '+ Add Testimonial'}
          </button>
        </div>
      </form>
      </motion.div>
    </div>
  );
}
