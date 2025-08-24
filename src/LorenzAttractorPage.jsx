import React, { useRef, useEffect, useState } from 'react';

// Use a set of highly distinct colors
const distinctColors = [
    '#e6194b', // red
    '#3cb44b', // green
    '#ffe119', // yellow
    '#4363d8', // blue
    '#f58231', // orange
    '#911eb4', // purple
    '#46f0f0', // cyan
    '#f032e6', // magenta
    '#bcf60c', // lime
    '#fabebe', // pink
    '#008080', // teal
    '#e6beff', // lavender
    '#9a6324', // brown
    '#fffac8', // beige
    '#800000', // maroon
    '#aaffc3', // mint
    '#808000', // olive
    '#ffd8b1', // apricot
    '#000075', // navy
    '#808080', // grey
];

function getDistinctColor(index) {
    return distinctColors[index % distinctColors.length];
}

function LorenzAttractorPage() {
    const canvasRef = useRef(null);
    const animationRef = useRef(); // Store animation frame ID
    const [attractors, setAttractors] = useState([
        { sigma: 10, rho: 28, beta: 8 / 3, x: 0.1, y: 0, z: 0, prevX: 0.1, prevY: 0, prevZ: 0, color: getDistinctColor(0), xParam: 0.1 },
    ]);
    const [speed, setSpeed] = useState(1);
    const [drawMode, setDrawMode] = useState('pathway'); // 'pathway' or 'fadedPoint'

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dt = 0.01;
        let running = true;

        function draw() {
            if (!running) return;
            if (drawMode === 'fadedPoint') {
                // Fade the canvas slightly each frame
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            attractors.forEach((attractor, i) => {
                const { sigma, rho, beta, color } = attractor;
                let { x, y, z, prevX, prevY, prevZ } = attractor;
                // Save previous position
                prevX = x;
                prevY = y;
                prevZ = z;

                // Lorenz equations
                const dx = sigma * (y - x) * dt;
                const dy = (x * (rho - z) - y) * dt;
                const dz = (x * y - beta * z) * dt;

                x += dx;
                y += dy;
                z += dz;

                // Project to 2D
                const prevCanvasX = canvas.width / 2 + prevX * 10;
                const prevCanvasY = canvas.height * 0.9 - prevZ * 10;
                const canvasX = canvas.width / 2 + x * 10;
                const canvasY = canvas.height * 0.9 - z * 10;

                if (drawMode === 'pathway') {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(prevCanvasX, prevCanvasY);
                    ctx.lineTo(canvasX, canvasY);
                    ctx.stroke();
                } else if (drawMode === 'fadedPoint') {
                    ctx.beginPath();
                    ctx.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.7;
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                }

                // Update attractor state
                attractor.x = x;
                attractor.y = y;
                attractor.z = z;
                attractor.prevX = x;
                attractor.prevY = y;
                attractor.prevZ = z;
            });
            animationRef.current = requestAnimationFrame(draw);
        }

        canvas.width = 800;
        canvas.height = 600;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            running = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [attractors, drawMode]);

    function addAttractor() {
        setAttractors((prev) => {
            if (prev.length >= 6) return prev;
            const resetAttractors = prev.map((a, i) => ({
                ...a,
                x: a.xParam ?? 0.1,
                y: 0,
                z: 0,
                prevX: a.xParam ?? 0.1,
                prevY: 0,
                prevZ: 0,
            }));
            const newAttractor = {
                sigma: 10,
                rho: 28,
                beta: 8 / 3,
                x: 0.1,
                y: 0,
                z: 0,
                prevX: 0.1,
                prevY: 0,
                prevZ: 0,
                color: getDistinctColor(prev.length),
                xParam: 0.1
            };
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            return [...resetAttractors, newAttractor];
        });
    }

    function handleChange(index, e) {
        const { name, value } = e.target;
        setAttractors((prev) => {
            const updated = prev.map((attractor, i) =>
                i === index ? { ...attractor, [name]: name === 'xParam' ? parseFloat(value) : parseFloat(value) } : attractor
            );
            return updated;
        });
        // Call resetSimulation after updating parameters
        setTimeout(resetSimulation, 0);
    }

    function clearPaths() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function resetSimulation() {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setAttractors((prev) => prev.map((a) => ({
            ...a,
            x: a.xParam ?? 0.1,
            y: 0,
            z: 0,
            prevX: a.xParam ?? 0.1,
            prevY: 0,
            prevZ: 0,
        })));
    }

    function removeAttractor(index) {
        setAttractors((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            setTimeout(resetSimulation, 0);
            return updated;
        });
    }

    const tableScrollStyle = {
        marginTop: '1em',
        maxHeight: '24em',
        overflowY: attractors.length > 5 ? 'auto' : 'visible',
    };

    return (
        <div>
            <h1 style={{ textAlign: 'center', margin: '1em 0' }}>Lorenz Attractor Chaos Simulation</h1>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: '50px' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    padding: '2em 1.5em', // Restored padding
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '1em',
                    minWidth: '600px',
                    maxWidth: '700px',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '1em' }}>
                        <button
                            onClick={addAttractor}
                            style={{ padding: '0.5em 1em' }}
                            title="Add a new attractor with random initial conditions"
                            disabled={attractors.length >= 6}
                        >
                            Add Attractor
                        </button>
                        <button onClick={clearPaths} style={{ padding: '0.5em 1em' }} title="Clear all pathways on the canvas">
                            Clear Pathways
                        </button>
                        <button onClick={resetSimulation} style={{ padding: '0.5em 1em' }} title="Reset the simulation with all current attractors and parameters">
                            Reset
                        </button>
                    </div>
                    <div style={{ marginTop: '1em', marginBottom: '1em' }}>
                        <label style={{ marginRight: '1em' }}>
                            <input
                                type="radio"
                                name="drawMode"
                                value="pathway"
                                checked={drawMode === 'pathway'}
                                onChange={() => { setDrawMode('pathway'); setTimeout(resetSimulation, 0); }}
                            />
                            Pathway
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="drawMode"
                                value="fadedPoint"
                                checked={drawMode === 'fadedPoint'}
                                onChange={() => { setDrawMode('fadedPoint'); setTimeout(resetSimulation, 0); }}
                            />
                            Faded Point
                        </label>
                    </div>
                    <div style={tableScrollStyle}>
                        <table style={{ borderCollapse: 'collapse', minWidth: '600px', width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid #ccc', padding: '0.5em' }} title="Unique identifier for each attractor">Attractor</th>
                                    <th style={{ border: '1px solid #ccc', padding: '0.5em' }} title="Initial X value">X</th>
                                    <th style={{ border: '1px solid #ccc', padding: '0.5em' }} title="Controls the rate of convection">Sigma</th>
                                    <th style={{ border: '1px solid #ccc', padding: '0.5em' }} title="Controls the temperature difference">Rho</th>
                                    <th style={{ border: '1px solid #ccc', padding: '0.5em' }} title="Represents the geometric factor">Beta</th>
                                    <th style={{ border: '1px solid #ccc', padding: '0.5em' }}>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attractors.map((attractor, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #ccc', padding: '0.5em', textAlign: 'center', color: attractor.color }}>
                                            Attractor {index + 1}
                                        </td>
                                        <td style={{ border: '1px solid #ccc', padding: '0.5em' }}>
                                            <input
                                                type="number"
                                                name="xParam"
                                                value={attractor.xParam}
                                                onChange={(e) => handleChange(index, e)}
                                                style={{ width: '4em' }}
                                                title="Set the initial X value for this attractor"
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #ccc', padding: '0.5em' }}>
                                            <input
                                                type="number"
                                                name="sigma"
                                                value={attractor.sigma}
                                                onChange={(e) => handleChange(index, e)}
                                                style={{ width: '4em' }}
                                                title="Adjust the Sigma value for this attractor"
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #ccc', padding: '0.5em' }}>
                                            <input
                                                type="number"
                                                name="rho"
                                                value={attractor.rho}
                                                onChange={(e) => handleChange(index, e)}
                                                style={{ width: '4em' }}
                                                title="Adjust the Rho value for this attractor"
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #ccc', padding: '0.5em' }}>
                                            <input
                                                type="number"
                                                name="beta"
                                                value={attractor.beta}
                                                onChange={(e) => handleChange(index, e)}
                                                style={{ width: '4em' }}
                                                title="Adjust the Beta value for this attractor"
                                            />
                                        </td>
                                        <td style={{ border: '1px solid #ccc', padding: '0.5em', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                <button onClick={() => removeAttractor(index)} title="Remove this attractor" style={{ color: 'red', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0, margin: '0 2px' }}>✕</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }}></canvas>
            </div>
        </div>
    );
}

export default LorenzAttractorPage;
