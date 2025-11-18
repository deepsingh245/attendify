import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function BasicAlert({message, action, showAlert, setShowAlert, confirmButtonText}: {message: string, action: ()=>void, showAlert: boolean, setShowAlert: (show: boolean)=>void, confirmButtonText?: string}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={showAlert}>
        <Button variant="outline">{confirmButtonText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(()=>setShowAlert(false))}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(()=>action())} >Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
