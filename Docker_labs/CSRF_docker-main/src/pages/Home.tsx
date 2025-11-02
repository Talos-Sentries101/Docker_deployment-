import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Key } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CSRF Security Lab
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Master Cross-Site Request Forgery attacks through hands-on exercises
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Lock className="w-8 h-8 text-primary" />
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  Level 1
                </Badge>
              </div>
              <CardTitle className="text-2xl">Credential Extraction</CardTitle>
              <CardDescription className="text-base">
                Learn to exploit CSRF vulnerabilities to extract user credentials through GET/POST requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Unique user generation per instance
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Extract email and password credentials
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Progressive hints system
                </li>
              </ul>
              <Link to="/lab1">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Lab 1
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Key className="w-8 h-8 text-primary" />
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                  Level 2
                </Badge>
              </div>
              <CardTitle className="text-2xl">Session Token Hijacking</CardTitle>
              <CardDescription className="text-base">
                Extract session tokens and understand time-based attack vectors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  30-minute expiring session tokens
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Cookie-based token storage
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Real-time countdown timer
                </li>
              </ul>
              <Link to="/lab2">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Lab 2
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-danger" />
                <Badge variant="outline" className="bg-danger/10 text-danger border-danger/30">
                  Level 3
                </Badge>
              </div>
              <CardTitle className="text-2xl">CSRF Token Theft</CardTitle>
              <CardDescription className="text-base">
                Advanced CSRF exploitation with real API simulation and flag capture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Cookie-based authentication bypass
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  CORS vulnerability exploitation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Automated attack payload crafting
                </li>
              </ul>
              <Link to="/lab3">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Lab 3
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>About CSRF Labs</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              Cross-Site Request Forgery (CSRF) is a type of security vulnerability that tricks authenticated 
              users into executing unwanted actions on a web application.
            </p>
            <p>
              These labs provide a safe, controlled environment to understand how CSRF attacks work and 
              how to identify vulnerabilities in web applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
