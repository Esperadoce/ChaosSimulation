import PendulumPage from './PendulumPage';
import LorenzAttractorPage from './LorenzAttractorPage';
import ThreeBodyPage from './ThreeBodyPage';
import MandelbrotPage from './MandelbrotWebGLPage';
import MandelbrotCpuPage from './MandelbrotCpuPage';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import GitHubBadge from './components/GitHubBadge';
import SiteFooter from './components/SiteFooter';

function App() {
    // Mandelbrot parameter passing (if needed in future)
    // const [mandelbrotParams, setMandelbrotParams] = useState(null);

    // Helper to get current path for nav highlighting
    function Nav() {
        const location = useLocation();
        const path = location.pathname;
        return (
            <nav
                style={{
                    position: 'relative',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 10,
                    textAlign: 'center',
                    margin: '0 0 2em 0',
                    background: 'linear-gradient(90deg, #e3f2fd 0%, #fce4ec 100%)',
                    borderRadius: '1.2em',
                    boxShadow: '0 2px 12px #0001',
                    padding: '1em 0.4em',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2em',
                    fontSize: '1em',
                }}
                aria-label="Main navigation"
            >
                <Link to="/" style={{
                    padding: '0.56em 1.76em',
                    borderRadius: '1em',
                    fontWeight: path === '/' ? 'bold' : 'normal',
                    textDecoration: 'none',
                    color: path === '/' ? '#fff' : '#1976d2',
                    background: path === '/' ? '#1976d2' : 'transparent',
                    boxShadow: path === '/' ? '0 2px 8px #1976d255' : 'none',
                    transition: 'all 0.2s',
                    fontSize: '0.88em',
                    letterSpacing: '0.02em',
                }}>Double Pendulum</Link>
                <Link to="/lorenz" style={{
                    padding: '0.56em 1.76em',
                    borderRadius: '1em',
                    fontWeight: path === '/lorenz' ? 'bold' : 'normal',
                    textDecoration: 'none',
                    color: path === '/lorenz' ? '#fff' : '#1976d2',
                    background: path === '/lorenz' ? '#1976d2' : 'transparent',
                    boxShadow: path === '/lorenz' ? '0 2px 8px #1976d255' : 'none',
                    transition: 'all 0.2s',
                    fontSize: '0.88em',
                    letterSpacing: '0.02em',
                }}>Lorenz Attractor</Link>
                <Link to="/threebody" style={{
                    padding: '0.56em 1.76em',
                    borderRadius: '1em',
                    fontWeight: path === '/threebody' ? 'bold' : 'normal',
                    textDecoration: 'none',
                    color: path === '/threebody' ? '#fff' : '#1976d2',
                    background: path === '/threebody' ? '#1976d2' : 'transparent',
                    boxShadow: path === '/threebody' ? '0 2px 8px #1976d255' : 'none',
                    transition: 'all 0.2s',
                    fontSize: '0.88em',
                    letterSpacing: '0.02em',
                }}>Three-Body Problem</Link>
                <Link to="/mandelbrot" style={{
                    padding: '0.56em 1.76em',
                    borderRadius: '1em',
                    fontWeight: path === '/mandelbrot' ? 'bold' : 'normal',
                    textDecoration: 'none',
                    color: path === '/mandelbrot' ? '#fff' : '#1976d2',
                    background: path === '/mandelbrot' ? '#1976d2' : 'transparent',
                    boxShadow: path === '/mandelbrot' ? '0 2px 8px #1976d255' : 'none',
                    transition: 'all 0.2s',
                    fontSize: '0.88em',
                    letterSpacing: '0.02em',
                }}>Mandelbrot Set</Link>
            </nav>
        );
    }

    return (
        <Router>
            <Nav />
            <Routes>
                <Route path="/" element={<PendulumPage />} />
                <Route path="/DoublePendulum" element={<PendulumPage />} />
                <Route path="/lorenz" element={<LorenzAttractorPage />} />
                <Route path="/threebody" element={<ThreeBodyPage />} />
                <Route path="/mandelbrot" element={<MandelbrotPage />} />
                <Route path="/mandelbrot-cpu" element={<MandelbrotCpuPage />} />
            </Routes>
            <SiteFooter />
            <GitHubBadge />
        </Router>
    );
}

export default App;
