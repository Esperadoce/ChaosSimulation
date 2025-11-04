import { useEffect, useRef, useState } from 'react';
import Decimal from 'decimal.js-light';
import useIsSmallScreen from './hooks/useIsSmallScreen';

// Simple high-precision Mandelbrot using decimal.js-light
// Note: CPU rendering is slower. We render progressively in tiles.
export default function MandelbrotCpuPage() {
    const canvasRef = useRef(null);
    const isSmall = useIsSmallScreen(820);
    const [params, setParams] = useState({ centerX: '-0.5', centerY: '0', zoom: '1', maxIter: 400, precision: 64 });
    const [rendering, setRendering] = useState(false);
    const [message, setMessage] = useState('');

    const size = isSmall ? 320 : 600;

    function setParam(name, value) {
        setParams(prev => ({ ...prev, [name]: value }));
    }

    // Convert screen (u,v in [0,1]) to complex with current params using Decimal
    function uvToComplex(u, v) {
        const zoom = new Decimal(params.zoom);
        const scale = new Decimal(3).div(zoom);
        const cx = new Decimal(params.centerX).plus(new Decimal(u).minus(0.5).times(scale));
        const cy = new Decimal(params.centerY).plus(new Decimal(v).minus(0.5).times(scale));
        return { cx, cy };
    }

    function iteratePoint(cx, cy, maxIter) {
        let zx = new Decimal(0);
        let zy = new Decimal(0);
        let iter = 0;
        // Escape radius squared = 4
        const four = new Decimal(4);
        for (let i = 0; i < maxIter; i++) {
            // z^2 + c
            // (zx+izy)^2 = (zx^2 - zy^2) + i(2*zx*zy)
            const zx2 = zx.times(zx);
            const zy2 = zy.times(zy);
            const twoZxZy = zx.times(zy).times(2);
            zx = zx2.minus(zy2).plus(cx);
            zy = twoZxZy.plus(cy);
            const mag2 = zx.times(zx).plus(zy.times(zy));
            if (mag2.greaterThan(four)) {
                iter = i;
                // Smooth coloring estimate
                const log_zn = Decimal.log(mag2).div(2);
                const nu = Decimal.log(log_zn.div(Decimal.log(2))).div(Decimal.log(2));
                const smooth = new Decimal(i + 1).minus(nu);
                return { iter, smooth: Number(smooth) };
            }
        }
        return { iter: maxIter, smooth: maxIter };
    }

    async function render() {
        if (rendering) return;
        setRendering(true);
        setMessage('Rendering...');
        Decimal.set({ precision: Number(params.precision) });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = size;
        const h = canvas.height = size;
        const img = ctx.createImageData(w, h);

        const maxIter = Number(params.maxIter);

        // Tile-based progressive rendering to keep UI responsive
        const TILE = 32;
        for (let y0 = 0; y0 < h; y0 += TILE) {
            for (let x0 = 0; x0 < w; x0 += TILE) {
                const x1 = Math.min(x0 + TILE, w);
                const y1 = Math.min(y0 + TILE, h);
                for (let y = y0; y < y1; y++) {
                    for (let x = x0; x < x1; x++) {
                        const u = x / (w - 1);
                        const v = y / (h - 1);
                        const { cx, cy } = uvToComplex(u, v);
                        const { iter, smooth } = iteratePoint(cx, cy, maxIter);
                        let t = iter === maxIter ? 0 : smooth / maxIter;
                        // Simple gradient
                        let r, g, b;
                        if (iter === maxIter) { r = 0; g = 0; b = 0; }
                        else if (t < 0.5) {
                            // mix dark blue -> cyan
                            const k = t * 2;
                            r = 0 * (1 - k) + 0 * k;
                            g = 50 * (1 - k) + 255 * k;
                            b = 100 * (1 - k) + 255 * k;
                        } else {
                            // mix cyan -> yellow
                            const k = (t - 0.5) * 2;
                            r = 0 * (1 - k) + 255 * k;
                            g = 255 * (1 - k) + 255 * k;
                            b = 255 * (1 - k) + 0 * k;
                        }
                        const idx = (y * w + x) * 4;
                        img.data[idx] = r | 0; img.data[idx + 1] = g | 0; img.data[idx + 2] = b | 0; img.data[idx + 3] = 255;
                    }
                }
            }
            // Yield to UI between tile rows
            await new Promise(r => setTimeout(r, 0));
            ctx.putImageData(img, 0, 0);
        }
        ctx.putImageData(img, 0, 0);
        setMessage('');
        setRendering(false);
    }

    // Touch/pinch zoom basic support (mobile)
    useEffect(() => {
        const canvas = canvasRef.current;
        let startDist = 0;
        function dist(touches) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.hypot(dx, dy);
        }
        function onTouchStart(e) {
            if (e.touches.length === 2) {
                startDist = dist(e.touches);
            }
        }
        function onTouchMove(e) {
            if (e.touches.length === 2) {
                e.preventDefault();
                const d = dist(e.touches);
                const factor = d / (startDist || d);
                const z = new Decimal(params.zoom).times(factor);
                setParams(p => ({ ...p, zoom: z.toString() }));
                startDist = d;
            }
        }
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        return () => {
            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('touchmove', onTouchMove);
        };
    }, [params.zoom]);

    return (
        <div style={{ padding: isSmall ? '0 12px' : 0 }}>
            <h1 style={{ textAlign: 'center', margin: '1em 0' }}>Mandelbrot (High Precision CPU)</h1>
            <div style={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row', gap: 20, justifyContent: 'center' }}>
                <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '1em 1.2em', width: isSmall ? '100%' : 320 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: 10 }}>
                        <label>Center X</label>
                        <input value={params.centerX} onChange={e => setParam('centerX', e.target.value)} />
                        <label>Center Y</label>
                        <input value={params.centerY} onChange={e => setParam('centerY', e.target.value)} />
                        <label>Zoom</label>
                        <input value={params.zoom} onChange={e => setParam('zoom', e.target.value)} />
                        <label>Max Iter</label>
                        <input type="number" value={params.maxIter} min={50} max={5000} step={50} onChange={e => setParam('maxIter', Number(e.target.value))} />
                        <label>Precision</label>
                        <input type="number" value={params.precision} min={32} max={256} step={8} onChange={e => setParam('precision', Number(e.target.value))} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button onClick={() => setParams({ centerX: '-0.5', centerY: '0', zoom: '1', maxIter: 400, precision: params.precision })}>Reset</button>
                        <button onClick={render} disabled={rendering} style={{ background: rendering ? '#90a4ae' : '#1976d2' }}>{rendering ? 'Rendering…' : 'Render'}</button>
                    </div>
                    <div style={{ color: '#d32f2f', marginTop: 8 }}>{message}</div>
                    <p style={{ fontSize: 12, color: '#546e7a' }}>Tip: Increase precision when zooming very deep. Rendering is CPU-intensive and may take time. Use smaller canvas on mobile.</p>
                </div>
                <canvas ref={canvasRef} width={size} height={size} style={{ border: '1px solid #ccc', background: 'black', margin: isSmall ? '0 auto 1em' : '0' }} />
            </div>
        </div>
    );
}
