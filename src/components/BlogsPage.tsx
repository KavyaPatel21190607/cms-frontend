import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import { blogsAPI, uploadAPI } from '../services/api';

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
  category: string;
  link: string;
}

export function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await blogsAPI.get();
      console.log('Blogs response:', response);
      if (response.success && response.data) {
        setBlogs(response.data.blogs || []);
        setFeaturedBlog(response.data.featuredBlog || null);
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      try {
        const response = await blogsAPI.delete(id);
        if (response.success) {
          setBlogs(blogs.filter(b => b._id !== id));
          alert('✅ Blog deleted successfully!');
        }
      } catch (error) {
        console.error('Failed to delete blog:', error);
        alert('❌ Failed to delete blog');
      }
    }
  };

  const handleEdit = (blog: Blog, featured: boolean = false) => {
    setEditingBlog(blog);
    setIsFeatured(featured);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingBlog(null);
    setIsFeatured(false);
    setShowModal(true);
  };

  const handleSave = async (blogData: Partial<Blog>, setAsFeatured: boolean = false) => {
    try {
      if (editingBlog) {
        if (isFeatured) {
          // Update featured blog
          const response = await blogsAPI.update({ featuredBlog: blogData });
          if (response.success) {
            setFeaturedBlog(response.data.featuredBlog);
            alert('✅ Featured blog updated successfully!');
          }
        } else {
          // Update regular blog
          const updatedBlogs = blogs.map(b => 
            b._id === editingBlog._id ? { ...b, ...blogData } : b
          );
          const response = await blogsAPI.update({ blogs: updatedBlogs });
          if (response.success) {
            setBlogs(response.data.blogs);
            alert('✅ Blog updated successfully!');
          }
        }
      } else {
        if (setAsFeatured) {
          // Add as featured blog
          const response = await blogsAPI.update({ featuredBlog: blogData });
          if (response.success) {
            setFeaturedBlog(response.data.featuredBlog);
            alert('✅ Featured blog added successfully!');
          }
        } else {
          // Add as regular blog
          const response = await blogsAPI.add(blogData);
          if (response.success) {
            setBlogs(response.data.blogs);
            alert('✅ Blog added successfully!');
          }
        }
      }
      setShowModal(false);
      setEditingBlog(null);
      setIsFeatured(false);
    } catch (error) {
      console.error('Failed to save blog:', error);
      alert('❌ Failed to save blog');
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
          <h1 className="text-gray-900 mb-2">Blog Posts</h1>
          <p className="text-gray-600">Manage your blog content</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Blog
        </button>
      </motion.div>

      {/* Featured Blog Section */}
      {featuredBlog && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              ⭐ Featured Blog
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="h-64 md:h-full bg-gray-100 overflow-hidden">
                <img src={featuredBlog.image} alt={featuredBlog.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                    {featuredBlog.category}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900">{featuredBlog.title}</h3>
                  <p className="text-gray-600">{featuredBlog.excerpt}</p>
                  <div className="text-sm text-gray-500">
                    {featuredBlog.date} • {featuredBlog.readTime}
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t mt-4">
                  <button
                    onClick={() => handleEdit(featuredBlog, true)}
                    className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Featured
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog, index) => (
          <motion.div
            key={blog._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-48 bg-gray-100 overflow-hidden">
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">{blog.category}</span>
                <h3 className="text-gray-900 mt-2">{blog.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{blog.excerpt}</p>
              </div>
              <div className="text-sm text-gray-500">
                {blog.date} • {blog.readTime}
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(blog)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => deleteBlog(blog._id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <BlogModal
          blog={editingBlog}
          isFeatured={isFeatured}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingBlog(null);
            setIsFeatured(false);
          }}
        />
      )}
    </div>
  );
}

function BlogModal({ blog, isFeatured, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    title: blog?.title || '',
    excerpt: blog?.excerpt || '',
    image: blog?.image || '',
    date: blog?.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    readTime: blog?.readTime || '',
    category: blog?.category || '',
    link: blog?.link || '#',
  });
  const [setAsFeatured, setSetAsFeatured] = useState(isFeatured);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadAPI.uploadSingle(file, 'blogs');
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
    onSave(formData, setAsFeatured);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full h-full max-w-3xl max-h-[90vh] overflow-y-auto py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-2xl p-6 md:p-8 mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {blog ? 'Edit Blog' : 'Add New Blog'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <div className="mb-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-green rounded-lg hover:bg-indigo-700 transition-colors">
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Or enter image URL"
              required
            />
            {formData.image && (
              <img src={formData.image} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Read Time</label>
              <input
                type="text"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5 min read"
                required
              />
            </div>
          </div>
          {!isFeatured && (
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <input
                type="checkbox"
                id="featured"
                checked={setAsFeatured}
                onChange={(e) => setSetAsFeatured(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700 cursor-pointer">
                ⭐ Set as Featured Blog
              </label>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-medium shadow-lg transition-all"
            >
              {blog ? 'Update Blog' : 'Add Blog'}
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
