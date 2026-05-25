import React, { useState, useEffect } from 'react';
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
import { Student } from '@/firebase/interfaces/user.interface';
import { updateStudent } from '@/firebase/studentUtils';
import { uploadFileToFirebaseStorage, StoragePaths } from '@/firebase/firebaseStorageUtils';
import { successToast, dangerToast } from '@/lib/utils';

interface TeacherEditStudentModalProps {
  student: Student | null;
  onClose: () => void;
  onSuccess: (updated: Student) => void;
}

export function TeacherEditStudentModal({
  student,
  onClose,
  onSuccess,
}: TeacherEditStudentModalProps) {
  const [formData, setFormData] = useState({ userName: '', phone: '', profilePictureUrl: '' });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setFormData({
        userName: student.userName || '',
        phone: student.phone || '',
        profilePictureUrl: student.profilePictureUrl || '',
      });
      setImagePreview(student.profilePictureUrl || '');
      setProfileImage(null);
      setError(null);
    }
  }, [student]);

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
    if (!student) return;
    setIsLoading(true);
    setError(null);

    try {
      let finalProfilePicUrl = formData.profilePictureUrl;

      if (profileImage) {
        const result = await uploadFileToFirebaseStorage(
          profileImage,
          StoragePaths.studentProfile(student.id)
        );
        finalProfilePicUrl = result.url;
      }

      const updateData: Partial<Student> = {
        userName: formData.userName,
        profilePictureUrl: finalProfilePicUrl,
        ...(formData.phone ? { phone: formData.phone } : {}),
      };

      await updateStudent(student.id, updateData);
      const updated = { ...student, ...updateData, updatedAt: new Date().toISOString() };
      onSuccess(updated);
      successToast('Student updated successfully!');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update student.';
      setError(msg);
      dangerToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={student !== null} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Profile picture */}
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
              htmlFor="teacher-edit-picture"
              className="cursor-pointer text-sm font-medium text-blue-500 hover:text-blue-400"
            >
              Change Photo
            </Label>
            <Input
              id="teacher-edit-picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Fields */}
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="te-userName">Full Name</Label>
              <Input
                id="te-userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Student name"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="te-email">Email</Label>
              <Input
                id="te-email"
                type="email"
                value={student?.email ?? ''}
                disabled
                className="opacity-60 cursor-not-allowed"
                title="Email cannot be changed directly"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="te-phone">Phone Number</Label>
              <Input
                id="te-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555 000 0000"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
