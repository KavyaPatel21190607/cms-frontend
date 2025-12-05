import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Code, X, Layers } from 'lucide-react';
import { skillsAPI } from '../services/api';

interface ProficiencySkill {
  _id: string;
  name: string;
  level: number;
}

interface SkillCategory {
  _id: string;
  icon: string;
  title: string;
  skills: string[];
}

export function SkillsPage() {
  const [proficiencySkills, setProficiencySkills] = useState<ProficiencySkill[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<ProficiencySkill | null>(null);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [activeTab, setActiveTab] = useState<'proficiency' | 'categories'>('proficiency');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await skillsAPI.get();
      console.log('Skills API response:', response);
      console.log('Skills data:', response.data);
      if (response.success && response.data) {
        const proficiencyData = response.data.proficiencySkills || [];
        const categoriesData = response.data.skillCategories || [];
        console.log('Proficiency skills:', proficiencyData);
        console.log('Skill categories:', categoriesData);
        setProficiencySkills(proficiencyData);
        setSkillCategories(categoriesData);
      } else {
        console.log('No skills data found');
        setProficiencySkills([]);
        setSkillCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      setProficiencySkills([]);
      setSkillCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (id: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      try {
        const response = await skillsAPI.delete(id);
        if (response.success) {
          setProficiencySkills(proficiencySkills.filter(s => s._id !== id));
          alert('✅ Skill deleted successfully!');
        }
      } catch (error) {
        console.error('Failed to delete skill:', error);
        alert('❌ Failed to delete skill');
      }
    }
  };

  const handleEdit = (skill: ProficiencySkill) => {
    setEditingSkill(skill);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingSkill(null);
    setShowModal(true);
  };

  const handleSave = async (skillData: Partial<ProficiencySkill>) => {
    try {
      if (editingSkill) {
        const updatedSkills = proficiencySkills.map(s => 
          s._id === editingSkill._id ? { ...s, ...skillData } : s
        );
        const response = await skillsAPI.update({ proficiencySkills: updatedSkills });
        if (response.success) {
          setProficiencySkills(response.data.proficiencySkills);
          alert('✅ Skill updated successfully!');
        }
      } else {
        const response = await skillsAPI.add(skillData);
        if (response.success) {
          setProficiencySkills(response.data.proficiencySkills);
          alert('✅ Skill added successfully!');
        }
      }
      setShowModal(false);
      setEditingSkill(null);
    } catch (error) {
      console.error('Failed to save skill:', error);
      alert('❌ Failed to save skill');
    }
  };

  const handleEditCategory = (category: SkillCategory) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleAddNewCategory = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (categoryData: Partial<SkillCategory>) => {
    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategories = skillCategories.map(c =>
          c._id === editingCategory._id ? { ...c, ...categoryData } : c
        );
        console.log('Updating categories:', updatedCategories);
        const response = await skillsAPI.update({ skillCategories: updatedCategories });
        console.log('Update response:', response);
        if (response.success && response.data) {
          setSkillCategories(response.data.skillCategories || []);
          setShowCategoryModal(false);
          setEditingCategory(null);
          alert('✅ Category updated successfully!');
        } else {
          alert('❌ Failed to update category: ' + (response.message || 'Unknown error'));
        }
      } else {
        // Add new category
        const newCategories = [...skillCategories, categoryData];
        console.log('Adding new category:', categoryData);
        console.log('New categories array:', newCategories);
        const response = await skillsAPI.update({ skillCategories: newCategories });
        console.log('Add response:', response);
        if (response.success && response.data) {
          setSkillCategories(response.data.skillCategories || []);
          setShowCategoryModal(false);
          setEditingCategory(null);
          alert('✅ Category added successfully!');
        } else {
          alert('❌ Failed to add category: ' + (response.message || 'Unknown error'));
        }
      }
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert('❌ Failed to save category: ' + (error.message || 'Unknown error'));
    }
  };

  const deleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        console.log('Deleting category:', id);
        const updatedCategories = skillCategories.filter(c => c._id !== id);
        console.log('Updated categories after delete:', updatedCategories);
        const response = await skillsAPI.update({ skillCategories: updatedCategories });
        console.log('Delete response:', response);
        if (response.success && response.data) {
          setSkillCategories(response.data.skillCategories || []);
          alert('✅ Category deleted successfully!');
        } else {
          alert('❌ Failed to delete category: ' + (response.message || 'Unknown error'));
        }
      } catch (error: any) {
        console.error('Failed to delete category:', error);
        alert('❌ Failed to delete category: ' + (error.message || 'Unknown error'));
      }
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
          <h1 className="text-gray-900 mb-2">Skills & Expertise</h1>
          <p className="text-gray-600">Manage your skills across different categories</p>
        </div>
        {activeTab === 'proficiency' ? (
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Proficiency Skill
          </button>
        ) : (
          <button
            onClick={handleAddNewCategory}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        )}
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('proficiency')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'proficiency'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Proficiency Skills ({proficiencySkills.length})
          {activeTab === 'proficiency' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'categories'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Skill Categories ({skillCategories.length})
          {activeTab === 'categories' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
      </div>

      {/* Proficiency Skills Tab */}
      {activeTab === 'proficiency' && (
        <>
          {proficiencySkills.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Code className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No skills yet</h3>
          <p className="text-gray-500 mb-6">Add your first skill to get started</p>
          <button
            onClick={handleAddNew}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-md inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Your First Skill
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proficiencySkills.map((skill, index) => (
            <motion.div
              key={skill._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-gray-900 font-medium flex-1">{skill.name}</h3>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Proficiency</span>
                  <span className="text-sm font-medium text-blue-600">{skill.level}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(skill)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => deleteSkill(skill._id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
        </>
      )}

      {/* Skill Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-gray-900 font-medium flex-1">{category.title}</h3>
              </div>
              
              <div className="space-y-2">
                {category.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 mt-4 border-t">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(category._id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}


      {showModal && (
        <SkillModal
          skill={editingSkill}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingSkill(null);
          }}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}

function SkillModal({ skill, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    name: skill?.name || '',
    level: skill?.level || 50,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full h-full max-w-md max-h-[90vh] overflow-y-auto py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-2xl p-6 md:p-8 mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {skill ? 'Edit Skill' : 'Add New Skill'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., React, Node.js, Python"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proficiency Level: {formData.level}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Expert</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-medium shadow-lg transition-all"
            >
              {skill ? 'Update Skill' : 'Add Skill'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
        </motion.div>
      </div>
    </div>
  );
}

function CategoryModal({ category, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    icon: category?.icon || 'Code',
    title: category?.title || '',
    skills: category?.skills || [''],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('❌ Please fill out the Title field');
      return;
    }
    
    const filteredSkills = formData.skills.filter((s: string) => s.trim() !== '');
    if (filteredSkills.length === 0) {
      alert('❌ Please add at least one skill');
      return;
    }
    
    onSave({ ...formData, skills: filteredSkills });
  };

  const handleAddSkill = () => {
    setFormData({ ...formData, skills: [...formData.skills, ''] });
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = formData.skills.filter((_: string, i: number) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData({ ...formData, skills: newSkills });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Add New Category'}
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
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Category Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="e.g., Frontend Development"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Icon
            </label>
            <select
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="Code">💻 Code</option>
              <option value="Database">🗄️ Database</option>
              <option value="Palette">🎨 Palette</option>
              <option value="Smartphone">📱 Smartphone</option>
              <option value="Globe">🌐 Globe</option>
              <option value="Zap">⚡ Zap</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-800">
                Skills
              </label>
              <button
                type="button"
                onClick={handleAddSkill}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add Skill
              </button>
            </div>
            <div className="space-y-2">
              {formData.skills.map((skill: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="e.g., React"
                  />
                  {formData.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
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
              className="flex-1 px-5 py-2.5 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              {category ? 'Update Category' : 'Add Category'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
