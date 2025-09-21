import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/toast';
import { createProject } from '../../api/axios.api';

const CreateProject = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        modules: [
            {
                title: '',
                content: '',
                videoUrl: '',
            }
        ],
        category: '',
        level: 'beginner',
        poster: null
    });

    const [imagePreview, setImagePreview] = useState(null);

    const categories = [
        "Web Development",
        "Mobile Development",
        "Data Science",
        "UI/UX Design",
        "Digital Marketing",
        "Cloud Computing",
        "Cybersecurity",
        "Artificial Intelligence",
        "DevOps",
        "Blockchain"
    ];

    const handleAddModule = () => {
        setFormData(prev => ({
            ...prev,
            modules: [...prev.modules, {
                title: '',
                content: '',
                videoUrl: '',
            }]
        }));
    };

    const handleRemoveModule = (index) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.filter((_, i) => i !== index)
        }));
    };

    const handleModuleChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.map((module, i) =>
                i === index ? { ...module, [field]: value } : module
            )
        }));
    };

    const handleImageUpload = (file) => {
        if (!file) return;

        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast({
                title: "Invalid file type",
                description: "Please upload a JPG, PNG, or WebP image.",
                variant: "destructive",
            });
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast({
                title: "File too large",
                description: "Image size should be less than 2MB.",
                variant: "destructive",
            });
            return;
        }

        setFormData(prev => ({ ...prev, poster: file }));
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setFormData(prev => ({ ...prev, poster: null }));
        setImagePreview(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);

            const projectFormData = new FormData();
            projectFormData.append('title', formData.title);
            projectFormData.append('description', formData.description);
            projectFormData.append('category', formData.category);
            projectFormData.append('level', formData.level);

            if (formData.poster) {
                projectFormData.append('poster', formData.poster);
            }

            projectFormData.append('modules', JSON.stringify(formData.modules));

            const data = await createProject(projectFormData);
            toast({
                title: "Success!",
                description: data.message || "Project created successfully",
                variant: "success",
            });

            navigate(`/projects/${data.project._id}`);

        } catch (error) {
            console.error('Error creating project:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create project",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold">Create New Project</h1>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Details */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-2 rounded-xl border bg-transparent"
                                placeholder="e.g., Advanced Web Development"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-2 rounded-xl border bg-transparent"
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-2 rounded-xl border bg-transparent"
                                rows={3}
                                placeholder="Describe the project..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Difficulty Level</label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                                className="w-full px-4 py-2 rounded-xl border bg-transparent"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Poster</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleImageUpload(file);
                                    }
                                }}
                            />
                            {imagePreview && (
                                <div>
                                    <img src={imagePreview} alt="Project poster" className="w-full h-full object-cover" />
                                    <button type="button" onClick={handleRemoveImage}>Remove Image</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modules */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Project Modules</h2>
                        {formData.modules.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Module Title</label>
                                    <input
                                        type="text"
                                        value={module.title}
                                        onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border bg-transparent"
                                        placeholder="e.g., Introduction to React Hooks"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Content</label>
                                    <textarea
                                        value={module.content}
                                        onChange={(e) => handleModuleChange(moduleIndex, 'content', e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border bg-transparent"
                                        rows={4}
                                        placeholder="Module content and description..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Video URL</label>
                                    <input
                                        type="text"
                                        value={module.videoUrl}
                                        onChange={(e) => handleModuleChange(moduleIndex, 'videoUrl', e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border bg-transparent"
                                        placeholder="Enter video URL"
                                    />
                                </div>

                                {moduleIndex > 0 && (
                                    <button type="button" onClick={() => handleRemoveModule(moduleIndex)}>Remove Module</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddModule}>Add Module</button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-xl bg-[#6938EF] text-white"
                    >
                        {isSubmitting ? "Creating Project..." : "Create Project"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProject;

