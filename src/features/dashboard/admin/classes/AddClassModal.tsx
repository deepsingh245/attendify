// src/features/dashboard/admin/classes/AddClassModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Teacher } from "@/firebase/interfaces/user.interface";
import { useState } from "react";

interface AddClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: { className: string, teacherId: string, room: string }) => void;
    teachers: Teacher[];
}

const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, onSubmit, teachers }) => {
    const [className, setClassName] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [room, setRoom] = useState('');

    const handleSubmit = () => {
        onSubmit({ className, teacherId, room });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Class</DialogTitle>
                    <DialogDescription>Enter the details for the new class.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="className" className="text-right">Class Name</Label>
                        <Input id="className" value={className} onChange={(e) => setClassName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="teacher" className="text-right">Teacher</Label>
                        <Select onValueChange={setTeacherId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent>
                                {teachers.map(teacher => (
                                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.userName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="room" className="text-right">Room</Label>
                        <Input id="room" value={room} onChange={(e) => setRoom(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Add Class</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddClassModal;
