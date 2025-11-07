import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// logo removed to avoid image import typing issues; using text title instead
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {  useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, GraduationCap, User } from 'lucide-react';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { login } from '@/firebase/firebaseUtils';

type Role = 'admin' | 'teacher' | 'student' | 'guest' | null;

const roleDisplay = {
  guest: { title: 'Guest', desc: 'Explore the platform without an account' },
  admin: { title: 'Admin', desc: 'Manage platform and users' },
  teacher: { title: 'Teacher', desc: 'Take attendance and manage classes' },
  student: { title: 'Student', desc: 'View your classes and attendance' },
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
    resetForm();
  };

  const [loading, setLoading] = useState(false);
  const [showUserNotFoundDialog, setShowUserNotFoundDialog] = useState(false);

  const guestLogin = async (role: Role) => {
    setError('');
    setLoading(true);

    // Map roles to guest credentials (as requested)
    const creds: Record<string, { email: string; password: string }> = {
      admin: { email: 'ghuestAdmin@attendify.ar', password: 'guest@,123' },
      teacher: { email: 'guestteacher@attendify.ar', password: 'guest@,123' },
      student: { email: 'gueststudent@attendify.ar', password: 'guest@,123' },
      guest: { email: 'guest@attendify.ar', password: 'guest@,123' },
    };

    const cred = role ? creds[role] : creds['guest'];

    try {
      // Try to sign in; if user doesn't exist, create it and then sign in
      try {
        await login(cred.email, cred.password);
      } catch (innerErr: unknown) {
        const code = (innerErr && typeof innerErr === 'object' && 'code' in innerErr) ? (innerErr as { code?: string }).code : undefined;
        console.log("🚀 ~ guestLogin ~ code:", code)
        // If user not found, show dialog asking to contact admin
        if (code === 'auth/user-not-found') {
          setShowUserNotFoundDialog(true);
          return;
        } else {
          throw innerErr;
        }
      }

      // Navigate to the appropriate role route
      if (role === 'admin') navigate('/admin');
      else if (role === 'teacher') navigate('/teacher');
      else if (role === 'student') navigate('/student');
      else navigate('/');
    } catch (err: unknown) {
      console.error('Guest login failed', err);
      const msg = (err as Error)?.message ?? String(err ?? 'Guest login failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    login(email, password)
    // Here we just simulate role-based routing after successful login.
    if (selectedRole === 'admin') navigate('/admin');
    else if (selectedRole === 'teacher') navigate('/teacher');
    else if (selectedRole === 'student') navigate('/student');
    else if (selectedRole === 'guest') navigate('/guest');
    else setError('Please select a role to continue.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
  <div className="w-full max-w-3xl p-8">
        <div className="flex items-center justify-center">
          <div className={`${!selectedRole ? 'bg-white dark:bg-slate-800' : ''} rounded-lg shadow p-6 w-full`}>
            {/* User-not-found dialog */}
            <Dialog open={showUserNotFoundDialog} onOpenChange={(v) => setShowUserNotFoundDialog(v)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>User not found</DialogTitle>
                  <DialogDescription>
                    The guest account you tried to sign in with does not exist. Please contact your administrator to create an account.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={() => setShowUserNotFoundDialog(false)}>OK</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {!selectedRole ? (
              <div>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Sign in as
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Choose your role to continue
                  </p>
                </div>
                {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 w-full">
                  {(
                    [
                      { key: "admin", icon: Shield },
                      { key: "teacher", icon: GraduationCap },
                      { key: "student", icon: User },
                    ] as {
                      key: Exclude<Role, "guest" | null>;
                      icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
                    }[]
                  ).map(({ key, icon: Icon }) => (
                    <Card
                      key={key}
                      className={`flex flex-col justify-between ${
                        key === "admin"
                          ? "border-rose-200 dark:border-rose-700"
                          : key === "teacher"
                          ? "border-indigo-200 dark:border-indigo-700"
                          : "border-emerald-200 dark:border-emerald-700"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-full p-2 ${
                              key === "admin"
                                ? "bg-rose-50 dark:bg-rose-900"
                                : key === "teacher"
                                ? "bg-indigo-50 dark:bg-indigo-900"
                                : "bg-emerald-50 dark:bg-emerald-900"
                            }`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <CardTitle>
                            {roleDisplay[key as keyof typeof roleDisplay].title}
                          </CardTitle>
                        </div>
                        <CardDescription className="mt-2 text-xs">
                          {roleDisplay[key as keyof typeof roleDisplay].desc}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <div className="ml-auto flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRoleClick(key)}
                          >
                            Select
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => guestLogin(key)}
                            disabled={loading}
                          >
                            {loading ? 'Signing in...' : 'Try as Guest'}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 p-4">
                <div className="flex flex-col gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className='w-full flex justify-between items-center mb-3'>
                        Login to your account
                        <Button className='h-7' onClick={() => setSelectedRole(null)}>Change</Button>
                      </CardTitle>
                      <CardDescription>
                        Enter your email below to login to your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                          <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                              id="email"
                              type="email"
                              placeholder="m@example.com"
                              required
                            />
                          </Field>
                          <Field>
                            <div className="flex items-center">
                              <FieldLabel htmlFor="password">
                                Password
                              </FieldLabel>
                              <a
                                href="#"
                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                              >
                                Forgot your password?
                              </a>
                            </div>
                            <Input id="password" type="password" required />
                          </Field>
                          <Field>
                            <Button type="submit">Login</Button>
                            {/* <Button variant="outline" type="button">
                              Login with Google 
                            </Button> */}
                            {/* <FieldDescription className="text-center">
                              Don&apos;t have an account?{' '}
                              <Link to="/signup">Sign up</Link>
                            </FieldDescription> */}
                          </Field>
                        </FieldGroup>
                    </CardContent>
                  </Card>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;