"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Upload,
  Mail,
  Phone,
  Building,
  Globe,
  PlusCircle,
  DollarSign,
  ArrowRightCircle,
  XCircle,
  MinusCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { usePayment } from "@/hooks/use-payment";

const cardStyle = {
  style: {
    base: {
      color: "black",
      fontFamily: '"Poppins", sans-serif',
      fontSize: "14px",
      fontSmoothing: "antialiased",
      border: "1px solid black",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const ProfilePage = () => {
  const router = useRouter();
  const {
    user,
    loading,
    saveAccount,
    error,
    updateProfile,
    getUserDetails,
    updatePassword,
    handleDeposit,
    handleWithdrawMoney,
    getAvatar,
    updateAvatar,
    deleteAvatar,
  } = useUser();

  const { depositAmount: depositAmountHandle } = usePayment();

  const stripe = useStripe();
  const element = useElements();

  const [profile, setProfile] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    company: string;
    phone_number: string;
    website: string;
    address: string;
    profile_picture_url: string;
    bio: string;
    payment_method_id: string;
    avatar?: File;
  }>({
    first_name: "",
    last_name: "",
    email: "",
    company: "",
    phone_number: "",
    website: "",
    address: "",
    profile_picture_url: "",
    bio: "",
    payment_method_id: "",
  });

  useEffect(() => {
    const loadAvatar = async () => {
      const avatarUrl = await getAvatar();
      setProfileImageUrl(avatarUrl);
    };

    if (user) {
      loadAvatar();

      setProfile({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        company: user.company || "",
        phone_number: user.phone_number || "",
        website: user.website || "",
        address: user.address || "",
        profile_picture_url: user.profile_picture_url || "",
        bio: user.bio || "",
        payment_method_id: user.payment_method_id || "",
      });
      setBalance(user.balance || 0);
      setCreditCards(user.creditCards || []);

      if (user.accountDetails) {
        setAccountDetails({
          address: user.accountDetails.address || "",
          iban: user.accountDetails.iban || "",
        });
      }
    }
  }, [user, getAvatar]);

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const [corporations, setCorporations] = useState([
    { id: 1, name: "Corporation A", branding: { includeReports: false } },
    { id: 2, name: "Corporation B", branding: { includeReports: false } },
  ]);

  const [selectedCorporation, setSelectedCorporation] = useState(
    corporations[0]
  );
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSwitchingToCorporation, setIsSwitchingToCorporation] =
    useState(false);

  const handleBrandingToggle = (
    key: keyof typeof selectedCorporation.branding
  ) => {
    setCorporations((prevCorporations) =>
      prevCorporations.map((corporation) =>
        corporation.id === selectedCorporation.id
          ? {
              ...corporation,
              branding: {
                ...corporation.branding,
                [key]: !corporation.branding[key],
              },
            }
          : corporation
      )
    );
    setIsSwitchingToCorporation(!selectedCorporation.branding.includeReports);
    setIsPopupOpen(true);
  };

  const handleConfirmSwitch = () => {
    if (isSwitchingToCorporation) {
      setIsCategoryPopupOpen(true);
    } else {
      setSelectedCorporation({
        ...selectedCorporation,
        branding: { includeReports: false },
      });
      setIsPopupOpen(false);
    }
  };
  const handleCancelSwitch = () => {
    setIsPopupOpen(false);
  };

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
    newsLetters: false,
  });

  const [balance, setBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState<string>();
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [accountDetails, setAccountDetails] = useState({
    address: "",
    iban: "",
  });
  const elements = useElements();
  type CreditCard = {
    cardNumber: string;
    cardholderName: string;
    expiryDate?: string;
    cvv?: string;
    [key: string]: any;
  };
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [newCard, setNewCard] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });
  const toast = useToast();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isAccountDetailsModalOpen, setIsAccountDetailsModalOpen] =
    useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPassword((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength)
      errors.push(`Password must be at least ${minLength} characters long`);
    if (!hasUpperCase)
      errors.push("Password must contain at least one uppercase letter");
    if (!hasLowerCase)
      errors.push("Password must contain at least one lowercase letter");
    if (!hasNumbers) errors.push("Password must contain at least one number");
    if (!hasSpecialChar)
      errors.push("Password must contain at least one special character");

    return errors;
  };

  const handleUpdatePassword = async () => {
    if (password.newPassword !== password.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (!password.currentPassword || !password.newPassword) {
      alert("Please fill in all password fields");
      return;
    }

    const passwordErrors = validatePassword(password.newPassword);
    if (passwordErrors.length > 0) {
      alert(`Password requirements not met:\n${passwordErrors.join("\n")}`);
      return;
    }

    try {
      await updatePassword({
        current_password: password.currentPassword,
        new_password: password.newPassword,
      });
      toast.toast({
        title: "Password Updated Sucessfully",
      });

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.toast({
        title: "Password Update unsuccessful",
        variant: "destructive",
      });
    }
  };

  const handleNotificationToggle = (setting: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      const amount = parseFloat(withdrawAmount ?? "");

      if (isNaN(amount) || amount <= 0) {
        toast.toast({
          title: "Please enter a valid withdrawal amount.",
          variant: "destructive",
        });
      } else if (amount > balance) {
        toast.toast({
          title: "Insufficient balance.",
          variant: "destructive",
        });
      } else {
        const result = await handleWithdrawMoney({ amount });

        if (result.success) {
          toast.toast({
            title: "Transfer successfully.",
          });
          setBalance(balance - amount);
          setWithdrawAmount("");
          setIsWithdrawModalOpen(false);
        }
      }
    } catch (err) {
      console.log("Error Handling Withdraw", err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleAddMoney = async () => {
    setIsDepositing(true);
    try {
      // 1. Get Payment Intent client secret from the backend
      const response = await depositAmountHandle({
        amount: parseFloat(depositAmount) * 100, // Convert to cents
        currency: "eur",
      });
      if (response.success) {
        const clientSecret = response.data.clientSecret;

        // 2. Confirm Payment Intent using Stripe.js
        const cardElement = elements?.getElement(CardNumberElement);
        const { paymentIntent, error } = await (
          stripe as any
        ).confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: newCard.cardholderName,
            },
          },
        });

        if (error) {
          console.error("Payment failed:", error.message);
          toast.toast({
            title: "Payment failed: " + error.message,
            variant: "destructive",
          });
          return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          toast.toast({
            title: "Deposit successfully",
            variant: "default",
          });

          const updatedUser = await handleDeposit({
            amount: depositAmount,
          });

          if (updatedUser.success) {
            setBalance(updatedUser.data.new_balance);
            setIsDepositModalOpen(false); // Close the modal
          } else {
            toast.toast({
              title: updatedUser.message,
              variant: "destructive",
            });
          }
        } else {
          console.warn("Payment processing:", paymentIntent);
        }
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
      alert("Error processing payment.");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleRemoveCard = async (index: number) => {
    const updatedCards = creditCards.filter((_, i) => i !== index);
    const result = await updateProfile({ creditCards: updatedCards });
    if (result.success) {
      setCreditCards(updatedCards);
      // await logActivity("card_removed");
    }
  };

  const handleAccountDetailsSubmit = async () => {
    const result = await saveAccount(accountDetails);
    if (result.success) {
      setIsAccountDetailsModalOpen(false);
      toast.toast({
        title: result.message,
        variant: "default",
      });
      router.refresh();
      // await logActivity("account_details_updated");
    } else {
      toast.toast({
        title: result.message,
        variant: "destructive",
      });
    }
  };
  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append("first_name", profile.first_name);
    formData.append("last_name", profile.last_name);
    formData.append("email", profile.email);
    formData.append("company", profile.company);
    formData.append("phone_number", profile.phone_number);
    formData.append("website", profile.website);
    formData.append("address", profile.address);
    formData.append("bio", profile.bio);

    if (profile.avatar) {
      formData.append("avatar", profile.avatar);
    }

    console.log("testing form data", formData);

    const result = await updateProfile(formData);

    if (result.success) {
      toast.toast({ title: "Profile updated successfully" });
      router.refresh();
    }
  };
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const businessCategories = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Retail",
    "Manufacturing",
    "Services",
    "Other",
  ];

  const handleCategoryConfirm = () => {
    setSelectedCorporation({
      ...selectedCorporation,
      branding: { includeReports: true },
    });
    setIsCategoryPopupOpen(false);
    setIsPopupOpen(false);
  };

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<any | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(e.target.files?.[0]);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadImage = async () => {
    if (profileImage) {
      const formData = new FormData();
      formData.append("avatar", profileImage);

      try {
        const result = await updateProfile(formData);
        if (result.success) {
          toast.toast({ title: "Profile image updated successfully" });
          setProfileImageUrl(null);
          setProfileImage(null);
          router.refresh();
        } else {
          toast.toast({
            title: "Failed to update profile image",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.toast({
          title: "An error occurred while uploading the image",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteImage = async () => {
    if (profileImageUrl) {
      setProfileImageUrl(null);
    } else {
      try {
        const result = await deleteAvatar();
        console.log("Result of delete api", result);
        if (result.success) {
          setProfileImageUrl(null);
          toast.toast({ title: "Profile image deleted successfully" });
          router.refresh();
        } else {
          toast.toast({
            title: "Failed to delete profile image",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        toast.toast({
          title: "An error occurred while deleting the image",
          variant: "destructive",
        });
      }
    }
  };

  const SERVER_URL = process.env.NEXT_PUBLIC_BE_API_BASE_URL;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 space-y-4 sm:space-y-0">
                <Avatar className="w-20 h-20">
                  {profileImageUrl ? (
                    <AvatarImage src={profileImageUrl} />
                  ) : profile.profile_picture_url && !profileImageUrl ? (
                    <AvatarImage
                      src={SERVER_URL + "/" + profile.profile_picture_url}
                    />
                  ) : (
                    <AvatarFallback>{`${profile.first_name?.[0]}${profile.last_name?.[0]}`}</AvatarFallback>
                  )}
                </Avatar>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Change Photo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {profileImage && (
                  <Button variant="secondary" onClick={handleUploadImage}>
                    Upload
                  </Button>
                )}
                {(profileImageUrl || profile?.profile_picture_url) && (
                  <Button variant="destructive" onClick={handleDeleteImage}>
                    Delete
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profile.first_name}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profile.last_name}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <Input
                      id="phone_number"
                      value={profile.phone_number}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={profile.bio}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Account Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedCorporation.branding.includeReports
                        ? "Switch to a personal account."
                        : "Switch to a corporation account."}
                    </p>
                  </div>
                  <Switch
                    checked={selectedCorporation.branding.includeReports}
                    onCheckedChange={() =>
                      handleBrandingToggle("includeReports")
                    }
                  />
                </div>

                {isPopupOpen && (
                  <div className="fixed inset-0 bg-purple-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-gradient-to-br from-purple-500/40 via-black to-purple-600/40 p-6 rounded shadow-lg">
                      <h3 className="text-xl mb-4">
                        {isSwitchingToCorporation
                          ? "Switch to Company Account?"
                          : "Switch to Personal Account?"}
                      </h3>
                      <p>
                        Are you sure you want to{" "}
                        {isSwitchingToCorporation
                          ? "switch to a company account?"
                          : "switch to a personal account?"}
                      </p>
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={handleConfirmSwitch}
                          className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                          Yes
                        </button>
                        <button
                          onClick={handleCancelSwitch}
                          className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isCategoryPopupOpen && (
                  <div className="fixed inset-0 bg-purple-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-gradient-to-br from-purple-500/40 via-black to-purple-600/40 p-6 rounded shadow-lg">
                      <h3 className="text-xl mb-4">Categories</h3>
                      <div className="max-h-60 overflow-y-auto grid grid-cols-2 gap-2 mb-4">
                        {businessCategories.map((category) => (
                          <button
                            key={category}
                            onClick={() => handleCategoryToggle(category)}
                            className={`border p-2 rounded ${
                              selectedCategories.includes(category)
                                ? "bg-blue-500 text-white"
                                : "bg-black-100"
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={handleCategoryConfirm}
                          className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={key} className="text-base">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications about {key.toLowerCase()}
                    </p>
                  </div>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={() =>
                      handleNotificationToggle(
                        key as keyof typeof notifications
                      )
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Change Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    placeholder="Current Password"
                    id="currentPassword"
                    value={password.currentPassword}
                    onChange={handlePasswordChange}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.currentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPasswords.newPassword ? "text" : "password"}
                    placeholder="New Password"
                    id="newPassword"
                    value={password.newPassword}
                    onChange={handlePasswordChange}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.newPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    id="confirmPassword"
                    value={password.confirmPassword}
                    onChange={handlePasswordChange}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.confirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Password must:</p>
                  <ul className="list-disc pl-5">
                    <li>Be at least 8 characters long</li>
                    <li>Contain at least one uppercase letter</li>
                    <li>Contain at least one lowercase letter</li>
                    <li>Contain at least one number</li>
                    <li>Contain at least one special character</li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleUpdatePassword}>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500">
                    Balance: €{balance.toFixed(2)}
                  </p>
                  <Button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="bg-red-500 text-white"
                  >
                    <DollarSign className="w-4 h-4" /> Withdraw Money
                  </Button>
                </div>

                <div className="flex justify-between space-x-4">
                  <Button
                    onClick={() => setIsDepositModalOpen(true)}
                    className="bg-green-500 text-white w-full"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Money
                  </Button>
                  <Button
                    onClick={() => setIsAccountDetailsModalOpen(true)}
                    className="bg-blue-500 text-white w-full"
                  >
                    <CreditCard className="w-4 h-4 mr-2" /> Add Account Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Modal for Withdraw */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-black">Withdraw Funds</h3>
            {!profile.payment_method_id && (
              <div className="p-3 bg-red-300">
                <Label htmlFor="deposit-amount">
                  Please Attact your account by clicking add account detail to
                  proceed withdraw
                </Label>
              </div>
            )}
            <div className="mt-4 text-black">
              <Label htmlFor="withdraw-amount">Amount to Withdraw (€)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-2 text-black"
              />
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="bg-gray-500 text-white"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                // disabled={isWithdrawing || !user.payment_method_id}
                className="bg-green-500 text-white"
              >
                <ArrowRightCircle className="w-4 h-4 mr-2" />
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal for Deposit */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-black">Add Money</h3>
            <div className="mt-4 text-black">
              <Label htmlFor="deposit-amount">Amount to Deposit (€)</Label>
              <Input
                id="deposit-amount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-2"
              />

              <div className="space-y-4 mt-6">
                <h4 className="text-sm font-medium text-black">
                  Credit Card Information
                </h4>
                <div className="space-y-2 text-black">
                  <Label htmlFor="cardNumber">Card Number</Label>

                  <CardNumberElement options={cardStyle} />
                  {/* <Input
                    id="cardNumber"
                    value={newCard.cardNumber}
                    onChange={(e) =>
                      setNewCard({ ...newCard, cardNumber: e.target.value })
                    }
                    placeholder="Enter card number"
                  /> */}
                </div>

                <div className="space-y-2 text-black">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={newCard.cardholderName}
                    onChange={(e) =>
                      setNewCard({ ...newCard, cardholderName: e.target.value })
                    }
                    placeholder="Enter cardholder name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-black">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <CardExpiryElement options={cardStyle} />
                  </div>
                  <div className="space-y-2 text-black">
                    <Label htmlFor="cvv">CVV</Label>
                    <CardCvcElement options={cardStyle} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDepositModalOpen(false)}
                className="bg-gray-500 text-white"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleAddMoney}
                disabled={isDepositing}
                className="bg-green-500 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Money
              </Button>
            </div>

            {/* Display previously added cards */}
            <div className="mt-6 space-y-4">
              {creditCards.map((card, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <div>
                    <p className="text-sm">
                      **** **** **** {card?.cardNumber?.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {card?.cardholderName}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRemoveCard(index)}
                    className="text-red-500"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal for Account Details */}
      {isAccountDetailsModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-black">
              Enter Account Details
            </h3>
            <div className="mt-4 text-black">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={accountDetails.address}
                onChange={(e) =>
                  setAccountDetails({
                    ...accountDetails,
                    address: e.target.value,
                  })
                }
                placeholder="Enter your address"
                className="mt-2"
              />
              <Label htmlFor="iban" className="mt-4 text-black">
                IBAN
              </Label>
              <Input
                id="iban"
                type="text"
                value={accountDetails.iban}
                onChange={(e) =>
                  setAccountDetails({ ...accountDetails, iban: e.target.value })
                }
                placeholder="Enter your IBAN"
                className="mt-2"
              />
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsAccountDetailsModalOpen(false)}
                className="bg-gray-500 text-white"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleAccountDetailsSubmit}
                className="bg-purple-500 text-white"
              >
                <ArrowRightCircle className="w-5 h-5 mr-2" />
                Save Account Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
