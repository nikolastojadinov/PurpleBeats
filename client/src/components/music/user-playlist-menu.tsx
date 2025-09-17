import React, { useState } from "react";
import { MoreVertical, ImagePlus, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectUploader } from "@/components/object-uploader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Playlist } from "@shared/schema";

interface UserPlaylistMenuProps {
  playlist: Playlist;
  isUserCreated: boolean;
}

export default function UserPlaylistMenu({ playlist, isUserCreated }: UserPlaylistMenuProps) {
  const [, setLocation] = useLocation();
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newName, setNewName] = useState(playlist.name);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePlaylistMutation = useMutation({
    mutationFn: async (updates: { name?: string; imageUrl?: string }) => {
      return apiRequest("PUT", `/api/playlists/${playlist.id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists", playlist.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({
        title: "Success",
        description: "Playlist updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update playlist",
        variant: "destructive",
      });
    },
  });

  const handleChangeName = () => {
    if (newName.trim() && newName !== playlist.name) {
      updatePlaylistMutation.mutate({ name: newName.trim() });
    }
    setIsNameDialogOpen(false);
  };

  const handleImageUpload = (uploadURL: string) => {
    // Just pass the upload URL directly - server will handle normalization
    updatePlaylistMutation.mutate({ imageUrl: uploadURL });
  };

  const handleAddSong = () => {
    setLocation(`/search?playlist=${playlist.id}`);
  };

  // Only show menu for user-created playlists
  if (!isUserCreated) {
    return null; // Hide completely for non-user playlists
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-2" data-testid="button-more-playlist">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-1">
            <ObjectUploader
              onComplete={handleImageUpload}
              maxFileSize={5242880} // 5MB
              buttonClassName="w-full justify-start p-2 h-auto text-sm font-normal hover:bg-accent hover:text-accent-foreground"
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Add picture
            </ObjectUploader>
          </div>
          <DropdownMenuItem onClick={() => setIsNameDialogOpen(true)} data-testid="menu-change-name">
            <Edit className="h-4 w-4 mr-2" />
            Change name
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddSong} data-testid="menu-add-song">
            <Plus className="h-4 w-4 mr-2" />
            Add song
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Change Name Dialog */}
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-change-name">
          <DialogHeader>
            <DialogTitle>Change playlist name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="playlist-name">Playlist name</Label>
              <Input
                id="playlist-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter playlist name"
                data-testid="input-playlist-name"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsNameDialogOpen(false)}
                data-testid="button-cancel-name"
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangeName}
                disabled={!newName.trim() || newName === playlist.name || updatePlaylistMutation.isPending}
                data-testid="button-save-name"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}