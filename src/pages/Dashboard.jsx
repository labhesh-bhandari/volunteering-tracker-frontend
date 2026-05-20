import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function ProgressCard({ icon, title, done, total, color, gradient }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="stat-card" style={{ '--card-color': color }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: gradient, borderRadius: '16px 16px 0 0' }} />
      <div className="stat-card-header">
        <div className="stat-icon" style={{ background: `${color}22` }}>{icon}</div>
        <span className="stat-title">{title}</span>
      </div>
      <div className="progress-wrap">
        <div className="progress-count">
          <span className="progress-num" style={{ color }}>{done}</span>
          <span className="progress-denom">/ {total} days</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: gradient }} />
        </div>
        <div className="progress-label">{pct}% completion rate</div>
      </div>
    </div>
  );
}

function NumCard({ icon, title, total, avg, totalLabel, avgLabel, color, gradient, unit = '' }) {
  return (
    <div className="stat-card">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: gradient, borderRadius: '16px 16px 0 0' }} />
      <div className="stat-card-header">
        <div className="stat-icon" style={{ background: `${color}22` }}>{icon}</div>
        <span className="stat-title">{title}</span>
      </div>
      <div className="num-stat-row">
        <div className="num-stat-box" style={{ border: `1px solid ${color}33` }}>
          <div className="num-stat-val" style={{ color }}>{total}{unit}</div>
          <div className="num-stat-lbl">{totalLabel}</div>
        </div>
        <div className="num-stat-box" style={{ border: `1px solid ${color}33` }}>
          <div className="num-stat-val" style={{ color }}>{avg}{unit}</div>
          <div className="num-stat-lbl">{avgLabel}</div>
        </div>
      </div>
    </div>
  );
}

function AvgCard({ icon, title, avg, label, color, gradient, children }) {
  return (
    <div className="stat-card">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: gradient, borderRadius: '16px 16px 0 0' }} />
      <div className="stat-card-header">
        <div className="stat-icon" style={{ background: `${color}22` }}>{icon}</div>
        <span className="stat-title">{title}</span>
      </div>
      <div className="progress-count" style={{ marginTop: '4px' }}>
        <span className="progress-num" style={{ color }}>{avg}</span>
        <span className="progress-denom">/ 5</span>
      </div>
      <div className="rating-display">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className="rating-star" style={{ opacity: i <= Math.round(avg) ? 1 : 0.2 }}>⭐</span>
        ))}
      </div>
      <div className="progress-label" style={{ marginTop: '10px' }}>{label}</div>
      {children}
    </div>
  );
}

