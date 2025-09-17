import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Save, Camera } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Membership } from "@shared/schema";
import { ObjectUploader } from "@/components/object-uploader";

const editProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

interface UserProfile {
  id: string;
  name: string;
  imageUrl?: string;
  nickname?: string;
}

export default function EditProfilePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, userId, isAuthenticated } = useAuth();

  // Fetch current user data
  const { data: membership } = useQuery<Membership>({
    queryKey: ['/api/membership', userId],
    enabled: isAuthenticated,
  });

  const { data: userProfile, isLoading } = useQuery<UserProfile>({
    queryKey: ['/api/profile', userId],
    enabled: isAuthenticated,
  });

  const form = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: userProfile?.name || "",
    },
  });

  // Update form when user data loads
  useState(() => {
    if (userProfile) {
      form.setValue("name", userProfile.name);
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: EditProfileForm) => {
      return await apiRequest("PUT", `/api/profile/${userId}`, {
        name: data.name,
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile', userId] });
      setLocation("/profile");
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarURL: string) => {
      return await apiRequest("PUT", `/api/profile/${userId}/avatar`, {
        avatarURL,
      });
    },
    onSuccess: () => {
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile', userId] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to update your profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleAvatarUploadComplete = (uploadURL: string) => {
    updateAvatarMutation.mutate(uploadURL);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-background min-h-screen p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen pb-44">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation("/profile")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">Edit Profile</h1>
        <div className="w-10" />
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userProfile?.imageUrl || ''} />
                <AvatarFallback className="bg-primary/20 text-lg">
                  {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <ObjectUploader
                maxFileSize={5242880} // 5MB
                onComplete={handleAvatarUploadComplete}
                buttonClassName="absolute -bottom-1 -right-1 bg-primary hover:bg-primary/90 rounded-full p-2 border-2 border-background"
              >
                <Camera className="h-4 w-4" />
              </ObjectUploader>
            </div>
            
            {updateAvatarMutation.isPending && (
              <p className="text-sm text-muted-foreground text-center">
                Uploading profile picture...
              </p>
            )}
            {!updateAvatarMutation.isPending && (
              <p className="text-sm text-muted-foreground text-center">
                Click the camera icon to upload a new profile picture
              </p>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your display name" 
                          data-testid="input-name"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/profile")}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{userId}</p>
            </div>
            
            {membership && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Membership</label>
                <p className="text-sm">
                  {membership.isPremium ? (
                    <span className="text-amber-600 font-medium">Premium Member</span>
                  ) : (
                    <span className="text-muted-foreground">Free User</span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}