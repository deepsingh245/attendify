import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addStudent, updateStudent } from '@/firebase/studentUtils';
import { uploadFileToFirebaseStorage, StoragePaths } from '@/firebase/firebaseStorageUtils';
import { dangerToast } from '@/lib/utils';

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className?: string;
  onSuccess: (studentId: string) => void;
}

export function AddStudentModal({
  open,
  onOpenChange,
  classId,
  className: clsName,
  onSuccess,
}: AddStudentModalProps) {
  const [formData, setFormData] = useState({ userName: '', email: '', password: '', rollNo: '' });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFormData({ userName: '', email: '', password: '', rollNo: '' });
    setProfileImage(null);
    setImagePreview('');
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const studentId = await addStudent({
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        rollNo: parseInt(formData.rollNo, 10),
        classId,
        classes: [classId],
      });

      if (profileImage) {
        const { url } = await uploadFileToFirebaseStorage(
          profileImage,
          StoragePaths.studentProfile(studentId)
        );
        await updateStudent(studentId, { profilePictureUrl: url });
      }

      onSuccess(studentId);
      reset();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add student.';
      setError(msg);
      dangerToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
          {clsName && (
            <p className="text-sm text-slate-400">Enrolling in {clsName}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Profile picture — optional */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-slate-700">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-400 text-sm">
                  No photo
                </div>
              )}
            </div>
            <Label
              htmlFor="add-student-picture"
              className="cursor-pointer text-sm font-medium text-blue-500 hover:text-blue-400"
            >
              {imagePreview ? 'Change Photo' : 'Add Photo (optional)'}
            </Label>
            <Input
              id="add-student-picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="as-userName">Full Name</Label>
              <Input
                id="as-userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Student name"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="as-email">Email</Label>
              <Input
                id="as-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@school.com"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="as-password">Password</Label>
              <Input
                id="as-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="as-rollNo">Roll Number</Label>
              <Input
                id="as-rollNo"
                name="rollNo"
                type="number"
                value={formData.rollNo}
                onChange={handleChange}
                placeholder="e.g. 42"
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); onOpenChange(false); }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding…' : 'Add Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
