import { useRef, useEffect, useState } from 'react';
import useIsSmallScreen from './hooks/useIsSmallScreen';
import { useNavigate } from 'react-router-dom';

// Utility: hex to rgb array (0-255)
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const bigint = parseInt(hex, 16);
    return [
        ((bigint >> 16) & 255),
        ((bigint >> 8) & 255),
        (bigint & 255)
    ];
}

function MandelbrotWebGLPage({ onRequestCPU }) {
    const isSmall = useIsSmallScreen(820);
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [params, setParams] = useState({
        centerX: -0.5,
        centerY: 0,
        zoom: 1,
        maxIter: 200
    });
    const [color1, setColor1] = useState('#002a00'); // inside color
    const [color2, setColor2] = useState('#00bfff'); // mid color
    const [color3, setColor3] = useState('#ffff00'); // outside color
    const [glError, setGlError] = useState('');

    // UI and layout copied from MandelbrotPage.jsx
    function handleChange(e) {
        const { name, value } = e.target;
        let v = parseFloat(value);
        if (name === 'zoom') {
            if (v > 82500) v = 82500;
            if (v < 0.01) v = 0.01;
        }
        setParams(prev => ({ ...prev, [name]: v }));
    }
    function handleResetView() {
        setParams({ centerX: -0.5, centerY: 0, zoom: 1, maxIter: 200 });
    }

    // WebGL Mandelbrot rendering
    useEffect(() => {
    const canvas = canvasRef.current;
        let gl = canvas.getContext('webgl2');
        let usingWebGL2 = true;
        setGlError('');
        if (!gl) {
            gl = canvas.getContext('webgl');
            usingWebGL2 = false;
        }
        if (!gl) {
            setGlError('Unable to initialize WebGL2 or WebGL. Your browser or hardware may not support it.');
            return;
        }
        // Vertex shader
        let vertSrc, fragSrc;
        if (usingWebGL2) {
            vertSrc = `#version 300 es\nlayout(location = 0) in vec2 a_position;\nout vec2 v_uv;\nvoid main() { v_uv = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0, 1); }`;
            fragSrc = `#version 300 es\nprecision highp float;\nin vec2 v_uv;\nout vec4 outColor;\nuniform float u_centerX, u_centerY, u_zoom, u_maxIter;\nuniform vec3 u_color1, u_color2, u_color3;\nvec2 cadd(vec2 a, vec2 b) { return vec2(a.x + b.x, a.y + b.y); }\nvec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }\nfloat cdot(vec2 a) { return a.x * a.x + a.y * a.y; }\nvoid main() { float scale = 3.0 / u_zoom; vec2 c = vec2(u_centerX + (v_uv.x - 0.5) * scale, u_centerY + (v_uv.y - 0.5) * scale); vec2 z = vec2(0.0, 0.0); int iter = 0; int maxIter = int(u_maxIter); float smoothVal = 0.0; for (int i = 0; i < 1000; i++) { if (i >= maxIter) break; z = cadd(cmul(z, z), c); if (cdot(z) > 4.0) { iter = i; float log_zn = log(cdot(z)) / 2.0; float nu = log(log_zn / log(2.0)) / log(2.0); smoothVal = float(i) + 1.0 - nu; break; } } float t; if (iter == maxIter) { outColor = vec4(u_color1, 1.0); return; } else { t = smoothVal / float(maxIter); } vec3 color; if (t < 0.5) { color = mix(u_color1, u_color2, t * 2.0); } else { color = mix(u_color2, u_color3, (t - 0.5) * 2.0); } outColor = vec4(color, 1.0); }`;
        } else {
            vertSrc = `attribute vec2 a_position; varying vec2 v_uv; void main() { v_uv = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0, 1); }`;
            fragSrc = `precision highp float; varying vec2 v_uv; uniform float u_centerX, u_centerY, u_zoom, u_maxIter; uniform vec3 u_color1, u_color2, u_color3; vec2 cadd(vec2 a, vec2 b) { return vec2(a.x + b.x, a.y + b.y); } vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); } float cdot(vec2 a) { return a.x * a.x + a.y * a.y; } void main() { float scale = 3.0 / u_zoom; vec2 c = vec2(u_centerX + (v_uv.x - 0.5) * scale, u_centerY + (v_uv.y - 0.5) * scale); vec2 z = vec2(0.0, 0.0); int iter = 0; int maxIter = int(u_maxIter); float smoothVal = 0.0; for (int i = 0; i < 1000; i++) { if (i >= maxIter) break; z = cadd(cmul(z, z), c); if (cdot(z) > 4.0) { iter = i; float log_zn = log(cdot(z)) / 2.0; float nu = log(log_zn / log(2.0)) / log(2.0); smoothVal = float(i) + 1.0 - nu; break; } } float t; if (iter == maxIter) { gl_FragColor = vec4(u_color1, 1.0); return; } else { t = smoothVal / float(maxIter); } vec3 color; if (t < 0.5) { color = mix(u_color1, u_color2, t * 2.0); } else { color = mix(u_color2, u_color3, (t - 0.5) * 2.0); } gl_FragColor = vec4(color, 1.0); }`;
        }
        function compileShader(type, src) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                setGlError('Shader compile error: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }
        const vs = compileShader(gl.VERTEX_SHADER, vertSrc);
        const fs = compileShader(gl.FRAGMENT_SHADER, fragSrc);
        if (!vs || !fs) return;
        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            setGlError('Program link error: ' + gl.getProgramInfoLog(prog));
            gl.deleteProgram(prog);
            return;
        }
        gl.useProgram(prog);
        // Quad
        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1, 1, 1
        ]), gl.STATIC_DRAW);
        if (usingWebGL2) {
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        } else {
            const posLoc = gl.getAttribLocation(prog, 'a_position');
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        }
        // Uniforms
        const u_centerX = gl.getUniformLocation(prog, 'u_centerX');
        const u_centerY = gl.getUniformLocation(prog, 'u_centerY');
        const u_zoom = gl.getUniformLocation(prog, 'u_zoom');
        const u_maxIter = gl.getUniformLocation(prog, 'u_maxIter');
        const u_color1 = gl.getUniformLocation(prog, 'u_color1');
        const u_color2 = gl.getUniformLocation(prog, 'u_color2');
        const u_color3 = gl.getUniformLocation(prog, 'u_color3');
        // Draw
    gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(u_centerX, params.centerX);
        gl.uniform1f(u_centerY, params.centerY);
        gl.uniform1f(u_zoom, params.zoom);
        gl.uniform1f(u_maxIter, params.maxIter);
        gl.uniform3fv(u_color1, hexToRgb(color1).map(v => v / 255));
        gl.uniform3fv(u_color2, hexToRgb(color2).map(v => v / 255));
        gl.uniform3fv(u_color3, hexToRgb(color3).map(v => v / 255));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        // Cleanup
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(posBuf);
        gl.deleteProgram(prog);
    }, [params.centerX, params.centerY, params.zoom, params.maxIter, color1, color2, color3]);

    // Mouse interaction for zoom and pan
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let dragging = false;
        let lastX = 0, lastY = 0;
        const handleWheel = e => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / canvas.width;
            const y = (e.clientY - rect.top) / canvas.height;
            setParams(prev => {
                const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
                let newZoom = prev.zoom * zoomFactor;
                if (newZoom > 82500) newZoom = 82500;
                if (newZoom < 0.01) newZoom = 0.01;
                // Zoom towards mouse
                const scale = 3.0 / prev.zoom;
                const cx = prev.centerX + (x - 0.5) * scale;
                const cy = prev.centerY + (y - 0.5) * scale;
                const newScale = 3.0 / newZoom;
                const newCenterX = cx - (x - 0.5) * newScale;
                const newCenterY = cy - (y - 0.5) * newScale;
                return { ...prev, zoom: newZoom, centerX: newCenterX, centerY: newCenterY };
            });
        };
        const handleDown = e => {
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        };
        const handleUp = () => { dragging = false; };
        const handleMove = e => {
            if (!dragging) return;
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            setParams(prev => {
                const scale = 3.0 / prev.zoom;
                const dRe = -dx / canvas.width * scale;
                const dIm = dy / canvas.height * scale;
                return { ...prev, centerX: prev.centerX + dRe, centerY: prev.centerY + dIm };
            });
        };
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('mousedown', handleDown);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('mousemove', handleMove);
        return () => {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('mousedown', handleDown);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('mousemove', handleMove);
        };
    }, [canvasRef]);

    const size = isSmall ? 320 : 600;
    return (
        <div>
            {glError && <div style={{ color: 'red', margin: '1em', textAlign: 'center' }}>{glError}</div>}
            <h1 style={{ textAlign: 'center', margin: '1em 0' }}>Mandelbrot Set WebGL (GPU)</h1>
            <div style={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'flex-start', justifyContent: 'center', gap: '20px', background: '#f7f7fa', padding: isSmall ? '0 12px' : undefined }}>
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '2em 1.5em', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1em', minWidth: '300px', maxWidth: '340px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', width: '100%' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ minWidth: 80, textAlign: 'right' }}>Color 1:</span>
                            <input type="color" value={color1} onChange={e => setColor1(e.target.value)} style={{ flex: 1 }} />
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ minWidth: 80, textAlign: 'right' }}>Color 2:</span>
                            <input type="color" value={color2} onChange={e => setColor2(e.target.value)} style={{ flex: 1 }} />
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ minWidth: 80, textAlign: 'right' }}>Color 3:</span>
                            <input type="color" value={color3} onChange={e => setColor3(e.target.value)} style={{ flex: 1 }} />
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ minWidth: 80, textAlign: 'right' }}>Center X:</span>
                            <input type="number" name="centerX" value={params.centerX} step="0.01" onChange={handleChange} style={{ flex: 1 }} />
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ minWidth: 80, textAlign: 'right' }}>Center Y:</span>
                            <input type="number" name="centerY" value={params.centerY} step="0.01" onChange={handleChange} style={{ flex: 1 }} />
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ minWidth: 80, textAlign: 'right' }}>Zoom:</span>
                            <input type="number" name="zoom" value={params.zoom} min="0.01" max="82500" step="0.1" onChange={handleChange} style={{ flex: 1 }} />
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ minWidth: 80, textAlign: 'right' }}>Max Iter:</span>
                            <input type="number" name="maxIter" value={params.maxIter} min="10" max="1000" step="10" onChange={handleChange} style={{ flex: 1 }} />
                        </label>
                    </div>
                    <button onClick={handleResetView} style={{ marginTop: 16, padding: '0.5em 1.5em', width: '100%' }}>Reset View</button>
                    <button
                        style={{ marginTop: 16, padding: '0.5em 1.5em', width: '100%', background: 'red', color: 'white', fontWeight: 'bold', fontSize: '1em', border: 'none', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                        onClick={() => onRequestCPU && onRequestCPU({
                            ...params,
                            color1,
                            color2,
                            color3
                        })}
                    >
                        More Zoom 64bit calcule
                    </button>
                    <button onClick={() => navigate('/mandelbrot-cpu')} style={{ marginTop: 8, padding: '0.5em 1.5em', width: '100%' }}>
                        Switch to High Precision (CPU)
                    </button>
                </div>
                <canvas ref={canvasRef} width={size} height={size} style={{ border: '1px solid #ccc', background: 'black', margin: isSmall ? '0 auto 1em' : '0 0 1em 0' }} />
            </div>
        </div>
    );
}

export default MandelbrotWebGLPage;
