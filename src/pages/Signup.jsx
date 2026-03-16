import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAppContext();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const res = signup({ name, email, password });
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
                    <h1>Create Account</h1>
                    <p>Join Vassu InfoTech ERP ecosystem</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="input-group">
                        <label><User size={16} /> Full Name</label>
                        <input
                            type="text"
                            className="input-control"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label><Mail size={16} /> Email Address</label>
                        <input
                            type="email"
                            className="input-control"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label><Lock size={16} /> Create Password</label>
                        <input
                            type="password"
                            className="input-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '20px' }}>
                        Get Started <ArrowRight size={18} />
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}
