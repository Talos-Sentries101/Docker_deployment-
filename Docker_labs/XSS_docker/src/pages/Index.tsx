import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const exercises = [
    {
      id: 1,
      title: "Stored DOM XSS",
      description: "A guestbook application that uses `innerHTML` to insert user comments without proper sanitization.",
      path: "/simplexss",
      color: "bg-blue-600 hover:bg-blue-700",
      badge: "bg-blue-600"
    },
    {
      id: 2,
      title: "DOM-based XSS",
      description: "Demonstrates XSS through URL hash parameters that are directly inserted into the DOM.",
      path: "/domxss",
      color: "bg-purple-600 hover:bg-purple-700",
      badge: "bg-purple-600"
    },
    {
      id: 3,
      title: "Chained XSS",
      description: "A multi-step challenge requiring you to combine multiple small weaknesses to find a secret flag.",
      path: "/level3",
      color: "bg-orange-600 hover:bg-orange-700",
      badge: "bg-orange-600"
    }
  ];

  return (
    <div className="min-h-screen">
      <nav className="bg-black/20 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">🔒 XSS Security Lab</h1>
            <div className="text-sm text-muted-foreground"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Cross-Site Scripting (XSS) Training</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Learn to identify and understand XSS vulnerabilities through hands-on exercises
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 card-hover">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${exercise.badge} rounded-lg flex items-center justify-center mr-4`}>
                  <span className="text-white font-bold">{exercise.id}</span>
                </div>
                <h2 className="text-xl font-semibold">{exercise.title}</h2>
              </div>
              <p className="text-muted-foreground mb-4">{exercise.description}</p>
              <Link to={exercise.path}>
                <Button className={`w-full ${exercise.color}`}>
                  <span className="mr-2">🚀</span>
                  Launch Exercise
                </Button>
              </Link>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Hints and the full solution are available inside the exercise.
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card/30 backdrop-blur-sm border border-border rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6"> Learning Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">XSS Types</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Stored XSS:</strong> Malicious script stored on server</li>
                <li>• <strong>Reflected XSS:</strong> Script reflected from user input</li>
                <li>• <strong>DOM-based XSS:</strong> Client-side script execution</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Prevention Techniques</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Input validation and sanitization</li>
                <li>• Output encoding</li>
                <li>• Content Security Policy (CSP)</li>
                <li>• Using textContent instead of innerHTML</li>
              </ul>
            </div>
          </div>
        </div>

        <footer className="text-center mt-12 py-8 border-t border-border">
        </footer>
      </div>
    </div>
  );
};

export default Index;
