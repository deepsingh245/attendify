import React, { useState } from 'react';
import logo from '../assets/logo_blk.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.role) {
      setError('All fields are required.');
      return;
    }
    setError('');
    if (form.role === 'admin') {
      navigate('/dashboard/admin');
    } else if (form.role === 'teacher') {
      navigate('/dashboard/teacher');
    } else if (form.role === 'student') {
      navigate('/dashboard/student');
    } else {
      setError('Invalid role selected.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <img src={logo} alt="Logo" className="mx-auto h-12 mb-2" />
          <h2 className="text-2xl font-bold">Sign in to your account</h2>
        </div>
        <Separator className="mb-6" />
        <div className="mb-4">
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="mb-2"
            required
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="mb-2"
            required
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <Button type="submit" className="w-full mb-2">Sign In</Button>
        <div className="text-center text-sm mt-2">
          Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;