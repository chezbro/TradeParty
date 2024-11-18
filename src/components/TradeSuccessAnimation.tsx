import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TradeSuccessAnimationProps {
    type: 'LONG' | 'SHORT';
}

export const TradeSuccessAnimation = ({ type }: TradeSuccessAnimationProps) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
                >
                    <div className={`px-6 py-4 rounded-xl backdrop-blur-lg shadow-xl
                        ${type === 'LONG' 
                            ? 'bg-green-500/20 border-green-500/30' 
                            : 'bg-red-500/20 border-red-500/30'} 
                        border-2`}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <div className={`text-4xl mb-2 ${
                                type === 'LONG' ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {type === 'LONG' ? '🚀' : '📉'}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">
                                Trade Entered Successfully!
                            </h3>
                            <p className={`text-sm ${
                                type === 'LONG' ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {type === 'LONG' ? 'Long Position Added' : 'Short Position Added'}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}; 