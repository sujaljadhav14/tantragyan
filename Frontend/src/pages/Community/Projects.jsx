import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/toast";

const Projects = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/projects', {
                credentials: 'include'
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch projects');
            }

            setProjects(data.projects);
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
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Projects</h1>
                <Button
                    onClick={() => navigate('/instructor/projects/create')}
                    className="bg-[#6938EF] hover:bg-[#5B2FD1] text-white"
                >
                    Create New Project
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6938EF]"></div>
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center text-gray-500">
                    <p>No projects found. Create your first project!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project._id}
                            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                        >
                            <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-3">
                                {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                    {project.category}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {project.location}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>{project.organization}</span>
                                <span>
                                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Projects;