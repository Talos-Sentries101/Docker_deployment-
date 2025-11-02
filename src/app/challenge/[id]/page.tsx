'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { checkAuthStatus, startLabContainer, stopLabContainer, getContainerStatus } from '@/lib/client-auth';

interface Lab {
  lab_id: number;
  lab_name: string;
  lab_description: string;
  lab_tags: string[];
  level: number;
  max_score: number;
  created_at: string;
  updated_at: string;
}

interface ContainerInfo {
  containerId: string;
  labType: string;
  port: number;
  url: string;
  status: string;
  createdAt: string;
}

export default function ChallengePage() {
  const router = useRouter();
  const params = useParams();
  const labId = params.id as string;

  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [containerLoading, setContainerLoading] = useState(false);
  const [activeContainer, setActiveContainer] = useState<ContainerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ user_id: string; name?: string } | null>(null);

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const authStatus = await checkAuthStatus();
        if (authStatus.authenticated && authStatus.user) {
          setUser(authStatus.user);
        } else {
          router.replace('/login?from=/dashboard');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.replace('/login?from=/dashboard');
      }
    }

    checkAuth();
  }, [router]);

  // Fetch lab details
  useEffect(() => {
    async function fetchLab() {
      try {
        const res = await fetch('/api/labs');
        const data = await res.json();
        if (data.success) {
          const foundLab = data.labs.find((l: Lab) => l.lab_id.toString() === labId);
          if (foundLab) {
            setLab(foundLab);
          } else {
            setError('Lab not found');
          }
        }
      } catch (err) {
        console.error('Error fetching lab:', err);
        setError('Failed to load lab details');
      } finally {
        setLoading(false);
      }
    }

    if (labId) {
      fetchLab();
    }
  }, [labId]);

  // Check for active containers
  useEffect(() => {
    async function checkActiveContainers() {
      try {
        const data = await getContainerStatus();
        if (data.success && data.data.activeContainers.length > 0) {
          setActiveContainer(data.data.activeContainers[0]);
        }
      } catch (err) {
        console.error('Error checking active containers:', err);
      }
    }

    if (user) {
      checkActiveContainers();
    }
  }, [user]);

  const getLabType = (labName: string): 'xss' | 'csrf' | null => {
    const name = labName.toLowerCase();
    if (name.includes('xss')) return 'xss';
    if (name.includes('csrf')) return 'csrf';
    return null;
  };

  const startChallenge = async () => {
    if (!lab || !user) return;

    const labType = getLabType(lab.lab_name);
    if (!labType) {
      setError('This challenge type is not supported for Docker deployment');
      return;
    }

    setContainerLoading(true);
    setError(null);

    try {
      const data = await startLabContainer(labType);

      if (data.success) {
        setActiveContainer({
          containerId: data.data.containerId,
          labType: data.data.labType,
          port: data.data.port,
          url: data.data.url,
          status: 'running',
          createdAt: new Date().toISOString()
        });
      } else {
        setError(data.error || 'Failed to start challenge');
      }
    } catch (err) {
      console.error('Error starting challenge:', err);
      setError(err instanceof Error ? err.message : 'Failed to start challenge. Please try again.');
    } finally {
      setContainerLoading(false);
    }
  };

  const stopChallenge = async () => {
    if (!activeContainer || !user) return;

    setContainerLoading(true);
    setError(null);

    try {
      const data = await stopLabContainer(activeContainer.containerId);

      if (data.success) {
        setActiveContainer(null);
      } else {
        setError(data.error || 'Failed to stop challenge');
      }
    } catch (err) {
      console.error('Error stopping challenge:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop challenge. Please try again.');
    } finally {
      setContainerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading challenge...</div>
      </div>
    );
  }

  if (error && !lab) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!lab) return null;

  const labType = getLabType(lab.lab_name);
  const isDockerSupported = labType !== null;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-white text-4xl font-bold mb-4">{lab.lab_name}</h1>
          <p className="text-gray-400 text-lg">{lab.lab_description}</p>
        </div>

        {/* Challenge Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-2">Difficulty</h3>
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                lab.level <= 2 ? 'bg-green-500/10 text-green-400' :
                lab.level <= 4 ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-red-500/10 text-red-400'
              }`}>
                Level {lab.level}
              </span>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Points</h3>
              <span className="text-red-400 font-bold text-xl">{lab.max_score}</span>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {lab.lab_tags?.map((tag, index) => (
                  <span key={index} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Docker Container Management */}
        {isDockerSupported ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-white text-2xl font-semibold mb-4">Challenge Environment</h2>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            {activeContainer ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-2">Challenge Environment Active</h3>
                      <p className="text-sm">Your {activeContainer.labType.toUpperCase()} challenge is running on port {activeContainer.port}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <a 
                        href={activeContainer.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Open Challenge
                      </a>
                      <button
                        onClick={stopChallenge}
                        disabled={containerLoading}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        {containerLoading ? 'Stopping...' : 'Stop Challenge'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400">
                  This challenge requires a Docker container environment. Click the button below to start your isolated challenge instance.
                </p>
                <button
                  onClick={startChallenge}
                  disabled={containerLoading}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/20"
                >
                  {containerLoading ? 'Starting Challenge...' : `Start ${labType?.toUpperCase()} Challenge`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-6 rounded-2xl mb-8">
            <h3 className="font-semibold mb-2">Static Challenge</h3>
            <p>This challenge doesn't require a Docker environment. You can work on it directly or access it through other means.</p>
          </div>
        )}

        {/* Challenge Instructions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white text-2xl font-semibold mb-4">Instructions</h2>
          <div className="text-gray-300 space-y-4">
            <p>
              Complete this {lab.lab_name} challenge to earn {lab.max_score} points.
            </p>
            {isDockerSupported && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <h4 className="text-blue-400 font-semibold mb-2">Docker Environment</h4>
                <ul className="text-sm space-y-1">
                  <li>• Click "Start Challenge" to deploy your isolated environment</li>
                  <li>• Each user can only have one active container at a time</li>
                  <li>• The environment will be accessible via the provided URL</li>
                  <li>• Remember to stop the challenge when you're done</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
