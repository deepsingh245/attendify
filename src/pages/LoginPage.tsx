import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, GraduationCap, User, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
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
import { getAuthErrorMessage, LOCAL_STORAGE_KEYS } from '@/constants/constants';
import { dangerToast } from '@/lib/utils';



type Role = 'admin' | 'teacher' | 'student' | 'guest' | null;

const roleDisplay = {
  guest: { title: 'Guest', desc: 'Explore the platform without an account', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' },
  admin: { title: 'Admin', desc: 'Manage platform and users', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800' },
  teacher: { title: 'Teacher', desc: 'Take attendance and manage classes', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800' },
  student: { title: 'Student', desc: 'View your classes and attendance', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800' },
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const resetForm = () => {
    setEmail('');
    setPassword('');
  };

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
    resetForm();
  };
  
  const [loading, setLoading] = useState(false);
  const [showUserNotFoundDialog, setShowUserNotFoundDialog] = useState(false);
  
  const guestLogin = async (role: Role) => {
    setLoading(true);

    // Map roles to guest credentials (as requested)
    const creds: Record<string, { email: string; password: string }> = {
      admin: { email: "guestadmin@arovation.ar", password: "guest@,123" },
      teacher: { email: "guestteacher@attendify.ar", password: "guest@,123" },
      student: { email: "simrandeep.dev@gmail.com", password: "guest@,123" },
      guest: { email: "guest@attendify.ar", password: "guest@,123" },
    };

    const cred = role ? creds[role] : creds["guest"];
    if (role) localStorage.setItem(LOCAL_STORAGE_KEYS.ROLE, role);

    try {
      await login(cred.email, cred.password).then((user) => {
        if (!user) {
          setShowUserNotFoundDialog(true);
        }
        window.dispatchEvent(new Event('attendifyRoleChanged'));
        // AppRoutes will automatically redirect when currentUser is set
      });
    } catch (err: unknown) {
      const message = getAuthErrorMessage(err);
      dangerToast(message);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      dangerToast('Email and password are required.');
      return;
    }
    setLoading(true);
    (async () => {
      try {
        if (selectedRole) localStorage.setItem(LOCAL_STORAGE_KEYS.ROLE, selectedRole);
        window.dispatchEvent(new Event('attendifyRoleChanged'));
        await login(email, password);
        // AppRoutes will automatically redirect when currentUser is set
      } catch (err: unknown) {
        const message = getAuthErrorMessage(err);
        dangerToast(message);
        setLoading(false);
      }
    })();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background transition-colors p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[100px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-[100px] animate-pulse delay-1000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/10 blur-[100px] animate-pulse delay-2000" />
      </div>

      <div className={`w-full max-w-5xl z-10 transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding & Info */}
          <div className="hidden lg:flex flex-col space-y-6 text-slate-800 dark:text-slate-100 p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Attendify</h1>
            </div>
            <h2 className="text-3xl font-bold leading-tight">
              Smart Attendance <br />
              <span className="text-blue-600 dark:text-blue-400">Management System</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Streamline your educational institution's workflow with our comprehensive attendance tracking and management solution.
            </p>
            
            <div className="space-y-4 mt-8">
              {[
                "Real-time attendance tracking",
                "Comprehensive student analytics",
                "Secure role-based access",
                "Automated reporting system"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-200 dark:ring-slate-800">
              {/* User-not-found dialog */}
              <Dialog open={showUserNotFoundDialog} onOpenChange={(v) => setShowUserNotFoundDialog(v)}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-rose-600">
                      <Shield className="w-5 h-5" />
                      User not found
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                      The guest account you tried to sign in with does not exist. Please contact your administrator to create an account.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button onClick={() => setShowUserNotFoundDialog(false)} className="w-full sm:w-auto">OK</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {!selectedRole ? (
                <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="text-center mb-8">
                    <div className="lg:hidden flex justify-center mb-4">
                      <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      Welcome Back
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      Please select your role to continue
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(
                      [
                        { key: "admin", icon: Shield },
                        { key: "teacher", icon: GraduationCap },
                        { key: "student", icon: User },
                      ] as {
                        key: Exclude<Role, "guest" | null>;
                        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
                      }[]
                    ).map(({ key, icon: Icon }) => {
                      const style = roleDisplay[key];
                      return (
                        <div
                          key={key}
                          className={`group relative flex items-center p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-md ${style.bg} ${style.border} hover:scale-[1.02] active:scale-[0.98]`}
                          onClick={() => handleRoleClick(key)}
                        >
                          <div className={`p-3 rounded-lg bg-white dark:bg-slate-900 shadow-sm mr-4 group-hover:shadow transition-shadow`}>
                            <Icon className={`w-6 h-6 ${style.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{style.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{style.desc}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => {
                              e.stopPropagation();
                              handleRoleClick(key);
                            }}>
                              <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/*  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-center text-xs text-slate-500 mb-4">Or try the platform without an account</p>
                    <Button 
                      variant="outline" 
                      className="w-full border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all"
                      onClick={() => guestLogin('guest')}
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Continue as Guest'}
                    </Button>
                  </div> */}
                </div>
              ) : (
                <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="mb-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-2"
                      onClick={() => setSelectedRole(null)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to roles
                    </Button>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${roleDisplay[selectedRole].bg} border ${roleDisplay[selectedRole].border}`}>
                        {selectedRole === 'admin' && <Shield className={`w-6 h-6 ${roleDisplay[selectedRole].color}`} />}
                        {selectedRole === 'teacher' && <GraduationCap className={`w-6 h-6 ${roleDisplay[selectedRole].color}`} />}
                        {selectedRole === 'student' && <User className={`w-6 h-6 ${roleDisplay[selectedRole].color}`} />}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {roleDisplay[selectedRole].title} Login
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Enter your credentials to access your account
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <FieldGroup className="space-y-4">
                      <Field>
                        <FieldLabel htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </Field>
                      <Field>
                        <div className="flex items-center justify-between mb-1.5">
                          <FieldLabel htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Password
                          </FieldLabel>
                          <a
                            href="#"
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            Forgot password?
                          </a>
                        </div>
                        <Input 
                          id="password" 
                          type="password" 
                          required 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          className="h-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="••••••••"
                        />
                      </Field>
                    </FieldGroup>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : 'Sign In'}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      onClick={() => guestLogin(selectedRole)}
                      disabled={loading}
                    >
                      Try as Guest {roleDisplay[selectedRole].title}
                    </Button>
                  </form>
                </div>
              )}
            </Card>
            
            <p className="lg:hidden text-center text-xs text-slate-400 mt-8 absolute bottom-4">
              &copy; 2025 Attendify. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;