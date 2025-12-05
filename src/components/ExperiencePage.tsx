import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, X, Briefcase, Calendar, Building } from 'lucide-react';
import { experienceAPI } from '../services/api';

interface ExperienceItem {
  _id?: string;
  year: string;
  role: string;
  company: string;
  responsibilities: string[];
}

export function ExperiencePage() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await experienceAPI.get();
      console.log('Experience data:', response);
      if (response.success && response.data) {
        setExperiences(response.data.experiences || []);
      }
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
      alert('❌ Failed to load experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (experience: ExperienceItem) => {
    console.log('Editing experience:', experience);
    setEditingExperience(experience);
    setShowModal(true);
  };

  const handleAddNew = () => {
    console.log('Adding new experience');
    setEditingExperience(null);
    setShowModal(true);
  };

  const handleSave = async (experienceData: Partial<ExperienceItem>) => {
    try {
      let updatedExperiences;
      
      if (editingExperience) {
        // Update existing experience
        updatedExperiences = experiences.map(exp =>
          exp._id === editingExperience._id ? { ...exp, ...experienceData } : exp
        );
        console.log('Updating experience:', updatedExperiences);
      } else {
        // Add new experience
        updatedExperiences = [...experiences, experienceData];
        console.log('Adding new experience:', updatedExperiences);
      }

      const response = await experienceAPI.update({ experiences: updatedExperiences });
      console.log('Save response:', response);
      
      if (response.success && response.data) {
        setExperiences(response.data.experiences || []);
        setShowModal(false);
        setEditingExperience(null);
        alert(editingExperience ? '✅ Experience updated successfully!' : '✅ Experience added successfully!');
      } else {
        alert('❌ Failed to save experience: ' + (response.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Failed to save experience:', error);
      alert('❌ Failed to save experience: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this experience?')) {
      try {
        console.log('Deleting experience:', id);
        const updatedExperiences = experiences.filter(exp => exp._id !== id);
        console.log('Updated experiences after delete:', updatedExperiences);
        
        const response = await experienceAPI.update({ experiences: updatedExperiences });
        console.log('Delete response:', response);
        
        if (response.success && response.data) {
          setExperiences(response.data.experiences || []);
          alert('✅ Experience deleted successfully!');
        } else {
          alert('❌ Failed to delete experience: ' + (response.message || 'Unknown error'));
        }
      } catch (error: any) {
        console.error('Failed to delete experience:', error);
        alert('❌ Failed to delete experience: ' + (error.message || 'Unknown error'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-500" />
              Professional Experience
            </h1>
            <p className="text-gray-600 mt-2">Manage your career journey and achievements</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNew}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Experience
          </motion.button>
        </div>

        {/* Experiences List */}
        {experiences.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Experiences Yet</h3>
            <p className="text-gray-600 mb-6">Start adding your professional experiences to showcase your career journey</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNew}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Experience
            </motion.button>
          </div>
        ) : (
          <div className="space-y-6">
            {experiences.map((experience, index) => (
              <motion.div
                key={experience._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{experience.role}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Building className="w-4 h-4" />
                            <span className="text-sm font-medium">{experience.company}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{experience.year}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-15 space-y-2">
                      {experience.responsibilities.map((resp, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                          <p className="text-gray-700 text-sm flex-1">{resp}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(experience)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(experience._id!)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ExperienceModal
          experience={editingExperience}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingExperience(null);
          }}
        />
      )}
    </div>
  );
}

function ExperienceModal({ experience, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    year: experience?.year || '',
    role: experience?.role || '',
    company: experience?.company || '',
    responsibilities: experience?.responsibilities || [''],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.year.trim() || !formData.role.trim() || !formData.company.trim()) {
      alert('❌ Please fill out all required fields (Year, Role, Company)');
      return;
    }

    const filteredResponsibilities = formData.responsibilities.filter((r: string) => r.trim() !== '');
    if (filteredResponsibilities.length === 0) {
      alert('❌ Please add at least one responsibility');
      return;
    }

    onSave({ ...formData, responsibilities: filteredResponsibilities });
  };

  const handleAddResponsibility = () => {
    setFormData({ ...formData, responsibilities: [...formData.responsibilities, ''] });
  };

  const handleRemoveResponsibility = (index: number) => {
    const newResponsibilities = formData.responsibilities.filter((_: string, i: number) => i !== index);
    setFormData({ ...formData, responsibilities: newResponsibilities });
  };

  const handleResponsibilityChange = (index: number, value: string) => {
    const newResponsibilities = [...formData.responsibilities];
    newResponsibilities[index] = value;
    setFormData({ ...formData, responsibilities: newResponsibilities });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {experience ? 'Edit Experience' : 'Add New Experience'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., 2020-2023"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., Google Inc."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-800">
                Responsibilities <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddResponsibility}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Responsibility
              </button>
            </div>
            <div className="space-y-2">
              {formData.responsibilities.map((resp: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Led a team of 5 engineers"
                  />
                  {formData.responsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveResponsibility(index)}
                      className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

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
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-medium transition-all shadow-lg"
            >
              {experience ? 'Update Experience' : 'Add Experience'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
