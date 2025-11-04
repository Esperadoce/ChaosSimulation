import React, { useRef, useEffect, useState } from 'react';

function toRadians(deg) {
    return (deg * Math.PI) / 180;
}

const G = 9.81;


function DoublePendulum({
    rod1Length = 150,
    rod2Length = 150,
    mass1 = 10,
    mass2 = 10,
    angle1 = 120,
    angle2 = 45,
    width = 700,
    height = 700,
    dt = 0.03,
    acceleration = 5,
    running,
    setRunning
}) {
    const canvasRef = useRef(null);
    // All parameters are now controlled by parent

    useEffect(() => {
        let animationId;
        let l1 = rod1Length, l2 = rod2Length, m1 = mass1, m2 = mass2, a1 = angle1, a2 = angle2;
        let a1_v = 0;
        let a2_v = 0;
        a1 = toRadians(a1);
        a2 = toRadians(a2);

        function draw() {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            ctx.save();
            ctx.translate(w / 2, 100);

            // Positions
            const x1 = l1 * Math.sin(a1);
            const y1 = l1 * Math.cos(a1);
            const x2 = x1 + l2 * Math.sin(a2);
            const y2 = y1 + l2 * Math.cos(a2);

            // Draw rods
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw masses
            ctx.beginPath();
            ctx.arc(x1, y1, m1, 0, 2 * Math.PI);
            ctx.fillStyle = '#1976d2';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x2, y2, m2, 0, 2 * Math.PI);
            ctx.fillStyle = '#d32f2f';
            ctx.fill();

            ctx.restore();
        }

        function step() {
            // Equations of motion
            const num1 = -G * (2 * m1 + m2) * Math.sin(a1);
            const num2 = -m2 * G * Math.sin(a1 - 2 * a2);
            const num3 = -2 * Math.sin(a1 - a2) * m2;
            const num4 = a2_v * a2_v * l2 + a1_v * a1_v * l1 * Math.cos(a1 - a2);
            const den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
            const a1_a = (num1 + num2 + num3 * num4) / den;

            const num5 = 2 * Math.sin(a1 - a2);
            const num6 = a1_v * a1_v * l1 * (m1 + m2);
            const num7 = G * (m1 + m2) * Math.cos(a1);
            const num8 = a2_v * a2_v * l2 * m2 * Math.cos(a1 - a2);
            const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
            const a2_a = (num5 * (num6 + num7 + num8)) / den2;

            const dtEff = dt * (typeof acceleration === 'number' ? acceleration : 5);
            a1_v += a1_a * dtEff;
            a2_v += a2_a * dtEff;
            a1 += a1_v * dtEff;
            a2 += a2_v * dtEff;
        }

        function animate() {
            if (!running) return;
            step();
            draw();
            animationId = requestAnimationFrame(animate);
        }

        // Set devicePixelRatio-aware canvas size
        const canvas = canvasRef.current;
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        draw();
        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
        // eslint-disable-next-line
    }, [rod1Length, rod2Length, mass1, mass2, angle1, angle2, acceleration, running]);


    // Pure visual component, no controls
    return (
        <div style={{ textAlign: 'center' }}>
            <canvas ref={canvasRef} width={width} height={height} style={{ background: '#fafafa', border: '1px solid #ccc' }} />
        </div>
    );
}

export default DoublePendulum;
