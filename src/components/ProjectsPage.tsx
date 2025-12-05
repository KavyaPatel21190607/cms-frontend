import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, ExternalLink, Calendar, Tag, Upload, X } from 'lucide-react';
import { projectsAPI } from '../services/api';

interface Project {
  _id: string;
  title: string;
  description: string;
  demoLink: string;
  codeLink: string;
  image: string;
  tech: string[];
  featured: boolean;
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsAPI.get();
        console.log('Projects response:', response);
        if (response.success && response.data) {
          // The data structure has projects nested: response.data.projects
          const projectList = response.data.projects || [];
          console.log('Project list:', projectList);
          setProjects(projectList);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const deleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await projectsAPI.delete(id);
        if (response.success) {
          setProjects(projects.filter(p => p._id !== id));
          alert('✅ Project deleted successfully!');
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('❌ Failed to delete project');
      }
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowAddModal(true);
  };

  const handleAddNew = () => {
    setEditingProject(null);
    setShowAddModal(true);
  };

  const handleSaveProject = async (projectData: Partial<Project>) => {
    try {
      if (editingProject) {
        // Update existing project - update entire projects array
        const updatedProjects = projects.map(p => 
          p._id === editingProject._id ? { ...p, ...projectData } : p
        );
        const response = await projectsAPI.update({ projects: updatedProjects });
        if (response.success) {
          setProjects(response.data.projects);
          alert('✅ Project updated successfully!');
        }
      } else {
        // Add new project
        const response = await projectsAPI.add(projectData);
        if (response.success) {
          setProjects(response.data.projects);
          alert('✅ Project added successfully!');
        }
      }
      setShowAddModal(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('❌ Failed to save project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-20">
          <h2 className="text-gray-900 mb-2">No Projects Yet</h2>
          <p className="text-gray-600 mb-6">Start by adding your first project</p>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">Manage your portfolio projects</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNew}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 mb-1">Total Projects</p>
          <p className="text-gray-900">{projects.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 mb-1">Featured</p>
          <p className="text-gray-900">{projects.filter(p => p.featured).length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 mb-1">Technologies</p>
          <p className="text-gray-900">{new Set(projects.flatMap(p => p.tech)).size}</p>
        </motion.div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-48 bg-gray-100 overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-gray-900">{project.title}</h3>
                  {project.featured && (
                    <span className="px-2 py-1 rounded-lg text-xs bg-yellow-100 text-yellow-700">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 line-clamp-2">{project.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.tech?.slice(0, 3).map((tag: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
                {project.tech?.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                    +{project.tech.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleEdit(project)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                {project.demoLink && project.demoLink !== '#' && (
                  <a
                    href={project.demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="View Demo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => deleteProject(project._id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ProjectModal
          project={editingProject}
          onSave={handleSaveProject}
          onClose={() => {
            setShowAddModal(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}

// Project Modal Component
function ProjectModal({ project, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    image: project?.image || '',
    tech: project?.tech?.join(', ') || '',
    demoLink: project?.demoLink || '',
    codeLink: project?.codeLink || '',
    featured: project?.featured || false,
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('❌ Invalid file type. Please upload JPG, PNG, WEBP, or GIF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('❌ File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    try {
      const { uploadAPI } = await import('../services/api');
      const result = await uploadAPI.uploadSingle(file, 'projects');
      
      if (result.success && result.data.url) {
        setFormData({ ...formData, image: result.data.url });
        alert('✅ Image uploaded successfully!');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      tech: formData.tech.split(',').map((t: string) => t.trim()).filter((t: string) => t),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full my-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {project ? 'Edit Project' : 'Add New Project'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Image</label>
            
            {/* Upload Button */}
            <div className="mb-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 transition-colors">
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP, or GIF (max 5MB)</p>
            </div>

            {/* Or Manual URL Input */}
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">or enter URL manually</span>
              </div>
            </div>

            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            {/* Image Preview */}
            {formData.image && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div className="relative inline-block">
                  <img 
                    src={formData.image} 
                    alt="Project preview" 
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Technologies (comma-separated)</label>
            <input
              type="text"
              value={formData.tech}
              onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="React, Node.js, MongoDB"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Demo Link</label>
              <input
                type="url"
                value={formData.demoLink || null}
                onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://"
                
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code Link</label>
              <input
                type="url"
                value={formData.codeLink || null}
                onChange={(e) => setFormData({ ...formData, codeLink: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured Project</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              {project ? 'Update Project' : 'Add Project'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
