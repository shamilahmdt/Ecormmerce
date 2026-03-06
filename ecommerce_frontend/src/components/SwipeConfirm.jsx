import React from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { FaChevronRight } from "react-icons/fa";

const SwipeConfirm = ({ onConfirm, isLoading }) => {
    const x = useMotionValue(0);
    
    // Constraints for the swipe
    // Width of container is roughly w-full (max 320px)
    // We'll use a fixed value for the swipe distance or handle it via a ref if needed.
    // However, for this UI, a fixed max-width is good.
    const containerWidth = 320;
    const handleSize = 64; // 16 * 4
    const padding = 8; // 2 * 4
    const swipeDistance = containerWidth - handleSize - (padding * 2);

    const opacity = useTransform(x, [0, swipeDistance * 0.4], [1, 0]);
    const successOpacity = useTransform(x, [swipeDistance * 0.8, swipeDistance], [0, 1]);
    const bgColor = useTransform(
        x,
        [0, swipeDistance],
        ["rgba(79, 70, 229, 0.05)", "rgba(16, 185, 129, 0.1)"]
    );

    const handleDragEnd = (event, info) => {
        if (info.offset.x >= swipeDistance - 20) {
            onConfirm();
        } else {
            // Spring back
            x.set(0);
        }
    };

    return (
        <div 
            className="relative w-full max-w-[320px] mx-auto h-[72px] bg-gray-50 border border-gray-100 rounded-[2rem] p-2 overflow-hidden flex items-center shadow-inner"
            style={{ touchAction: "none" }}
        >
            {/* Track Background Fill */}
            <motion.div 
                style={{ 
                    width: x, 
                    backgroundColor: "rgba(79, 70, 229, 0.1)",
                    opacity: useTransform(x, [0, swipeDistance], [0.5, 1])
                }}
                className="absolute left-0 top-0 h-full rounded-l-[2rem] pointer-events-none"
            />

            {/* Instruction Text */}
            <motion.div 
                style={{ opacity }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] ml-16">
                    Swipe to Pay
                </span>
            </motion.div>

            {/* Success State Text */}
            <motion.div 
                style={{ opacity: successOpacity }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <span className="text-green-600 font-black text-[10px] uppercase tracking-[0.3em] ml-16">
                    Ready to confirm
                </span>
            </motion.div>

            {/* Draggable Handle */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: swipeDistance }}
                dragElastic={0.05}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className={`z-10 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl cursor-grab active:cursor-grabbing transition-colors duration-300 ${
                    isLoading ? 'bg-gray-200' : 'bg-black text-white hover:bg-indigo-600'
                }`}
            >
                {isLoading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <FaChevronRight className="text-lg" />
                )}
            </motion.div>
        </div>
    );
};

export default SwipeConfirm;
