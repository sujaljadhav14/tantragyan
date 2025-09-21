import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "../../components/theme-provider";
import { cn } from "@/lib/utils";
import { 
  Search, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Sparkles,
  BookOpen,
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WebSocketPage from './WebSocketPage';

const CommunityHome = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const featuredDiscussions = [
    {
      id: 1,
      title: "Getting Started with Machine Learning",
      author: "Sarah Chen",
      avatar: "https://dashboard.codeparrot.ai/api/image/Z8nnurwkNXOiaWCz/img.png",
      replies: 45,
      views: 1200,
      category: "AI & ML"
    },
    {
      id: 2,
      title: "Web Development Best Practices 2024",
      author: "Mike Johnson",
      avatar: "https://dashboard.codeparrot.ai/api/image/Z8nnurwkNXOiaWCz/img-2.png",
      replies: 32,
      views: 890,
      category: "Web Dev"
    }
  ];

  const studyGroups = [
    {
      id: 1,
      name: "Python Programming",
      members: 128,
      activeNow: 12,
      category: "Programming"
    },
    {
      id: 2,
      name: "Data Science Projects",
      members: 95,
      activeNow: 8,
      category: "Data Science"
    }
  ];

  const trendingTopics = [
    "#MachineLearning",
    "#WebDevelopment",
    "#Python",
    "#AI",
    "#DataScience"
  ];

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
            Welcome to Our Learning Community
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connect with fellow learners, share knowledge, and grow together
          </p>
          <div className="max-w-2xl mx-auto flex gap-4">
            <Input
              placeholder="Search discussions..."
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

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured Discussions */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#6938EF]" />
                Featured Discussions
              </h2>
              <Button variant="ghost" onClick={() => navigate('/community/queries')}>
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-4">
              {featuredDiscussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className={cn(
                    "p-6 rounded-xl border",
                    theme === 'dark' ? 'bg-[#110C1D] border-[#6938EF]/20' : 'bg-white border-border'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={discussion.avatar} />
                        <AvatarFallback>{discussion.author[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold mb-1">{discussion.title}</h3>
                        <p className="text-sm text-muted-foreground">by {discussion.author}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{discussion.category}</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> {discussion.replies} replies
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" /> {discussion.views} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Live Chat Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-[#6938EF]" />
                Live Community Chat
              </h2>
            </div>
            <WebSocketPage />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Study Groups */}
          <section className={cn(
            "p-6 rounded-xl border",
            theme === 'dark' ? 'bg-[#110C1D] border-[#6938EF]/20' : 'bg-white border-border'
          )}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-[#6938EF]" />
                Study Groups
              </h2>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {studyGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {group.members} members • {group.activeNow} active now
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Topics */}
          <section className={cn(
            "p-6 rounded-xl border",
            theme === 'dark' ? 'bg-[#110C1D] border-[#6938EF]/20' : 'bg-white border-border'
          )}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#6938EF]" />
              <h2 className="text-xl font-bold">Trending Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-[#6938EF]/10">
                  {topic}
                </Badge>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CommunityHome;