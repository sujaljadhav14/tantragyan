import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/toast"; // Fixed import path
import { Button } from "../../components/ui/button"; // Fixed import path
import { Input } from "../../components/ui/input"; // Fixed import path 
import { Textarea } from "../../components/ui/textarea"; // Fixed import path

const CreateProject = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'urban',
        location: '',
        deadline: '',
        organization: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:4000/api/projects/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create project');
            }

            toast({
                title: "Success",
                description: "Project created successfully",
            });
            navigate('/instructor/projects');
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block mb-2">Title</label>
                    <Input
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter project title"
                    />
                </div>

                <div>
                    <label className="block mb-2">Description</label>
                    <Textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter project description"
                    />
                </div>

                <div>
                    <label className="block mb-2">Category</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="urban">Urban Development</option>
                        <option value="rural">Rural Development</option>
                        <option value="technology">Technology</option>
                        <option value="environment">Environment</option>
                        <option value="education">Education</option>
                        <option value="healthcare">Healthcare</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-2">Location</label>
                    <Input
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter project location"
                    />
                </div>

                <div>
                    <label className="block mb-2">Organization</label>
                    <Input
                        required
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Enter organization name"
                    />
                </div>

                <div>
                    <label className="block mb-2">Deadline</label>
                    <Input
                        type="date"
                        required
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-[#6938EF] hover:bg-[#5B2FD1] text-white"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Project'}
                </Button>
            </form>
        </div>
    );
};

export default CreateProject;

