import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Eye, Upload, X } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { aboutAPI, heroAPI, footerAPI, uploadAPI } from '../services/api';

export function ContentEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // About Section - matching database schema
  const [aboutData, setAboutData] = useState({
    title: '',
    name: '',
    location: '',
    role: '',
    bio: [] as string[],
    highlights: [] as string[],
    stats: [] as any[]
  });

  // Hero Section - matching database schema
  const [heroData, setHeroData] = useState({
    greeting: '',
    name: '',
    role: '',
    bio: '',
    heroImage: {
      src: '',
      alt: '',
      experienceLabel: '',
      size: {
        width: 80,
        height: 80
      }
    },
    ctaButtons: [] as any[],
    socialLinks: [] as any[]
  });

  // Footer Section - matching database schema
  const [footerData, setFooterData] = useState({
    brand: {
      name: '',
      description: ''
    },
    socialLinks: [] as any[],
    quickLinks: [] as any[],
    bottomBar: {
      text: '',
      heartIcon: false,
      links: [] as any[]
    }
  });

  useEffect(() => {
    const fetchAllContent = async () => {
      try {
        const [aboutRes, heroRes, footerRes] = await Promise.all([
          aboutAPI.get(),
          heroAPI.get(),
          footerAPI.get()
        ]);

        console.log('Hero Response:', heroRes);
        console.log('About Response:', aboutRes);
        console.log('Footer Response:', footerRes);

        if (aboutRes.success && aboutRes.data) {
          setAboutData({
            title: aboutRes.data.title || '',
            name: aboutRes.data.name || '',
            location: aboutRes.data.location || '',
            role: aboutRes.data.role || '',
            bio: aboutRes.data.bio || [],
            highlights: aboutRes.data.highlights || [],
            stats: aboutRes.data.stats || []
          });
        }
        if (heroRes.success && heroRes.data) {
          setHeroData({
            greeting: heroRes.data.greeting || '',
            name: heroRes.data.name || '',
            role: heroRes.data.role || '',
            bio: heroRes.data.bio || '',
            heroImage: {
              src: heroRes.data.heroImage?.src || '',
              alt: heroRes.data.heroImage?.alt || '',
              experienceLabel: heroRes.data.heroImage?.experienceLabel || '',
              size: {
                width: heroRes.data.heroImage?.size?.width || 80,
                height: heroRes.data.heroImage?.size?.height || 80
              }
            },
            ctaButtons: heroRes.data.ctaButtons || [],
            socialLinks: heroRes.data.socialLinks || []
          });
        }
        if (footerRes.success && footerRes.data) {
          setFooterData({
            brand: {
              name: footerRes.data.brand?.name || '',
              description: footerRes.data.brand?.description || ''
            },
            socialLinks: footerRes.data.socialLinks || [],
            quickLinks: footerRes.data.quickLinks || [],
            bottomBar: {
              text: footerRes.data.bottomBar?.text || '',
              heartIcon: footerRes.data.bottomBar?.heartIcon || false,
              links: footerRes.data.bottomBar?.links || []
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllContent();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('❌ Invalid file type. Please upload JPG, PNG, WEBP, or GIF.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadAPI.uploadSingle(file, 'hero');
      
      if (result.success && result.data.url) {
        setHeroData({
          ...heroData,
          heroImage: {
            ...heroData.heroImage,
            src: result.data.url
          }
        });
        alert('✅ Image uploaded successfully!');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleStatIconUpload = async (event: React.ChangeEvent<HTMLInputElement>, statIndex: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('❌ Invalid file type. Please upload JPG, PNG, WEBP, GIF, or SVG.');
      return;
    }

    // Validate file size (2MB for icons)
    if (file.size > 2 * 1024 * 1024) {
      alert('❌ File size must be less than 2MB.');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadAPI.uploadSingle(file, 'stats-icons');
      
      if (result.success && result.data.url) {
        const newStats = [...aboutData.stats];
        newStats[statIndex] = { 
          ...newStats[statIndex], 
          iconImage: result.data.url 
        };
        setAboutData({ ...aboutData, stats: newStats });
        alert('✅ Icon uploaded successfully!');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const [aboutResult, heroResult, footerResult] = await Promise.all([
        aboutAPI.update(aboutData),
        heroAPI.update(heroData),
        footerAPI.update(footerData)
      ]);

      if (aboutResult.success && heroResult.success && footerResult.success) {
        alert('✅ All changes saved successfully!');
      } else {
        alert('⚠️ Some changes failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('❌ Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-gray-900 mb-2">Content Editor</h1>
          <p className="text-gray-600">Edit Hero, About, and Footer sections</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hero Section</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Greeting</label>
          <input
            type="text"
            value={heroData.greeting}
            onChange={(e) => setHeroData({ ...heroData, greeting: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Hi, I'm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={heroData.name}
            onChange={(e) => setHeroData({ ...heroData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <input
            type="text"
            value={heroData.role}
            onChange={(e) => setHeroData({ ...heroData, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Full Stack Developer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={heroData.bio}
            onChange={(e) => setHeroData({ ...heroData, bio: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            placeholder="Brief description about yourself"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
          
          {/* Upload Button */}
          <div className="mb-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 transition-colors">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
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
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">or enter URL manually</span>
            </div>
          </div>
          
          <input
            type="text"
            value={heroData.heroImage.src}
            onChange={(e) => setHeroData({ 
              ...heroData, 
              heroImage: { ...heroData.heroImage, src: e.target.value }
            })}
            className="w-full mt-3 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
          {heroData.heroImage.src && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="relative inline-block">
                <img 
                  src={heroData.heroImage.src} 
                  alt="Profile preview" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
                <button
                  onClick={() => setHeroData({
                    ...heroData,
                    heroImage: { ...heroData.heroImage, src: '' }
                  })}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Image Alt Text</label>
          <input
            type="text"
            value={heroData.heroImage.alt}
            onChange={(e) => setHeroData({ 
              ...heroData, 
              heroImage: { ...heroData.heroImage, alt: e.target.value }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience Label</label>
          <input
            type="text"
            value={heroData.heroImage.experienceLabel}
            onChange={(e) => setHeroData({ 
              ...heroData, 
              heroImage: { ...heroData.heroImage, experienceLabel: e.target.value }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 5+ Years Experience"
          />
        </div>
      </motion.div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About Section</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={aboutData.title}
            onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., About Me"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={aboutData.name}
            onChange={(e) => setAboutData({ ...aboutData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={aboutData.location}
            onChange={(e) => setAboutData({ ...aboutData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., San Francisco, CA"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <input
            type="text"
            value={aboutData.role}
            onChange={(e) => setAboutData({ ...aboutData, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Software Engineer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio (One paragraph per line)</label>
          <textarea
            value={aboutData.bio.join('\n')}
            onChange={(e) => setAboutData({ ...aboutData, bio: e.target.value.split('\n') })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={6}
            placeholder="Enter bio paragraphs, one per line"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Highlights (One per line)</label>
          <textarea
            value={aboutData.highlights.join('\n')}
            onChange={(e) => setAboutData({ ...aboutData, highlights: e.target.value.split('\n').filter(h => h.trim()) })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={5}
            placeholder="Enter highlights, one per line (e.g., Expert in React & Node.js)"
          />
          <p className="text-xs text-gray-500 mt-1">Current: {aboutData.highlights.length} highlights</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Statistics</label>
          <div className="space-y-3">
            {aboutData.stats.map((stat: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                {/* Icon Upload Section */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Icon</label>
                  <div className="flex items-start gap-3">
                    {/* Upload Button */}
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm">
                      <Upload className="w-3 h-3" />
                      Upload Icon
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        onChange={(e) => handleStatIconUpload(e, index)}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    
                    {/* Or use emoji/text */}
                    <input
                      type="text"
                      value={stat.icon || ''}
                      onChange={(e) => {
                        const newStats = [...aboutData.stats];
                        newStats[index] = { ...newStats[index], icon: e.target.value };
                        setAboutData({ ...aboutData, stats: newStats });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Or enter emoji (e.g., 💼)"
                    />
                  </div>
                  
                  {/* Icon Preview */}
                  {(stat.iconImage || stat.icon) && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Preview:</span>
                      {stat.iconImage ? (
                        <div className="relative inline-block">
                          <img 
                            src={stat.iconImage} 
                            alt="Icon preview" 
                            className="w-10 h-10 object-contain border border-gray-200 rounded p-1"
                          />
                          <button
                            onClick={() => {
                              const newStats = [...aboutData.stats];
                              newStats[index] = { ...newStats[index], iconImage: '' };
                              setAboutData({ ...aboutData, stats: newStats });
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                            title="Remove uploaded icon"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-2xl">{stat.icon}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Value and Label */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
                    <input
                      type="text"
                      value={stat.value || ''}
                      onChange={(e) => {
                        const newStats = [...aboutData.stats];
                        newStats[index] = { ...newStats[index], value: e.target.value };
                        setAboutData({ ...aboutData, stats: newStats });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g., 5+"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                    <input
                      type="text"
                      value={stat.label || ''}
                      onChange={(e) => {
                        const newStats = [...aboutData.stats];
                        newStats[index] = { ...newStats[index], label: e.target.value };
                        setAboutData({ ...aboutData, stats: newStats });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g., Years"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    const newStats = aboutData.stats.filter((_: any, i: number) => i !== index);
                    setAboutData({ ...aboutData, stats: newStats });
                  }}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Remove Statistic
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newStats = [...aboutData.stats, { icon: '', iconImage: '', value: '', label: '' }];
                setAboutData({ ...aboutData, stats: newStats });
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              + Add Statistic
            </button>
          </div>
        </div>
      </motion.div>

      {/* Footer Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Footer Section</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
          <input
            type="text"
            value={footerData.brand.name}
            onChange={(e) => setFooterData({ ...footerData, brand: { ...footerData.brand, name: e.target.value }})}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your brand name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand Description</label>
          <textarea
            value={footerData.brand.description}
            onChange={(e) => setFooterData({ ...footerData, brand: { ...footerData.brand, description: e.target.value }})}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Brief description for footer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bottom Bar Text</label>
          <input
            type="text"
            value={footerData.bottomBar.text}
            onChange={(e) => setFooterData({ ...footerData, bottomBar: { ...footerData.bottomBar, text: e.target.value }})}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="© 2025 Your Name. All rights reserved."
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={footerData.bottomBar.heartIcon}
              onChange={(e) => setFooterData({ ...footerData, bottomBar: { ...footerData.bottomBar, heartIcon: e.target.checked }})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show Heart Icon
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
          <div className="space-y-3">
            {footerData.socialLinks?.map((social: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={social.platform || ''}
                    onChange={(e) => {
                      const newLinks = [...footerData.socialLinks];
                      newLinks[index] = { ...newLinks[index], platform: e.target.value };
                      setFooterData({ ...footerData, socialLinks: newLinks });
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Platform (e.g., GitHub)"
                  />
                  <input
                    type="text"
                    value={social.icon || ''}
                    onChange={(e) => {
                      const newLinks = [...footerData.socialLinks];
                      newLinks[index] = { ...newLinks[index], icon: e.target.value };
                      setFooterData({ ...footerData, socialLinks: newLinks });
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Icon name"
                  />
                  <input
                    type="text"
                    value={social.href || ''}
                    onChange={(e) => {
                      const newLinks = [...footerData.socialLinks];
                      newLinks[index] = { ...newLinks[index], href: e.target.value };
                      setFooterData({ ...footerData, socialLinks: newLinks });
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="URL"
                  />
                </div>
                <button
                  onClick={() => {
                    const newLinks = footerData.socialLinks.filter((_: any, i: number) => i !== index);
                    setFooterData({ ...footerData, socialLinks: newLinks });
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newLinks = [...footerData.socialLinks, { platform: '', icon: '', href: '' }];
                setFooterData({ ...footerData, socialLinks: newLinks });
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              + Add Social Link
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quick Links</label>
          <div className="space-y-3">
            {footerData.quickLinks?.map((link: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={link.name || ''}
                    onChange={(e) => {
                      const newLinks = [...footerData.quickLinks];
                      newLinks[index] = { ...newLinks[index], name: e.target.value };
                      setFooterData({ ...footerData, quickLinks: newLinks });
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Link name"
                  />
                  <input
                    type="text"
                    value={link.href || ''}
                    onChange={(e) => {
                      const newLinks = [...footerData.quickLinks];
                      newLinks[index] = { ...newLinks[index], href: e.target.value };
                      setFooterData({ ...footerData, quickLinks: newLinks });
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="URL"
                  />
                </div>
                <button
                  onClick={() => {
                    const newLinks = footerData.quickLinks.filter((_: any, i: number) => i !== index);
                    setFooterData({ ...footerData, quickLinks: newLinks });
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newLinks = [...footerData.quickLinks, { name: '', href: '' }];
                setFooterData({ ...footerData, quickLinks: newLinks });
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              + Add Quick Link
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bottom Bar Links</label>
          <div className="space-y-3">
            {footerData.bottomBar.links?.map((link: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={link.name || ''}
                    onChange={(e) => {
                      const newLinks = [...footerData.bottomBar.links];
                      newLinks[index] = { ...newLinks[index], name: e.target.value };
                      setFooterData({ ...footerData, bottomBar: { ...footerData.bottomBar, links: newLinks }});
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Link name (e.g., Privacy Policy)"
                  />
                  <input
                    type="text"
                    value={link.href || ''}
                    onChange={(e) => {
                      const newLinks = [...footerData.bottomBar.links];
                      newLinks[index] = { ...newLinks[index], href: e.target.value };
                      setFooterData({ ...footerData, bottomBar: { ...footerData.bottomBar, links: newLinks }});
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="URL"
                  />
                </div>
                <button
                  onClick={() => {
                    const newLinks = footerData.bottomBar.links.filter((_: any, i: number) => i !== index);
                    setFooterData({ ...footerData, bottomBar: { ...footerData.bottomBar, links: newLinks }});
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newLinks = [...footerData.bottomBar.links, { name: '', href: '' }];
                setFooterData({ ...footerData, bottomBar: { ...footerData.bottomBar, links: newLinks }});
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              + Add Bottom Bar Link
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
