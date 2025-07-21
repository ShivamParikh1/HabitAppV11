import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Heart, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Sparkles,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const gratitudeColors = [
  "bg-pink-100 border-pink-200 text-pink-800",
  "bg-purple-100 border-purple-200 text-purple-800",
  "bg-blue-100 border-blue-200 text-blue-800",
  "bg-green-100 border-green-200 text-green-800",
  "bg-yellow-100 border-yellow-200 text-yellow-800",
  "bg-orange-100 border-orange-200 text-orange-800",
];

export default function GratitudeWall() {
  const { state, dispatch } = useApp();
  const { gratitudePosts, user } = state;
  
  const [showDialog, setShowDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    author: user?.full_name || "Anonymous"
  });

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    dispatch({
      type: 'ADD_GRATITUDE_POST',
      payload: {
        ...newPost,
        user_id: user?.id,
        color: gratitudeColors[Math.floor(Math.random() * gratitudeColors.length)]
      }
    });

    setNewPost({
      title: "",
      content: "",
      author: user?.full_name || "Anonymous"
    });
    setShowDialog(false);
  };

  const handleDeletePost = (postId) => {
    if (window.confirm("Are you sure you want to delete this gratitude post?")) {
      dispatch({
        type: 'DELETE_GRATITUDE_POST',
        payload: { id: postId }
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gratitude Wall</h1>
            <p className="text-gray-600 mt-1">Share what you're grateful for and spread positivity</p>
          </div>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setNewPost({
                  title: "",
                  content: "",
                  author: user?.full_name || "Anonymous"
                });
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Gratitude
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Share Your Gratitude
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">What are you grateful for? *</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g., My family, A beautiful sunset, Good health..."
                />
              </div>

              <div>
                <Label htmlFor="content">Tell us more *</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share why this means so much to you..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="author">Your name (optional)</Label>
                <Input
                  id="author"
                  value={newPost.author}
                  onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                  placeholder="How should we credit you?"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Share Gratitude
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{gratitudePosts.length}</p>
              </div>
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">
                  {gratitudePosts.filter(post => {
                    const postDate = new Date(post.created_at);
                    const now = new Date();
                    return postDate.getMonth() === now.getMonth() && 
                           postDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Positive Vibes</p>
                <p className="text-2xl font-bold text-yellow-600">∞</p>
              </div>
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gratitude Posts */}
      <div className="space-y-6">
        {gratitudePosts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Start the Gratitude Wall</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Be the first to share what you're grateful for and inspire others to spread positivity!
            </p>
            <Button 
              onClick={() => setShowDialog(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Gratitude Post
            </Button>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            <AnimatePresence>
              {gratitudePosts
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="break-inside-avoid mb-6"
                  >
                    <Card className={`${post.color} border-2 hover:shadow-lg transition-all duration-300 relative group`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold leading-tight">
                            {post.title}
                          </CardTitle>
                          {post.user_id === user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed mb-4">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="secondary" className="bg-white/50">
                            {post.author}
                          </Badge>
                          <span className="text-gray-600">
                            {format(new Date(post.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Inspiration Section */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardContent className="p-8 text-center">
          <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            "Gratitude turns what we have into enough."
          </h3>
          <p className="text-gray-600">
            Take a moment each day to appreciate the good things in your life, big and small.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}