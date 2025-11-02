import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Level3Page = () => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [showVulnerability, setShowVulnerability] = useState(false);
  const [searchParams] = useSearchParams();
  const [showHint1, setShowHint1] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
  const [showHint3, setShowHint3] = useState(false);

  useEffect(() => {
    // Define the revealFlag function globally
    (window as any).revealFlag = () => {
      const banner = document.createElement('div');
      banner.style.cssText = "position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;background:#16a34a;color:white;padding:12px 20px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-weight:600;border:1px solid #22c55e;";
      banner.innerHTML = `<strong>Congratulations!</strong> You found the flag: <code class="bg-black/20 px-2 py-1 rounded">FLAG-LEVEL3-SECRET</code>`;
      document.body.appendChild(banner);
      setTimeout(() => {
        banner.remove();
        setShowVulnerability(true);
      }, 4000);
    };

    // Load saved profile
    const saved = localStorage.getItem('profileUrl');
    if (saved) setSavedUrl(saved);

    // Process URL parameters - INTENTIONALLY VULNERABLE
    const config = searchParams.get('config');
    if (config) {
      const tempDiv = document.createElement('div');
      tempDiv.style.display = 'none';
      tempDiv.innerHTML = config; // INTENTIONALLY VULNERABLE
      document.body.appendChild(tempDiv);
    }

    return () => {
      delete (window as any).revealFlag;
    };
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem('profileUrl', websiteUrl);
    setSavedUrl(websiteUrl);
    showNotification('Profile saved!');
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.href = window.location.pathname;
  };

  const showNotification = (message: string) => {
    const notif = document.createElement('div');
    notif.style.cssText = "position:fixed; top:16px; right:16px; background:#2563eb; color:white; padding:12px 20px; border-radius:8px; z-index:9999; transition: transform 0.3s ease;";
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => {
      notif.style.transform = 'translateX(200%)';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  };

  return (
    <div className="min-h-screen text-foreground">
      <nav className="bg-black/20 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              ← Back to Lab
            </Link>
            <div className="text-sm text-muted-foreground">Exercise 3: Chained XSS</div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        <div className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-2 text-center">Chained XSS Exercise</h1>
          <p className="text-muted-foreground mb-6 text-center">
            Update your profile. Your website URL is stored and also reflected in a configuration script if passed as a URL parameter.
          </p>

          <div className="mb-6 space-y-3">
            <button
              type="button"
              className="text-left w-full p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/40"
              onClick={() => setShowHint1((v) => !v)}
            >
              <span className="font-semibold text-orange-300">Show Hint 1</span>
            </button>
            {showHint1 && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border text-muted-foreground">
                Map where you can input data (the profile form) and where that data is used
                (the profile link and the page's script logic).
              </div>
            )}

            <button
              type="button"
              className="text-left w-full p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/40"
              onClick={() => setShowHint2((v) => !v)}
            >
              <span className="font-semibold text-orange-300">Show Hint 2</span>
            </button>
            {showHint2 && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border text-muted-foreground">
                This page processes a URL parameter named <code className="bg-background px-1 py-0.5 rounded">config</code>
                and inserts it directly into the DOM.
              </div>
            )}

            <button
              type="button"
              className="text-left w-full p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/40"
              onClick={() => setShowHint3((v) => !v)}
            >
              <span className="font-semibold text-orange-300">Show Hint 3</span>
            </button>
            {showHint3 && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border text-muted-foreground">
                Save your Website URL to point back to this page including a malicious
                <code className="bg-background px-1 py-0.5 rounded">config</code> parameter that triggers
                <code className="bg-background px-1 py-0.5 rounded">window.revealFlag()</code>.
              </div>
            )}

            {showHint3 && (
              <div className="mt-3 bg-background/40 p-4 rounded-lg border border-dashed">
                <p className="font-semibold mb-2">Solution</p>
                <p className="text-muted-foreground mb-2">Save your Website URL as this page's URL with:</p>
                <code className="bg-background px-2 py-1 rounded break-all">?config=&lt;img src=x onerror="window.revealFlag()"&gt;</code>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <Label htmlFor="website-url">Your Website URL</Label>
              <Input
                type="text"
                id="website-url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="mt-1"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                Save Profile
              </Button>
              <Button 
                type="button" 
                onClick={handleReset} 
                variant="secondary"
                className="w-full"
              >
                Clear Storage & Reload
              </Button>
            </div>
          </form>

          <h2 className="text-xl font-semibold mb-4">Your Current Profile</h2>
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            {savedUrl ? (
              <p className="text-muted-foreground">
                Website:{" "}
                <a 
                  href={savedUrl} 
                  className="text-orange-400 hover:underline"
                >
                  {savedUrl}
                </a>
              </p>
            ) : (
              <p className="text-muted-foreground">No website set.</p>
            )}
          </div>
        </div>

        {showVulnerability && (
          <div className="mt-8 bg-success/20 border border-success rounded-xl p-6">
            <h3 className="text-xl font-bold text-success-foreground mb-2">Vulnerability Chain Found!</h3>
            <p className="text-success-foreground">
              You successfully performed a **Chained XSS** attack. You used a **Stored XSS** vulnerability to save a 
              malicious link. When clicked, that link exploited a separate **Reflected XSS** vulnerability by passing a 
              payload in the `config` URL parameter. Great work!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Level3Page;
