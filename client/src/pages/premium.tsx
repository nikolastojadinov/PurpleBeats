import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import Header from "@/components/layout/header";
import PiPayment from "@/components/pi/pi-payment";
import MembershipStatus from "@/components/membership/membership-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Music, Sparkles, Users, Zap, Shield } from "lucide-react";
import { type Membership } from "@shared/schema";

export default function Premium() {
  const [showPayment, setShowPayment] = useState(false);
  const { userId, isAuthenticated } = useAuth();

  const { data: membership } = useQuery<Membership>({
    queryKey: ['/api/membership', userId],
    enabled: isAuthenticated,
  });

  const isPremium = membership?.isPremium && membership.expiresAt && new Date(membership.expiresAt) > new Date();

  const handlePaymentSuccess = () => {
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen">
      <Header showSearch={false} />
      
      <main className="px-4 pb-44">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PurpleBeats Premium
            </span>
          </h1>
          <p className="text-muted-foreground">
            Unlock the ultimate music experience
          </p>
        </div>

        {/* Current Membership Status */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Your Membership</h2>
          {isAuthenticated ? (
            <MembershipStatus userId={userId} />
          ) : (
            <div className="p-4 bg-muted/20 rounded-lg text-center">
              <p className="text-muted-foreground">Please log in with Pi Network to view your membership status</p>
            </div>
          )}
        </div>

        {/* Premium Features */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Premium Features</h2>
          <div className="grid grid-cols-1 gap-4">
            <Card className={`transition-colors ${isPremium ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Unlimited Streaming</h3>
                    <p className="text-sm text-muted-foreground">Listen to millions of songs without limits</p>
                  </div>
                  {isPremium && <Badge className="bg-green-500">Active</Badge>}
                </div>
              </CardContent>
            </Card>


            <Card className={`transition-colors ${isPremium ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Ad-Free Experience</h3>
                    <p className="text-sm text-muted-foreground">Enjoy uninterrupted music without any ads</p>
                  </div>
                  {isPremium && <Badge className="bg-green-500">Active</Badge>}
                </div>
              </CardContent>
            </Card>

            <Card className={`transition-colors ${isPremium ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Zap className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">High Quality Audio</h3>
                    <p className="text-sm text-muted-foreground">Stream in lossless quality up to 320kbps</p>
                  </div>
                  {isPremium && <Badge className="bg-green-500">Active</Badge>}
                </div>
              </CardContent>
            </Card>

            <Card className={`transition-colors ${isPremium ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Exclusive Content</h3>
                    <p className="text-sm text-muted-foreground">Access to premium-only playlists and releases</p>
                  </div>
                  {isPremium && <Badge className="bg-green-500">Active</Badge>}
                </div>
              </CardContent>
            </Card>

            <Card className={`transition-colors ${isPremium ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Priority Support</h3>
                    <p className="text-sm text-muted-foreground">Get faster response times for any issues</p>
                  </div>
                  {isPremium && <Badge className="bg-green-500">Active</Badge>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Purchase Section */}
        {!isPremium && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Get Premium</h2>
            
            {!showPayment ? (
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Ready to upgrade?</CardTitle>
                  <CardDescription>
                    Join thousands of music lovers enjoying premium features
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-accent mb-2">3.14π</div>
                    <div className="text-sm text-muted-foreground">One-time payment for 1 month</div>
                  </div>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setShowPayment(true)}
                      className="w-full music-gradient text-white font-semibold"
                      data-testid="button-upgrade-premium"
                    >
                      Upgrade to Premium
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Complete Your Purchase</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowPayment(false)}
                    data-testid="button-cancel-payment"
                  >
                    Cancel
                  </Button>
                </div>
                <PiPayment 
                  userId={userId} 
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </div>
            )}
          </div>
        )}

        {/* Premium Badge */}
        {isPremium && (
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary to-accent text-white">
              <CardContent className="p-6">
                <Crown className="h-8 w-8 mx-auto mb-2" />
                <h3 className="text-xl font-bold mb-1">You're Premium!</h3>
                <p className="text-white/80">
                  Thank you for supporting PurpleBeats
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}