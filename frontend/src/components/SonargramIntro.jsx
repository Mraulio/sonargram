'use client';

import { motion, useInView } from 'framer-motion';
import React from 'react';

export function StaggeredFade({ text, className = '' }) {
    const variants = {
        hidden: { opacity: 0, x: -30 },
        show: (i) => ({
            x: 0,
            opacity: 1,
            transition: { delay: i * 0.06, duration: 0.3 },
        }),
    };

    const letters = text.split('');
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.h1
            ref={ref}
            initial="hidden"
            animate={isInView ? 'show' : ''}
            variants={variants}
            style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 800,
                fontSize: '7rem', // TAMANO MUY GRANDE AQUÍ
                lineHeight: '1',
                whiteSpace: 'nowrap',
                margin: 0,
                padding: 0,
                display: 'inline-block',
                ...className, // solo si className es un objeto de estilos
            }}
        >
            {letters.map((char, i) => (
                <motion.span key={`${char}-${i}`} variants={variants} custom={i}>
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
        </motion.h1>
    );
}

export default function SonargramIntro() {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                overflow: 'hidden',
                gap: '0.1rem', // aún más pegado
                whiteSpace: 'nowrap',
                minWidth: '600px',
                padding: '0 2rem',
            }}
        >
            {/* Logo animado */}

            <motion.div
                initial={{ scale: 2.5, x: 0, opacity: 0 }}
                animate={{
                    scale: [2.5, 0.9],
                    x: [0, -10],
                    opacity: 1,
                }}
                transition={{
                    duration: 1.3,
                    ease: 'easeInOut',
                }}
                style={{ zIndex: 10 }}
            >
                <motion.img
                    src="/assets/images/logo.svg"
                    alt="Sonargram"
                    width={250}
                    height={250}
                    draggable={false}
                    style={{ display: 'block' }}
                    animate={{
                        x: [0, 1, -1, 1, 0],       // mueve un poco izquierda-derecha
                        rotate: [0, 1, -1, 1, 0],  // rota un poco
                    }}
                    transition={{
                        repeat: Infinity,
                        repeatType: 'loop',
                        duration: 0.4,
                        ease: 'easeInOut',
                    }}
                />
            </motion.div>

            {/* Texto animado */}
            <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3, duration: 1 }}
                style={{ zIndex: 5 }}
            >
                <StaggeredFade text="Sonargram" />
            </motion.div>
        </div>
    );
}
