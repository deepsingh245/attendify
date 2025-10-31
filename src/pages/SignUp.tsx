

import React, { useState } from 'react';
import logo from '../assets/logo_blk.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    // Simulate signup logic
    setError('');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <img src={logo} alt="Logo" className="mx-auto h-12 mb-2" />
          <h2 className="text-2xl font-bold">Create your account</h2>
        </div>
        <Separator className="mb-6" />
        <div className="mb-4">
          <Input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="mb-2"
            required
          />
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
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <Button type="submit" className="w-full mb-2">Sign Up</Button>
        <div className="text-center text-sm mt-2">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
        </div>
      </form>
    </div>
  );
};

export default SignUp;