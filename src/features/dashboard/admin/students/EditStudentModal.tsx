import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Student } from '@/firebase/interfaces/user.interface';
import { updateStudent } from '@/firebase/studentUtils';
import { uploadFileToFirebaseStorage } from '@/firebase/firebaseStorageUtils';

interface EditStudentModalProps {
  children?: React.ReactNode;
  student: Student;
  onSuccess: (updatedStudent: Student) => void;
}

export function EditStudentModal({ children, student, onSuccess }: EditStudentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    rollNo: '',
    classId: '',
    profilePictureUrl: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student && isOpen) {
      setFormData({
        userName: student.userName || '',
        email: student.email || '',
        rollNo: student.rollNo?.toString() || '',
        classId: student.classId || '',
        profilePictureUrl: student.profilePictureUrl || '',
      });
      setImagePreview(student.profilePictureUrl || '');
      setProfileImage(null);
      setError(null);
    }
  }, [student, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let finalProfilePicUrl = formData.profilePictureUrl;

      if (profileImage) {
        const result = await uploadFileToFirebaseStorage(profileImage, `students/${student.id}/profile.jpg`);
        finalProfilePicUrl = result.url;
      }

      const updateData: Partial<Student> = {
        userName: formData.userName,
        rollNo: parseInt(formData.rollNo, 10),
        classId: formData.classId,
        profilePictureUrl: finalProfilePicUrl,
      };

      await updateStudent(student.id, updateData);

      onSuccess({ ...student, ...updateData, updatedAt: new Date().toISOString() });
      setIsOpen(false);
    } catch (err: unknown) {
      console.error('Failed to update student:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to update student. Please try again.');
      } else {
        setError('Failed to update student. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-slate-700">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-400">
                  No Image
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="picture" className="cursor-pointer text-sm font-medium text-blue-500 hover:text-blue-400">
                Change Picture
              </Label>
              <Input
                id="picture"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userName" className="text-right">
                Name
              </Label>
              <Input
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                className="col-span-3"
                disabled // Usually email shouldn't be changed easily due to Firebase Auth
                title="Email cannot be changed directly"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rollNo" className="text-right">
                Roll No
              </Label>
              <Input
                id="rollNo"
                name="rollNo"
                type="number"
                value={formData.rollNo}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classId" className="text-right">
                Class ID
              </Label>
              <Input
                id="classId"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-500 font-medium">{error}</div>}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
