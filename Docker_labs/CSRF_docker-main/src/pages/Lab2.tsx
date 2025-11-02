import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, RefreshCw, CheckCircle2, Lightbulb, Clock, Code } from "lucide-react";
import { Link } from "react-router-dom";

interface SessionData {
  username: string;
  sessionToken: string;
  expiresAt: number;
}

const Lab2 = () => {
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [userInput, setUserInput] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [maliciousCode, setMaliciousCode] = useState("");

  const hints = [
    "Session tokens are commonly stored in browser cookies for persistent authentication.",
    "You can access all cookies using JavaScript's document.cookie property in the console or exploit area.",
    "There are multiple cookies stored - you need to identify which one contains the real session token. Look for suspicious cookie names.",
    "Look for a cookie named 'auth_session' - it contains encoded data that might be the token.",
    "The token is base64 encoded for 'security'. Use atob() to decode it and reveal the actual session token."
  ];

  const generateSession = () => {
    const username = `user_${Math.floor(Math.random() * 1000)}`;
    const sessionToken = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

    const session = { username, sessionToken, expiresAt };
    setSessionData(session);
    setUserInput("");
    setHintsUsed(0);
    setIsCompleted(false);

    // Encode the token in base64 to make it harder
    const encodedToken = btoa(sessionToken);
    
    // Clear all existing cookies first
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
    
    // Store real cookie with less obvious name and add many decoy cookies
    document.cookie = `auth_session=${encodedToken};max-age=1800`;
    
    // Add multiple decoy cookies to make it harder
    document.cookie = `user_prefs=theme_dark;max-age=1800`;
    document.cookie = `session_id=${btoa('fake_session_' + Math.random())};max-age=1800`;
    document.cookie = `user_token=${btoa('decoy_token_' + Math.random())};max-age=1800`;
    document.cookie = `auth_state=${btoa('logged_in')};max-age=1800`;
    document.cookie = `csrf_token=${btoa('csrf_' + Math.random())};max-age=1800`;
    document.cookie = `tracking_id=track_${Math.random().toString(36).substring(7)};max-age=1800`;
    document.cookie = `preferences=${btoa(JSON.stringify({ theme: 'dark', lang: 'en' }))};max-age=1800`;
    
    toast({
      title: "New Session Generated",
      description: `Username: ${username}`,
    });
  };

  useEffect(() => {
    generateSession();
  }, []);

  useEffect(() => {
    if (!sessionData) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, sessionData.expiresAt - Date.now());
      setTimeLeft(remaining);

      if (remaining === 0) {
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "The session token has expired. Reset to generate a new one.",
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData]);

  const handleReset = () => {
    generateSession();
    toast({
      title: "Lab Reset",
      description: "New session token generated",
    });
  };

  const handleNextHint = () => {
    if (hintsUsed < hints.length) {
      setHintsUsed(hintsUsed + 1);
    }
  };

  const handleSubmit = () => {
    if (userInput === sessionData?.sessionToken) {
      setIsCompleted(true);
      toast({
        title: "Success!",
        description: "You've successfully extracted the session token!",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect",
        description: "The token doesn't match. Try again!",
      });
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Labs
          </Button>
        </Link>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  User Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span className="font-mono text-xs">{sessionData?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="bg-success/10 text-success">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  Token Timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-mono font-bold ${timeLeft < 60000 ? 'text-danger' : 'text-primary'}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Time until expiration</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Objective</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Extract the session token stored in the browser cookies before it expires.
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  Hints ({hintsUsed}/{hints.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hints.slice(0, hintsUsed).map((hint, index) => (
                  <div key={index} className="text-xs text-muted-foreground p-2 bg-secondary rounded">
                    {index + 1}. {hint}
                  </div>
                ))}
                {hintsUsed < hints.length && (
                  <Button
                    onClick={handleNextHint}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Next Hint
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Lab 2: Session Token Hijacking</CardTitle>
                  <Button onClick={handleReset} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Exploit Area
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary p-4 rounded-lg font-mono text-sm">
                  <p className="text-muted-foreground mb-2"># Simulated User Session</p>
                  <p className="text-primary">User: {sessionData?.username}</p>
                  <p className="text-muted-foreground text-xs mt-2">
                    Session established at {new Date(sessionData?.expiresAt! - 30 * 60 * 1000).toLocaleTimeString()}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Expires at {new Date(sessionData?.expiresAt!).toLocaleTimeString()}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Write Your Malicious Code</label>
                  <Textarea
                    placeholder="// Write your exploit code here&#10;// Example: document.cookie, console.log(), etc."
                    value={maliciousCode}
                    onChange={(e) => setMaliciousCode(e.target.value)}
                    className="font-mono text-xs min-h-[150px] bg-background/50"
                  />
                  <Button
                    onClick={() => {
                      try {
                        eval(maliciousCode);
                        toast({
                          title: "Code Executed",
                          description: "Check console for results",
                        });
                      } catch (error) {
                        toast({
                          variant: "destructive",
                          title: "Execution Error",
                          description: error instanceof Error ? error.message : "Invalid code",
                        });
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    disabled={!maliciousCode}
                  >
                    Execute Code
                  </Button>
                </div>
                
                <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg">
                  <p className="text-xs text-warning font-medium mb-1">💡 Hint:</p>
                  <p className="text-xs text-muted-foreground">
                    Check the Application/Cookies tab in DevTools or use <code className="bg-secondary px-1 py-0.5 rounded">document.cookie</code> to access stored cookies
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hintsUsed < hints.length && (
                  <div className="text-sm text-warning p-4 bg-warning/10 rounded-lg mb-4">
                    💡 Use all hints to unlock the solution code
                  </div>
                )}
                
                {hintsUsed >= hints.length && (
                  <div className="space-y-3 mb-4">
                    <label className="text-sm font-medium block">Solution Code (Copy & Paste to Exploit Area)</label>
                    <div className="bg-secondary p-4 rounded-lg font-mono text-xs overflow-x-auto">
                      <pre className="text-primary">{`// Step 1: Access browser cookies
const cookies = document.cookie;
console.log('All Cookies:', cookies);

// Step 2: Find and extract the auth_session cookie
const authMatch = cookies.match(/auth_session=([^;]+)/);
const encodedToken = authMatch ? authMatch[1] : null;

// Step 3: Decode the base64 encoded token
const sessionToken = atob(encodedToken);
console.log('Decoded Session Token:', sessionToken);`}</pre>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      💡 Copy this code, paste it in the "Exploit Area" textarea above, and click "Execute Code"
                    </p>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Session Token</label>
                  <Input
                    type="text"
                    placeholder="Enter extracted session token"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isCompleted || timeLeft === 0}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Completed!
                    </>
                  ) : (
                    "Submit Solution"
                  )}
                </Button>
              </CardContent>
            </Card>

            {isCompleted && (
              <Card className="border-success bg-success/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                    <div>
                      <h3 className="font-bold text-lg text-success">Lab Completed!</h3>
                      <p className="text-sm text-muted-foreground">
                        You've successfully extracted the session token. Excellent work!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lab2;
