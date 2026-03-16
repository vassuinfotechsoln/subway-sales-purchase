import React from 'react';
import { AlertTriangle, X, Info, AlertCircle, LogOut } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertTriangle size={32} />;
            case 'warning': return <AlertCircle size={32} />;
            case 'info': return <Info size={32} />;
            case 'logout': return <LogOut size={32} />;
            default: return <AlertCircle size={32} />;
        }
    };

    const getColor = () => {
        switch (type) {
            case 'danger': return 'var(--danger)';
            case 'warning': return 'var(--warning)';
            case 'info': return 'var(--primary)';
            case 'logout': return 'var(--danger)';
            default: return 'var(--primary)';
        }
    };

    const getGlow = () => {
        switch (type) {
            case 'danger': return 'rgba(239, 68, 68, 0.15)';
            case 'warning': return 'rgba(245, 158, 11, 0.15)';
            case 'info': return 'rgba(99, 102, 241, 0.15)';
            case 'logout': return 'rgba(239, 68, 68, 0.15)';
            default: return 'rgba(99, 102, 241, 0.15)';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div
                className="modal-content animate-fade-in"
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '440px',
                    textAlign: 'center',
                    padding: '44px 32px 32px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Visual Accent Glow */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '200px',
                    height: '100px',
                    background: `radial-gradient(circle, ${getGlow()} 0%, transparent 70%)`,
                    zIndex: 0
                }}></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <X size={20} />
                </button>

                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    marginBottom: '12px',
                    color: 'var(--text-main)',
                    letterSpacing: '-0.02em',
                    position: 'relative',
                    zIndex: 1,
                    marginTop: '20px'
                }}>
                    {title}
                </h2>

                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    marginBottom: '36px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
                    <button
                        className="btn"
                        style={{
                            flex: 1,
                            background: 'var(--bg-card-hover)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-main)',
                            fontWeight: '600'
                        }}
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="btn"
                        style={{
                            flex: 1.2,
                            background: type === 'info' ? 'var(--primary)' : 'var(--danger)',
                            color: 'white',
                            fontWeight: '700',
                            boxShadow: `0 8px 16px -4px ${type === 'info' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                        }}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
