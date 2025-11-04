import { useRef, useEffect, useState } from 'react';
import useIsSmallScreen from './hooks/useIsSmallScreen';

function ThreeBodyPage() {
    const isSmall = useIsSmallScreen(820);
    const canvasRef = useRef(null);
    const [bodies, setBodies] = useState([
        { x: 400, y: 400, vx: 0, vy: 1.2, m: 300, color: '#e6194b' },
        { x: 500, y: 400, vx: 0, vy: -1.2, m: 300, color: '#3cb44b' },
        { x: 450, y: 500, vx: 1.2, vy: 0, m: 300, color: '#4363d8' },
    ]);
    const [speed, setSpeed] = useState(1.5);
    const [running, setRunning] = useState(true);
    const [paths, setPaths] = useState([
        [], [], []
    ]);
    const maxPathLength = 200;
    const colorPalette = ['#e6194b', '#3cb44b', '#4363d8', '#ffe119', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'];

    // Update paths array if number of bodies changes
    useEffect(() => {
        setPaths(paths => {
            if (paths.length < bodies.length) {
                return [...paths, ...Array(bodies.length - paths.length).fill([])];
            } else if (paths.length > bodies.length) {
                return paths.slice(0, bodies.length);
            }
            return paths;
        });
    }, [bodies.length]);

    useEffect(() => {
        if (!running) return;
        let animationId;
        function step() {
            const G = 1; // Gravitational constant (arbitrary units)
            const dt = 0.1 * speed;
            const newBodies = bodies.map(b => ({ ...b }));
            // Calculate forces
            for (let i = 0; i < bodies.length; i++) {
                let fx = 0, fy = 0;
                for (let j = 0; j < bodies.length; j++) {
                    if (i !== j) {
                        const dx = bodies[j].x - bodies[i].x;
                        const dy = bodies[j].y - bodies[i].y;
                        const distSq = dx * dx + dy * dy + 1e-6;
                        const dist = Math.sqrt(distSq);
                        const F = G * bodies[i].m * bodies[j].m / distSq;
                        fx += F * dx / dist;
                        fy += F * dy / dist;
                    }
                }
                newBodies[i].vx += fx / bodies[i].m * dt;
                newBodies[i].vy += fy / bodies[i].m * dt;
            }
            for (let i = 0; i < bodies.length; i++) {
                newBodies[i].x += newBodies[i].vx * dt;
                newBodies[i].y += newBodies[i].vy * dt;
            }
            setPaths(prevPaths => prevPaths.map((path, i) => {
                const newPath = [...path, { x: newBodies[i].x, y: newBodies[i].y }];
                if (newPath.length > maxPathLength) newPath.shift();
                return newPath;
            }));
            setBodies(newBodies);
            draw(newBodies);
            animationId = requestAnimationFrame(step);
        }
        function draw(bodies) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw faded paths
            paths.forEach((path, i) => {
                if (path.length > 1) {
                    ctx.save();
                    ctx.strokeStyle = bodies[i].color;
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = 0.2;
                    ctx.beginPath();
                    ctx.moveTo(path[0].x, path[0].y);
                    for (let j = 1; j < path.length; j++) {
                        ctx.lineTo(path[j].x, path[j].y);
                    }
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                    ctx.restore();
                }
            });
            // Draw bodies
            // Mass to radius mapping: sqrt for visual balance, min 6px, max 32px
            function massToRadius(m) {
                return Math.max(6, Math.min(32, Math.sqrt(m)));
            }
            for (let i = 0; i < bodies.length; i++) {
                ctx.beginPath();
                ctx.arc(bodies[i].x, bodies[i].y, massToRadius(bodies[i].m), 0, 2 * Math.PI);
                ctx.fillStyle = bodies[i].color;
                ctx.fill();
            }
        }
        draw(bodies);
        animationId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationId);
        // eslint-disable-next-line
    }, [bodies, running, speed, paths]);

    function handleChange(index, e) {
        const { name, value } = e.target;
        let v = value === '' ? '' : parseFloat(value);
        setBodies(prev => prev.map((b, i) => i === index ? { ...b, [name]: v } : b));
        setPaths(prev => prev.map(() => []));
    }

    function resetSimulation() {
        setBodies([
            { x: 400, y: 400, vx: 0, vy: 1.2, m: 300, color: '#e6194b' },
            { x: 500, y: 400, vx: 0, vy: -1.2, m: 300, color: '#3cb44b' },
            { x: 450, y: 500, vx: 1.2, vy: 0, m: 300, color: '#4363d8' },
        ]);
        setPaths([[], [], []]);
    }

    function addBody() {
        const n = bodies.length;
        setBodies(prev => [
            ...prev,
            {
                x: 400 + 50 * Math.cos((2 * Math.PI * n) / 8),
                y: 400 + 50 * Math.sin((2 * Math.PI * n) / 8),
                vx: 0,
                vy: 1.2,
                m: 300, // always >= 1
                color: colorPalette[n % colorPalette.length]
            }
        ]);
        setPaths(prev => [...prev, []]);
    }

    // Update removeBody to accept an index
    function removeBody(index) {
        if (bodies.length > 1) {
            setBodies(prev => prev.filter((_, i) => i !== index));
            setPaths(prev => prev.filter((_, i) => i !== index));
        }
    }

    return (
        <div>
            <h1 style={{ textAlign: 'center', margin: '1em 0' }}>2D N-Body Problem Simulation</h1>
            <div style={{
                display: 'flex', flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'flex-start', justifyContent: 'center', gap: isSmall ? '16px' : '50px', minHeight: isSmall ? 'auto' : '100vh', background: '#f7f7fa', padding: isSmall ? '0 12px' : undefined
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    padding: '2em 1.5em',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '1em',
                    minWidth: '600px',
                    maxWidth: '700px',
                }}>
                    {/* Top right controls */}
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: '1em', marginBottom: 16 }}>
                        <button onClick={addBody} style={{ padding: '0.5em 1em' }}>Add Body</button>
                        <button onClick={resetSimulation} style={{ padding: '0.5em 1em' }}>Reset</button>
                        <button onClick={() => setRunning(r => !r)} style={{ padding: '0.5em 1em' }}>{running ? 'Pause' : 'Resume'}</button>
                        <div style={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
                            <label style={{ marginRight: 8 }}>Speed:</label>
                            <input type="range" min="0.1" max="3" step="0.01" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} style={{ width: 120 }} />
                            <span style={{ marginLeft: 8 }}>{speed.toFixed(2)}x</span>
                        </div>
                    </div>
                    <div style={{ maxHeight: 8 * 48, overflowY: bodies.length > 8 ? 'auto' : 'visible', marginBottom: 16 }}>
                        <table style={{ borderCollapse: 'collapse', minWidth: '600px', width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid #ccc', padding: '0.5em' }}>#</th>
                                    <th style={{ border: '1px solid #ccc', padding: '0.5em' }}>X</th>
                                    <th style={{ border: '1px solid #ccc', padding: '0.5em' }}>Y</th>
                                    <th style={{ border: '1px solid #ccc', padding: '0.5em' }}>Mass</th>
                                    <th style={{ border: '1px solid #ccc', padding: '0.5em' }}>Color</th>
                                    <th style={{ border: '1px solid #ccc', padding: '0.5em' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {bodies.map((body, i) => (
                                    <tr key={i}>
                                        <td style={{ border: '1px solid #ccc', padding: '0.5em', textAlign: 'center' }}>{i + 1}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '0.5em', textAlign: 'center' }}>
                                            <input type="number" name="x" value={body.x} onChange={e => handleChange(i, e)} style={{ width: '5em', textAlign: 'center' }} />
                                        </td>
                                        <td style={{ border: '1px solid #ccc', padding: '0.5em', textAlign: 'center' }}>
                                            <input type="number" name="y" value={body.y} onChange={e => handleChange(i, e)} style={{ width: '5em', textAlign: 'center' }} />
                                        </td>
                                        <td style={{ border: '1px solid #ccc', padding: '0.5em', textAlign: 'center' }}>
                                            <input
                                                type="number"
                                                name="m"
                                                value={body.m === '' ? '' : body.m}
                                                min={1}
                                                step={1}
                                                onChange={e => handleChange(i, e)}
                                                onBlur={e => {
                                                    // If left empty, set to 1
                                                    if (e.target.value === '' || isNaN(Number(e.target.value))) {
                                                        setBodies(prev => prev.map((b, j) => j === i ? { ...b, m: 1 } : b));
                                                    } else if (Number(e.target.value) < 1) {
                                                        setBodies(prev => prev.map((b, j) => j === i ? { ...b, m: 1 } : b));
                                                    }
                                                }}
                                                onKeyDown={e => {
                                                    // Allow: backspace, delete, arrows, tab
                                                    if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) return;
                                                    // Block: e, +, -, . and any non-digit
                                                    if (!/^[0-9]$/.test(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                style={{ width: '4em', textAlign: 'center' }}
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #ccc', padding: '0.5em', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <span style={{ display: 'inline-block', width: 18, height: 18, background: body.color, borderRadius: '50%', verticalAlign: 'middle' }}></span>
                                        </td>
                                        <td style={{ border: '1px solid #ccc', padding: '0.5em', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                <button onClick={() => removeBody(i)} disabled={bodies.length <= 1} style={{ color: 'red', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0, margin: '0 2px' }}>✕</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 0, width: isSmall ? '100%' : 1000 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 0, width: isSmall ? '100%' : 1000 }}>
                        <canvas ref={canvasRef} width={isSmall ? 360 : 1000} height={isSmall ? 360 : 1000} style={{ border: '1px solid #ccc', background: 'white', marginBottom: '1em', maxWidth: '100%' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ThreeBodyPage;
