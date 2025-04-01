import { toast } from "sonner"

export const errorMsg = (msg = 'Xatolik!') => {
    toast.error(msg);
}

export const successMsg = (msg = 'Bajarildi!') => {
    toast.success(msg);
}