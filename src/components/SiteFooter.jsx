import React from 'react';

export default function SiteFooter() {
    const wrapper = {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        padding: '0.8em 0.8em',
        textAlign: 'center',
        color: '#455a64',
        borderTop: '1px solid #e5e7eb',
        background: 'linear-gradient(90deg, #fafafa 0%, #f5f7fa 100%)',
        zIndex: 900,
    };
    const link = {
        color: '#1976d2',
        textDecoration: 'none',
        margin: '0 0.6em',
    };
    const small = { fontSize: '0.9em' };

    return (
        <footer style={wrapper} role="contentinfo">
            <div style={small}>
                © 2025 Hicham Bouchikhi (Esperadoce) · Licensed under <a href="/LICENSE.txt" style={link}>Apache-2.0</a>
                <span aria-hidden> · </span>
                <a href="/NOTICE.txt" style={link}>NOTICE</a>
                <span aria-hidden> · </span>
                <a href="https://github.com/Esperadoce/ChaosSimulation" target="_blank" rel="noopener noreferrer" style={link}>GitHub</a>
                <span aria-hidden> · </span>
                <a href="https://chaos-simulation.narexil.tech/" target="_blank" rel="noopener noreferrer" style={link}>Live Demo</a>
            </div>
        </footer>
    );
}
