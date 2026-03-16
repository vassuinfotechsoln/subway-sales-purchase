import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAppContext();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const res = login(email, password, rememberMe);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.msg);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel animate-scale-up">
                <div className="auth-header">
                    <div className="auth-logo">
                        <ShieldCheck size={32} color="var(--primary)" />
                    </div>
                    <h1>Vassu ERP</h1>
                    <p>Enter credentials to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="input-group">
                        <label><Mail size={16} /> Email Address</label>
                        <input
                            type="email"
                            className="input-control"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label><Lock size={16} /> Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: '44px' }}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="auth-meta">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            /> Remember me
                        </label>
                        <a href="#" className="forgot-link">Forgot Password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Sign In <ArrowRight size={18} />
                    </button>

                    <div className="demo-creds">
                        <p>Admin: <strong>admin@vassu.com</strong> / <strong>admin123</strong></p>
                        <p>Baker Street: <strong>bakerst@store.com</strong> / <strong>BakerSt@123</strong></p>
                        <p>Camden: <strong>camden@store.com</strong> / <strong>Camden@123</strong></p>
                    </div>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/signup">Create account</Link></p>
                </div>
            </div>
        </div>
    );
}
