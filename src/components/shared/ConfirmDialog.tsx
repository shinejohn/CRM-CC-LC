import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "destructive";
    onConfirm: () => void;
    isLoading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
    onConfirm,
    isLoading,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-[var(--nexus-bg-page)] border-[var(--nexus-card-border)]">
                <DialogHeader>
                    <DialogTitle className="text-[var(--nexus-text-primary)]">{title}</DialogTitle>
                    <DialogDescription className="text-[var(--nexus-text-secondary)]">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={variant}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={
                            variant === "default"
                                ? "bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-none"
                                : "bg-[var(--nexus-accent-danger)] text-white hover:bg-red-600 border-none"
                        }
                    >
                        {isLoading ? "Saving..." : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
