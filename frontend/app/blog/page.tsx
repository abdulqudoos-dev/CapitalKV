"use client";

import Image from "next/image";
import { useState, useEffect, ChangeEvent } from "react";
import { ArrowRight } from "lucide-react";
import Image01 from "@/assets/blog-image/image-01.jpg";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import api, { BASE_URL } from "@/utils/api";
import { usePosts } from "@/api/posts_api";

type Post = {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
};

type NewPost = {
  id?: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  image: File | string | null;
};

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const { user, token } = useUser();
  const { toast } = useToast();
  const { data, mutate, isLoading, isError } = usePosts();

  const [newPost, setNewPost] = useState<NewPost>({
    date: "",
    title: "",
    excerpt: "",
    content: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handlePostClick = (post: Post) => setSelectedPost(post);
  const closeModal = () => setSelectedPost(null);

  const openPostForm = () => {
    setNewPost({ date: "", title: "", excerpt: "", content: "", image: null });
    setShowPostForm(true);
  }

  const closePostForm = () => {
    setShowPostForm(false);
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setNewPost({ date: "", title: "", excerpt: "", content: "", image: null });
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPost({ ...newPost, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitPost = async () => {
    try {
      // Check for both user and token before proceeding
      if (!user || !token) {
        toast({
          description: "You must be logged in to create or edit a post.",
          variant: "destructive",
        });
        return;
      }
      
      // Also check for admin status before proceeding
      if (!user.is_admin_user) {
          toast({
              description: "You do not have permission to create or edit posts.",
              variant: "destructive",
          });
          return;
      }
      
      // --- FIX: Add the current date if it's a new post ---
      const postDataWithDate = {
        ...newPost,
        date: newPost.date || new Date().toISOString(),
      };
      
      const formData = new FormData();
      formData.append("date", postDataWithDate.date);
      formData.append("title", postDataWithDate.title);
      formData.append("excerpt", postDataWithDate.excerpt);
      formData.append("content", postDataWithDate.content);

      if (postDataWithDate.image instanceof File) {
        formData.append("image", postDataWithDate.image);
      }

      const requestConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = newPost?.id
        ? await api.put(
            `${BASE_URL}/posts/${newPost.id}`,
            formData,
            requestConfig
          )
        : await api.post(`${BASE_URL}/posts`, formData, requestConfig);

      mutate();
      toast({
        description: `Post ${newPost?.id ? "updated" : "created"} successfully!`,
        variant: "success",
      });

      closePostForm();
    } catch (error: any) {
      console.error("Error submitting post:", error);
      toast({
        description: `Error: ${error.response?.data?.detail || error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      // Check for both user and token before proceeding
      if (!user || !token) {
        toast({
          description: "You must be logged in to delete a post.",
          variant: "destructive",
        });
        return;
      }
      
      // Also check for admin status before proceeding
      if (!user.is_admin_user) {
          toast({
              description: "You do not have permission to delete posts.",
              variant: "destructive",
          });
          return;
      }
      
      await api.delete(`${BASE_URL}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ description: "Deleting post...", variant: "loading" });
      mutate();
      toast({ description: "Post deleted successfully!", variant: "success" });
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast({
        description: `Error: ${error.response?.data?.detail || error.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (selectedPost) {
      setNewPost({ ...selectedPost, image: selectedPost.image });
      // Updated the image URL to match the new static serving endpoint
      setImagePreview(selectedPost.image ? `${BASE_URL}/blog/images/${selectedPost.image}` : null);
    }
  }, [selectedPost]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="min-h-screen mt-10">
      {/* Featured Post */}
      <div className="relative border-b border-gray-800">
        <div className="container mx-auto grid md:grid-cols-2 gap-8 px-4 py-12">
          <div className="relative aspect-square">
            <Image
              src={Image01}
              alt="Featured post geometric pattern"
              className="object-cover rounded-lg"
              width={600}
              height={600}
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="space-y-6">
              <div className="text-gray-400">August 13, 2024</div>
              <h1 className="text-4xl font-bold tracking-tighter">
                CapitalKV Blog Posts
              </h1>
              <p className="text-gray-400 leading-relaxed">
                CapitalKV: Key Digital Tools for Real-World Impact
              </p>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-4 mt-6">
              {user?.is_admin_user && (
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-purple-500 hover:text-purple-600 transition-colors"
                  onClick={openPostForm}
                >
                  Create New Post
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && <p>Loading posts...</p>}
          {isError && <p>Error loading posts.</p>}
          {data?.map((post: Post) => (
            <div
              key={post.id}
              className="bg-gray-900 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handlePostClick(post)}
            >
              <div className="relative w-full h-48">
                {post.image ? (
                  <Image
                    src={`${BASE_URL}/blog/images/${post.image}`}
                    alt={post.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-800 text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="text-gray-400 text-sm mb-2">{post.date}</div>
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-500">{post.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              &times;
            </button>
            <div className="space-y-6">
              {selectedPost.image && (
                <div className="relative w-full h-80">
                  <Image
                    src={`${BASE_URL}/blog/images/${selectedPost.image}`}
                    alt={selectedPost.title}
                    className="object-cover rounded-lg"
                    fill
                    sizes="100vw"
                    priority
                  />
                </div>
              )}
              <h2 className="text-3xl font-bold">{selectedPost.title}</h2>
              <div className="text-gray-400 text-sm">{selectedPost.date}</div>
              <p className="text-gray-300 leading-relaxed">
                {selectedPost.content}
              </p>
              {user?.is_admin_user && (
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => handleDeletePost(selectedPost.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      closeModal();
                      openPostForm();
                      setNewPost({ ...selectedPost, image: null });
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Form Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closePostForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6">
              {newPost.id ? "Edit Post" : "Create New Post"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newPost.title}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block mb-2">Excerpt</label>
                <input
                  type="text"
                  name="excerpt"
                  value={newPost.excerpt}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block mb-2">Content</label>
                <textarea
                  name="content"
                  value={newPost.content}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={6}
                ></textarea>
              </div>
              <div>
                <label className="block mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Image preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitPost}
                  className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
                >
                  {newPost.id ? "Update Post" : "Create Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
