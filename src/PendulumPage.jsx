import { useState } from 'react';
import useIsSmallScreen from './hooks/useIsSmallScreen';
import DoublePendulum from './components/DoublePendulum';

export default function PendulumPage() {
    const isSmall = useIsSmallScreen(820);
    // Shared state for both pendulums except angles
    const [shared, setShared] = useState({
        rod1Length: 150,
        rod2Length: 150,
        mass1: 10,
        mass2: 10,
        acceleration: 5,
    });
    const [angles1, setAngles1] = useState({ angle1: 121.00, angle2: 45.01 });
    const [angles2, setAngles2] = useState({ angle1: 120.00, angle2: 45.01 });
    const [running, setRunning] = useState(true);

    function handleSharedChange(name, value) {
        setShared(p => ({ ...p, [name]: value }));
    }
    function handleAngles1Change(name, value) {
        setAngles1(p => ({ ...p, [name]: value }));
    }
    function handleAngles2Change(name, value) {
        setAngles2(p => ({ ...p, [name]: value }));
    }

    const columnStyle = isSmall
        ? { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }
        : { display: 'flex', justifyContent: 'center', gap: 40 };

    const canvasSize = isSmall ? 340 : 700;

    return (
        <div style={{ textAlign: 'center', maxWidth: 1100, margin: '0 auto', padding: '0 12px' }}>
            <h1>Double Pendulum Simulation</h1>
            <div style={columnStyle}>
                <div>
                    <DoublePendulum
                        rod1Length={shared.rod1Length}
                        rod2Length={shared.rod2Length}
                        mass1={shared.mass1}
                        mass2={shared.mass2}
                        angle1={angles1.angle1}
                        angle2={angles1.angle2}
                        acceleration={shared.acceleration}
                        width={canvasSize}
                        height={canvasSize}
                        running={running}
                        setRunning={setRunning}
                    />
                    <div style={{ marginTop: 16 }}>
                        <label>Angle 1 (deg):
                            <input type="number" min="0" max="180" step="0.01" value={angles1.angle1} onChange={e => handleAngles1Change('angle1', parseFloat(e.target.value))} style={{ marginLeft: 8, width: 80 }} />
                        </label>
                        <label style={{ marginLeft: 16 }}>Angle 2 (deg):
                            <input type="number" min="0" max="180" step="0.01" value={angles1.angle2} onChange={e => handleAngles1Change('angle2', parseFloat(e.target.value))} style={{ marginLeft: 8, width: 80 }} />
                        </label>
                    </div>
                </div>
                <div>
                    <DoublePendulum
                        rod1Length={shared.rod1Length}
                        rod2Length={shared.rod2Length}
                        mass1={shared.mass1}
                        mass2={shared.mass2}
                        angle1={angles2.angle1}
                        angle2={angles2.angle2}
                        acceleration={shared.acceleration}
                        width={canvasSize}
                        height={canvasSize}
                        running={running}
                        setRunning={setRunning}
                    />
                    <div style={{ marginTop: 16 }}>
                        <label>Angle 1 (deg):
                            <input type="number" min="0" max="180" step="0.01" value={angles2.angle1} onChange={e => handleAngles2Change('angle1', parseFloat(e.target.value))} style={{ marginLeft: 8, width: 80 }} />
                        </label>
                        <label style={{ marginLeft: 16 }}>Angle 2 (deg):
                            <input type="number" min="0" max="180" step="0.01" value={angles2.angle2} onChange={e => handleAngles2Change('angle2', parseFloat(e.target.value))} style={{ marginLeft: 8, width: 80 }} />
                        </label>
                    </div>
                </div>
            </div>
            <div style={{ margin: '2em 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1em' }}>
                <label>Acceleration:
                    <input type="range" min="0.1" max="10" step="0.01" value={shared.acceleration} onChange={e => handleSharedChange('acceleration', parseFloat(e.target.value))} style={{ marginLeft: 8, width: 200 }} />
                    <span style={{ marginLeft: 16, fontWeight: 600 }}>{shared.acceleration.toFixed(2)}</span>
                </label>
                <label>Mass 1:
                    <input type="range" min="5" max="30" step="0.1" value={shared.mass1} onChange={e => handleSharedChange('mass1', parseFloat(e.target.value))} style={{ marginLeft: 8, width: 200 }} />
                    <span style={{ marginLeft: 16, fontWeight: 600 }}>{shared.mass1.toFixed(1)}</span>
                </label>
                <label>Mass 2:
                    <input type="range" min="5" max="30" step="0.1" value={shared.mass2} onChange={e => handleSharedChange('mass2', parseFloat(e.target.value))} style={{ marginLeft: 8, width: 200 }} />
                    <span style={{ marginLeft: 16, fontWeight: 600 }}>{shared.mass2.toFixed(1)}</span>
                </label>
                <label>Rod 1 Length:
                    <input type="range" min="50" max="250" step="0.1" value={shared.rod1Length} onChange={e => handleSharedChange('rod1Length', parseFloat(e.target.value))} style={{ marginLeft: 8, width: 200 }} />
                    <span style={{ marginLeft: 16, fontWeight: 600 }}>{shared.rod1Length.toFixed(1)}</span>
                </label>
                <label>Rod 2 Length:
                    <input type="range" min="50" max="250" step="0.1" value={shared.rod2Length} onChange={e => handleSharedChange('rod2Length', parseFloat(e.target.value))} style={{ marginLeft: 8, width: 200 }} />
                    <span style={{ marginLeft: 16, fontWeight: 600 }}>{shared.rod2Length.toFixed(1)}</span>
                </label>
            </div>
            <div style={{ marginBottom: 24 }}>
                <button onClick={() => setRunning(r => !r)} style={{ padding: '0.6em 2em', fontSize: '1em' }}>
                    {running ? 'Pause' : 'Resume'}
                </button>
            </div>
        </div>
    );
}
