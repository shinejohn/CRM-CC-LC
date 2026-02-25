import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccountManagerAI } from './AccountManagerAI';
import { useAccountManager } from '../../hooks/useAccountManager';

export function AccountManagerBar() {
    const { isOpen, close } = useAccountManager();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "calc(100vh - 76px)", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-[76px] left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-500/10 overflow-hidden pointer-events-auto"
                >
                    <AccountManagerAI onClose={close} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
