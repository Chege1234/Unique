import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * ConfirmDialog – a lightweight in-app confirmation modal.
 *
 * Props:
 *   open          boolean
 *   title         string
 *   description   string
 *   confirmLabel  string   (default "Confirm")
 *   cancelLabel   string   (default "Cancel")
 *   destructive   boolean  (default false) – makes confirm button red
 *   onConfirm     () => void
 *   onCancel      () => void
 */
export default function ConfirmDialog({
    open,
    title = "Are you sure?",
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
    onConfirm,
    onCancel,
}) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center px-4"
                    style={{ background: "rgba(3,0,20,0.80)", backdropFilter: "blur(8px)" }}
                    onClick={onCancel}
                >
                    <motion.div
                        key="dialog"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-8 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 ${destructive ? "bg-red-500/15 border border-red-500/20" : "bg-blue-500/15 border border-blue-500/20"
                            }`}>
                            <AlertTriangle className={`w-7 h-7 ${destructive ? "text-red-400" : "text-blue-400"}`} />
                        </div>

                        {/* Text */}
                        <h2 className="text-xl font-black text-white text-center tracking-tight mb-3 uppercase">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-blue-100/50 text-center leading-relaxed mb-8 font-medium">
                                {description}
                            </p>
                        )}

                        {/* Actions — cancel left, confirm right */}
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-xs text-white/60 hover:text-white hover:bg-white/5"
                                onClick={onCancel}
                            >
                                {cancelLabel}
                            </Button>
                            <Button
                                className={`flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-xs text-white transition-all ${destructive
                                        ? "bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/30"
                                        : "bg-primary hover:bg-primary/80"
                                    }`}
                                onClick={onConfirm}
                            >
                                {confirmLabel}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

