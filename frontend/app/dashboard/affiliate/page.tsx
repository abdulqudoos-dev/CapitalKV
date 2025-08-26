"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCopy,
  Users,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@/hooks/use-user";
import { Familjen_Grotesk } from "next/font/google";
import api from "@/utils/api";
import { isAxiosError } from "axios";

export default function Affiliate() {
  const { user } = useUser();

  const [showLinks, setShowLinks] = useState(false);
  const [affiliateLinks, setAffiliateLinks] = useState<any[]>([]);
  const [affiliateLinksLoading, setAffiliateLinksLoading] =
    useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<any[]>([]);
  const [reload, setReload] = useState(false);
  const { toast } = useToast();
  const inviteLink = `https://capitalkv.com/affiliate/${user?.id}/${user?.username}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Invite Link Copied",
      description: "The invite link has been copied to your clipboard.",
    });
  };

  const handleEdit = async (id: string, newName: string, newLink: string) => {
    try {
      console.log("id:",id)
      setIsUpdating([...isUpdating, id]);
      const response = await api.put(`/users/me/affiliate-links/${id}`, {
        name: newName,
        affiliate_link: newLink,
      });
      if (response.status == 200) {
        toast({
          title: "Link Updated",
          description: "The affiliate link has been updated successfully.",
        });
        setReload(!reload)
      }
    } catch (err) {
      console.log(err);
      if (isAxiosError(err)) {
        toast({
          title: "Failed to Link update",
          description: err?.response?.data?.detail,
          variant: "destructive",
        });
      }
    } finally {
      setIsUpdating(isUpdating?.filter((cid) => cid !== id));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting([...isDeleting, id]);

      const response = await api.delete(`/users/me/affiliate-links/${id}`);
      if (response.status===200) {

        toast({
          title: "Link Deleted",
          description: "The affiliate link has been deleted successfully.",
        });
        setReload(!reload)
      }

    } catch (err) {
      console.log(err);
      if (isAxiosError(err)) {
        toast({
          title: "Failed to delete Link ",
          description: err?.response?.data?.detail,
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(isDeleting?.filter((cid) => cid !== id));
    }
  };

  const fetchAffliate = async () => {
    setAffiliateLinksLoading(true);
    try {
      const response = await api.get("/users/me/affiliate-links");
      if (response.status === 200) {
        setAffiliateLinks(response.data);
      }
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setAffiliateLinksLoading(false);
    }
  };

  useEffect(() => {
    fetchAffliate();
  }, [reload]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Affiliate Program</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Invite Friends
            </CardTitle>
          </CardHeader>
          <CardContent>
            Earn rewards by inviting your friends to join our platform.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Earn Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            Get 10% commission on all purchases made by your referrals.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Grow Together
            </CardTitle>
          </CardHeader>
          <CardContent>
            As your network grows, so do your rewards and opportunities.
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Invite People</CardTitle>
          <CardDescription>
            Share your unique invite link to start earning rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={inviteLink} readOnly className="flex-grow" />
            <Button onClick={copyInviteLink}>
              <ClipboardCopy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Share your unique invite link with friends and colleagues</li>
            <li>
              When they sign up using your link, they're added to your network
            </li>
            <li>Earn commission on their purchases and activities</li>
            <li>Withdraw your earnings or use them on our platform</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function EditLinkForm({ link, onSave, isLoading }: any) {
  const [name, setName] = useState(link.name);
  const [url, setUrl] = useState(link.affiliate_link);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave(link.id, name, url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700"
        >
          URL
        </label>
        <Input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "processing..." : "Save Changes"}
      </Button>
    </form>
  );
}
