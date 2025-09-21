import React, { useState, useEffect } from 'react';
import { useTheme } from "../../components/theme-provider";
import { cn } from "@/lib/utils";
import {
    Search,
    Filter,
    MapPin,
    Calendar,
    Building2,
    MessageSquare
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from "../../components/ui/toast";


const ProjectsHub = () => {
    const { theme } = useTheme();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const navigate = useNavigate();
    const { toast } = useToast();

    const categories = [
        { id: 'all', label: 'All Projects' },
        { id: 'urban', label: 'Urban Development' },
        { id: 'rural', label: 'Rural Development' },
        { id: 'technology', label: 'Technology' },
        { id: 'environment', label: 'Environment' },
        { id: 'education', label: 'Education' },
        { id: 'healthcare', label: 'Healthcare' }
    ];

    const mockProjects = [
        {
            id: 1,
            title: "Smart City Infrastructure",
            description: "Developing sustainable smart city solutions using IoT and renewable energy",
            category: "urban",
            organization: "TechCity Solutions",
            location: "Mumbai, India",
            deadline: "2024-04-15",
            status: "open",
            collaborators: 12
        },
        {
            id: 2,
            title: "Rural Healthcare App",
            description: "Mobile application to connect rural communities with healthcare professionals",
            category: "healthcare",
            organization: "HealthTech Foundation",
            location: "Delhi, India",
            deadline: "2024-05-01",
            status: "open",
            collaborators: 8
        },
        {
            id: 3,
            title: "EdTech Platform",
            description: "Building an AI-powered educational platform for personalized learning",
            category: "education",
            organization: "EduInnovate",
            location: "Bangalore, India",
            deadline: "2024-04-30",
            status: "open",
            collaborators: 15
        }
    ];

    useEffect(() => {
        fetchProjects();
    }, [selectedCategory]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:4000/api/projects', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            // Check if the response is ok before trying to parse JSON
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`Failed to fetch projects: ${response.statusText}`);
            }

            const data = await response.json();
            setProjects(data.projects || []); // Provide fallback empty array

        } catch (error) {
            console.error('Error fetching projects:', error);
            // Use mockProjects as fallback during development
            setProjects(mockProjects);
            toast({
                title: "Error",
                description: "Using mock data - API not available",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleJoinProject = async (projectId) => {
        try {
            const response = await fetch(`http://localhost:4000/api/projects/${projectId}/join`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to join project');
            }

            toast({
                title: "Success",
                description: "Successfully joined the project",
            });
            navigate(`/projects/${projectId}`);
        } catch (error) {
            console.error('Error joining project:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to join project",
                variant: "destructive",
            });
        }
    };

    return (
        <div className={cn(
            "min-h-screen",
            theme === 'dark' ? 'bg-[#0A0118]' : 'bg-background'
        )}>
            {/* Hero Section */}
            <div className={cn(
                "w-full py-16 px-4",
                theme === 'dark' ? 'bg-[#110C1D]' : 'bg-purple-50'
            )}>
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Real-World Project Hub
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Collaborate on impactful projects and solve real challenges
                    </p>
                    <div className="max-w-2xl mx-auto flex gap-4">
                        <Input
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                        />
                        <Button className="bg-[#6938EF] hover:bg-[#5B2FD1] text-white">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Categories */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
                    {categories.map(category => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "outline"}
                            onClick={() => setSelectedCategory(category.id)}
                            className={cn(
                                "whitespace-nowrap",
                                selectedCategory === category.id && "bg-[#6938EF] text-white"
                            )}
                        >
                            {category.label}
                        </Button>
                    ))}
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        // Loading skeleton
                        [...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "p-6 rounded-xl border animate-pulse",
                                    theme === 'dark' ? 'bg-[#110C1D] border-[#6938EF]/20' : 'bg-card border-border'
                                )}
                            >
                                <div className="space-y-4">
                                    <div className="h-6 w-2/3 bg-accent rounded" />
                                    <div className="h-4 w-full bg-accent rounded" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-1/2 bg-accent rounded" />
                                        <div className="h-4 w-1/3 bg-accent rounded" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (projects?.length > 0 ? (
                        projects
                            .filter(project => selectedCategory === 'all' || project.category === selectedCategory)
                            .filter(project =>
                                project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                project.description.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(project => (
                                <ProjectCard
                                    key={project._id || project.id}
                                    project={project}
                                    onJoin={() => handleJoinProject(project._id || project.id)}
                                />
                            ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <p className="text-muted-foreground">No projects found</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProjectCard = ({ project, onJoin }) => {
    const { theme } = useTheme();

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn(
                "p-6 rounded-xl border",
                theme === 'dark'
                    ? 'bg-[#110C1D] border-[#6938EF]/20 hover:border-[#6938EF]/50'
                    : 'bg-card border-border hover:border-[#6938EF]/50'
            )}
        >
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <h3 className={cn(
                        "font-semibold text-lg line-clamp-2",
                        theme === 'dark' ? 'text-white' : 'text-foreground'
                    )}>
                        {project.title}
                    </h3>
                    <Badge variant="outline" className={cn(
                        project.status === 'open'
                            ? 'border-green-500 text-green-500'
                            : 'border-yellow-500 text-yellow-500'
                    )}>
                        {project.status}
                    </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                </p>

                {/* Details */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span>{project.organization}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="w-4 h-4" />
                        <span>{project.collaborators} Collaborators</span>
                    </div>
                    <Button
                        size="sm"
                        className="bg-[#6938EF] hover:bg-[#5B2FD1] text-white"
                        onClick={onJoin}
                    >
                        Join Project
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectsHub;