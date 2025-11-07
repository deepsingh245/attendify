import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { BookCheck, ScanFace } from "lucide-react";

const SelectAttendanceMethodModal = ({ saving, setManualAttendanceOpen }: { saving: boolean; setManualAttendanceOpen: (open: boolean) => void; }) => {
 return (
    <>
     <Dialog>
        <DialogTrigger asChild disabled={saving}>
          {/* <Button variant="outline">Open Dialog</Button> */}
          <Button className="mb-4 self-end">Mark Attendance</Button>
        </DialogTrigger>
        <form>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Choose Attendance Method</DialogTitle>
            </DialogHeader>
            <DialogDescription className="flex gap-4 py-4">
              <DialogClose
                onClick={() => setManualAttendanceOpen(false)}
                className="w-full h-full flex items-center flex-col border border-gray-600 rounded-md p-4 hover:bg-gray-900"
              >
                <ScanFace className="mr-2 h-12 w-12" />
                Use Face Recognition
              </DialogClose>
              <DialogClose
                onClick={() => setManualAttendanceOpen(true)}
                className="w-full h-full flex items-center justify-between flex-col border border-gray-600 rounded-md p-4 hover:bg-gray-900"
              >
                <BookCheck className="mr-2 h-12 w-12" />
                Manual Entry
              </DialogClose>
            </DialogDescription>
          </DialogContent>
        </form>
      </Dialog></>
  )
}
export default SelectAttendanceMethodModal;