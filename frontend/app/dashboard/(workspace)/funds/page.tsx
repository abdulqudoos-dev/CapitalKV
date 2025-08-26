"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image"; // Correct import for Image from Next.js
import api, { BASE_URL } from "@/utils/api";
import { useBusinesses } from "@/api/bussiness_api";
import { useUser } from "@/hooks/use-user";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Define types for Project and Business
interface Project {
  title: string;
  description: string;
  requiredInvestment: number;
}

interface Business {
  id: string;
  title: string;
  description: string;
  price: number;
  roi: number;
  fundSize: number;
  visits: number;
  status: string;
  interests: number;
  logo?: string; // Added logo URL to Business type
}

export default function ThreeTabPage() {
  const [activeTab, setActiveTab] = useState("funds");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    price: "",
    roi: "",
    fundSize: "",
    status: "OPEN",
    logo: null as File | null, // Store file object for logo
  });
  const { data, mutate } = useBusinesses();
  const [currentBussiness, setCurrentBussiness] = useState<any>({});
  const [isUpdating, setisUpdating] = useState<any>([]);
  const { user } = useUser();
  const toast = useToast();
  const handleAddPost = () => {
    const formData = new FormData();
    if (
      !newPost.title ||
      !newPost.price ||
      !newPost.description ||
      !newPost.roi
    ) {
      toast.toast({
        title: "Please fill the form to proceed",
      });
    }
    formData.append("title", newPost.title);
    formData.append("description", newPost.description);
    formData.append("price", newPost.price);
    formData.append("fundSize", newPost.fundSize);
    formData.append("roi", newPost.roi);
    formData.append("status", newPost.status);
    if (newPost.logo) {
      formData.append("logo", newPost.logo);
    }

    if (currentBussiness?.id) {
      api
        .put(`/users/me/business/${currentBussiness.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          mutate();
          setNewPost({
            title: "",
            description: "",
            price: "",
            roi: "",
            fundSize: "",
            status: "OPEN",
            logo: null,
          });
          setCurrentBussiness({});
          setIsDialogOpen(false);
        });
    } else {
      api
        .post("/users/me/business", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          console.log(response);
          mutate();
          setNewPost({
            title: "",
            description: "",
            price: "",
            roi: "",
            status: "OPEN",
            fundSize: "",
            logo: null,
          });
          setCurrentBussiness({});
          setIsDialogOpen(false);
        });
    }
  };

  const handleDelete = (id: string) => {
    api.delete(`/users/me/business/${id}`).then(() => {
      mutate();
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPost({
        ...newPost,
        logo: e.target.files[0], // Store the file
      });
    }
  };

  const handlePayment = (businessId: string) => {
    api.post(`/payments`, { businessId }).then((response) => {
      alert("Payment successful: " + response.data.message);
    });
  };

  useEffect(() => {
    if (currentBussiness) {
      const data: any = { ...currentBussiness };
      delete data?.logo;
      setNewPost(data);
    }
  }, [currentBussiness]);

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex justify-start gap-4 overflow-x-auto">
          <TabsTrigger value="funds" className="min-w-[120px]">
            Funds
          </TabsTrigger>
          {user?.is_admin_user && (
            <TabsTrigger value="manage-post" className="min-w-[120px]">
              Manage posts
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="funds">
          <div className="p-4">
            <h2 className="text-xl font-bold">Projects Needing Investment</h2>
            <div className="mt-4 space-y-4 overflow-auto">
              {data?.length > 0 ? (
                data?.map((project: Business, index: number) => (
                  <div key={index} className="border p-4 rounded">
                    {project.logo && (
                      <Image
                        src={BASE_URL + "/" + project.logo}
                        alt={project.title}
                        width={50}
                        height={50}
                        className="mb-4"
                      />
                    )}
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <Badge
                        variant={project.status ? "default" : "destructive"}
                        className="text-white rounded-full"
                        style={{
                          backgroundColor:
                            project.status == "OPEN" ? "green" : "red",
                        }}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <p>{project.description}</p>
                    <p className="">Fund Size: {project?.fundSize}</p>
                    <p className="">ROI: {project?.roi}%</p>
                    <p className="font-bold">
                      Required Investment: ${project?.price}
                    </p>
                    <Button className="mt-2 w-30">Contact us</Button>
                  </div>
                ))
              ) : (
                <p>No projects needing investment at the moment.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="businesses-for-sale">
          <div className="p-4">
            <h2 className="text-xl font-bold">Listed Funds</h2>
            <div className="mt-4 space-y-4 overflow-auto">
              {data?.length > 0 ? (
                data?.map((business: Business, index: number) => (
                  <div key={index} className="border p-4 rounded">
                    {business.logo && (
                      <Image
                        src={BASE_URL + "/" + business.logo}
                        alt={business.title}
                        width={50}
                        height={50}
                        className="mb-4"
                      />
                    )}
                    <h3 className="text-lg font-semibold">{business.title}</h3>
                    <p>{business.description}</p>
                    <p className="font-bold">Price: ${business.price}</p>
                    <Button
                      onClick={() => handlePayment(business.id)}
                      className="mt-2 w-full"
                    >
                      Make Payment
                    </Button>
                  </div>
                ))
              ) : (
                <p>No Funds listed yet.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manage-post">
          <div className="p-4">
            <h2 className="text-xl font-bold">Manage Posts</h2>
            <p className="mt-2">Add, close or edit Funds.</p>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setCurrentBussiness({});
                setIsDialogOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button className="mt-4 w-full sm:w-auto">
                  Publish New Fund
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Post a New Business for Sale</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      placeholder="Enter business title"
                      value={newPost.title}
                      onChange={(e) =>
                        setNewPost({ ...newPost, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      placeholder="Enter description"
                      value={newPost.description}
                      onChange={(e) =>
                        setNewPost({ ...newPost, description: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Minimum Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter Min Amount"
                      value={newPost.price}
                      onChange={(e) =>
                        setNewPost({ ...newPost, price: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>ROI</Label>
                    <Input
                      type="number"
                      placeholder="Enter ROI %"
                      value={newPost.roi}
                      min={1}
                      max={100}
                      onChange={(e) =>
                        setNewPost({ ...newPost, roi: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Fund Size</Label>
                    <Input
                      type="number"
                      placeholder="Enter fund size"
                      value={newPost.fundSize}
                      onChange={(e) =>
                        setNewPost({ ...newPost, fundSize: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Status</Label>

                    <Select
                      defaultValue="OPEN"
                      value={newPost.status}
                      onValueChange={(value) => {
                        setNewPost({ ...newPost, status: value });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="OPEN">Opened</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Upload Logo</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    {newPost.logo && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Logo selected: {newPost.logo.name}
                      </p>
                    )}
                  </div>
                </div>
                <Button onClick={handleAddPost} className="w-full sm:w-auto">
                  Add Funds
                </Button>
              </DialogContent>
            </Dialog>

            <div className="mt-4">
              <h3 className="text-lg font-bold">Published Funds</h3>
              <div className="mt-2 space-y-4 overflow-auto">
                {data?.length > 0 ? (
                  data?.map((business: Business, index: number) => (
                    <div key={index} className="border p-4 rounded">
                      {business.logo && (
                        <Image
                          src={BASE_URL + "/" + business.logo}
                          alt={business.title}
                          width={50}
                          height={50}
                          className="mb-4"
                        />
                      )}
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold">
                          {business.title}
                        </h3>
                        <Badge
                          variant={business.status ? "default" : "destructive"}
                          className="text-white rounded-full"
                          style={{
                            backgroundColor:
                              business.status == "OPEN" ? "green" : "red",
                          }}
                        >
                          {business.status}
                        </Badge>
                      </div>
                      <p>{business.description}</p>
                      <p className="">Fund Size: {business.fundSize}</p>
                      <p className="">ROI: {business?.roi}%</p>
                      <p className="font-bold">Min Amount: ${business.price}</p>
                      <div className="flex gap-5 mt-2">
                        <Button
                          onClick={() => {
                            setCurrentBussiness(business);
                            setIsDialogOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="mr-2"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>

                        <Button
                          onClick={() => handleDelete(business.id)}
                          variant="outline"
                          size="sm"
                          className="mr-2"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No businesses listed yet.</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