function SimpleAvgCard({ icon, title, avg, unit, label, color, gradient }) {
  return (
    <div className="stat-card">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: gradient, borderRadius: '16px 16px 0 0' }} />
      <div className="stat-card-header">
        <div className="stat-icon" style={{ background: `${color}22` }}>{icon}</div>
        <span className="stat-title">{title}</span>
      </div>
      <div className="progress-count" style={{ marginTop: '8px', alignItems: 'baseline' }}>
        <span className="progress-num" style={{ color }}>{avg}</span>
        <span className="progress-denom">{unit}</span>
      </div>
      <div className="progress-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/tracks/stats');
        setStats(data);
        setError('');
      } catch {
        setError('Failed to load stats. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const hasData = stats && stats.total > 0;
  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="dashboard-header">
          <p style={{ fontSize: '18px', fontWeight: 500, color: 'var(--accent-light)', marginBottom: '4px' }}>Jai Gurudev, {firstName} 🙏</p>
          <h1>Your Sadhana Dashboard 🌟</h1>
          <p>Track your spiritual progress and build consistent daily practices.</p>
          <button className="fill-btn" onClick={() => navigate('/fill-tracker')}>
            <span>✍️</span> Fill Tracker
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            Loading your stats...
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        {!loading && !error && !hasData && (
          <div className="stats-grid">
            <div className="empty-state">
              <div className="empty-icon">🌱</div>
              <h3>Your journey begins today!</h3>
              <p>Fill your first tracker to see your stats appear here.</p>
            </div>
          </div>
        )}

        {!loading && hasData && (
          <>
            <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              📊 Stats based on <strong style={{ color: 'var(--text-primary)' }}>{stats.total}</strong> filled days
            </div>
            <div className="stats-grid">
              <ProgressCard
                icon="🧘" title="Kriya"
                done={stats.kriya.done} total={stats.kriya.total}
                color="var(--accent)" gradient="linear-gradient(90deg,#7c5cfc,#9d82ff)"
              />
              <ProgressCard
                icon="🪷" title="Padmasadhana"
                done={stats.padmasadhana.done} total={stats.padmasadhana.total}
                color="var(--pink)" gradient="linear-gradient(90deg,#f472b6,#f9a8d4)"
              />
              <NumCard
                icon="🧘‍♀️" title="Meditations"
                total={stats.numberOfMeditations.total}
                avg={stats.numberOfMeditations.average}
                totalLabel="Total Sessions" avgLabel="Avg / Day"
                color="var(--blue)" gradient="linear-gradient(90deg,#38bdf8,#7dd3fc)"
              />
              <ProgressCard
                icon="🌊" title="Intuition Process / Yoga Nidra"
                done={stats.intuitionProcess.done} total={stats.intuitionProcess.total}
                color="var(--teal)" gradient="linear-gradient(90deg,#2dd4bf,#5eead4)"
              />
              <NumCard
                icon="🏃" title="Outdoor Play / Exercise"
                total={stats.outdoorPlay.total}
                avg={stats.outdoorPlay.average}
                totalLabel="Total Hours" avgLabel="Avg Hrs / Day"
                color="var(--green)" gradient="linear-gradient(90deg,#22d3a0,#6ee7b7)"
                unit="h"
              />
              <ProgressCard
                icon="📿" title="Japa"
                done={stats.japa.done} total={stats.japa.total}
                color="var(--gold)" gradient="linear-gradient(90deg,#f5c842,#fde68a)"
              />
              <AvgCard
                icon="🥗" title="Sattvik Food"
                avg={stats.sattvikFood.average}
                label="Average sattvik score out of 5"
                color="var(--green)" gradient="linear-gradient(90deg,#22d3a0,#6ee7b7)"
              />
              <SimpleAvgCard
                icon="📱" title="Screen Time"
                avg={stats.screenTime.average}
                unit=" hrs/day" label="Average daily screen time"
                color="var(--red)" gradient="linear-gradient(90deg,#ff5f7e,#fca5a5)"
              />
              <SimpleAvgCard
                icon="💧" title="Water Intake"
                avg={stats.waterIntake.average}
                unit=" L/day" label="Average daily water consumption"
                color="var(--blue)" gradient="linear-gradient(90deg,#38bdf8,#7dd3fc)"
              />
              <div className="stat-card">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#7c5cfc,#2dd4bf)', borderRadius: '16px 16px 0 0' }} />
                <div className="stat-card-header">
                  <div className="stat-icon" style={{ background: 'rgba(124,92,252,0.13)' }}>🌙</div>
                  <span className="stat-title">Sleep Before 11:30 PM</span>
                </div>
                <div className="progress-wrap">
                  <div className="progress-count">
                    <span className="progress-num" style={{ color: 'var(--accent)' }}>{stats.sleep.beforeCutoff}</span>
                    <span className="progress-denom">/ {stats.sleep.total} days</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${stats.sleep.total > 0 ? Math.round((stats.sleep.beforeCutoff / stats.sleep.total) * 100) : 0}%`, background: 'linear-gradient(90deg,#7c5cfc,#2dd4bf)' }} />
                  </div>
                  <div className="progress-label">
                    {stats.sleep.total > 0 ? Math.round((stats.sleep.beforeCutoff / stats.sleep.total) * 100) : 0}% of nights slept before 11:30 PM
                  </div>
                </div>
              </div>
              {stats.bms && (
                <AvgCard
                  icon="🧬" title="B.M.S (Body-Mind-Spirit)"
                  avg={stats.bms.average}
                  label="Average Body-Mind-Spirit score out of 5"
                  color="var(--orange)" gradient="linear-gradient(90deg,#fb923c,#fdba74)"
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
