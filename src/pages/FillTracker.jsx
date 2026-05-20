import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

// ── Helpers ────────────────────────────────────────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isFuture(date) {
  const today = new Date(); today.setHours(0,0,0,0);
  const cmp = new Date(date); cmp.setHours(0,0,0,0);
  return cmp > today;
}

function formatDisplayDate(isoStr) {
  const [y, m, d] = isoStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Calendar Component ─────────────────────────────────────
function Calendar({ selected, onChange, filledDates }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const prevMonth = () => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
  const nextMonth = () => {
    const next = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    if (next <= today) setView(next);
  };

  const firstDay = view.getDay();
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.getFullYear(), view.getMonth(), d));

  const canGoNext = new Date(view.getFullYear(), view.getMonth() + 1, 1) <= today;

  return (
    <div className="calendar-card">
      <div className="calendar-nav">
        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
        <h2>{MONTHS[view.getMonth()]} {view.getFullYear()}</h2>
        <button className="cal-nav-btn" onClick={nextMonth} disabled={!canGoNext} style={{ opacity: canGoNext ? 1 : 0.3 }}>›</button>
      </div>
      <div className="calendar-grid">
        {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="cal-day empty" />;
          const iso = toLocalISO(date);
          const future = isFuture(date);
          const isToday = toLocalISO(date) === toLocalISO(today);
          const isSel = selected === iso;
          const hasFill = filledDates.includes(iso);
          let cls = 'cal-day';
          if (future) cls += ' disabled';
          if (isToday) cls += ' today';
          if (isSel) cls += ' selected';
          if (hasFill) cls += ' has-entry';
          return (
            <div key={iso} className={cls} onClick={() => !future && onChange(iso)} title={hasFill ? 'Already filled' : ''}>
              {date.getDate()}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '16px', display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'var(--green)', marginRight:5 }}/>Already filled</span>
        <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', border:'1.5px solid var(--green)', marginRight:5 }}/>Today</span>
      </div>
    </div>
  );
}

// ── Toggle (Done / Not Done) ───────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div className="toggle-group">
      <button type="button" className={`toggle-btn ${value === 'Done' ? 'active-done' : ''}`} onClick={() => onChange('Done')}>✅ Done</button>
      <button type="button" className={`toggle-btn ${value === 'Not Done' ? 'active-not' : ''}`} onClick={() => onChange('Not Done')}>❌ Not Done</button>
    </div>
  );
}

// ── Star Rating ────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div>
      <div className="star-group">
        {[0,1,2,3,4,5].map(n => (
          <button key={n} type="button" className="star-btn"
            onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            style={{ opacity: n === 0 ? (value === 0 ? 1 : 0.4) : (n <= (hover || value) ? 1 : 0.25) }}
          >
            {n === 0 ? '🚫' : '⭐'}
          </button>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
        {value === 0 ? 'Completely junk' : value === 5 ? 'Completely sattvik' : `Score: ${value}/5`}
      </div>
    </div>
  );
}

// ── Beautiful Time Picker ──────────────────────────────────
function TimePicker({ value, onChange }) {
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [period, setPeriod] = useState('PM');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      const p = h >= 12 ? 'PM' : 'AM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      setHour(String(h12));
      setMinute(String(m).padStart(2, '0'));
      setPeriod(p);
    }
  }, []);

  const emitChange = (h, m, p) => {
    if (h === '' || m === '') return;
    let h24 = parseInt(h);
    if (p === 'AM' && h24 === 12) h24 = 0;
    if (p === 'PM' && h24 !== 12) h24 += 12;
    onChange(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const handleHour = (val) => {
    const n = parseInt(val);
    if (val === '' || (n >= 1 && n <= 12)) {
      setHour(val);
      emitChange(val, minute, period);
    }
  };

  const handleMinute = (val) => {
    const n = parseInt(val);
    if (val === '' || (n >= 0 && n <= 59)) {
      setMinute(val);
      emitChange(hour, val, period);
    }
  };

  const handlePeriod = (p) => {
    setPeriod(p);
    emitChange(hour, minute, p);
  };

  const getLabel = () => {
    if (!value) return 'Select your sleep time';
    const [h, m] = value.split(':').map(Number);
    const isLate = h >= 23 && m > 30 || h >= 0 && h < 6;
    const isEarly = h >= 20 && h <= 22;
    if (isEarly) return '🌟 Great! Early to bed';
    if (h === 23 && m <= 30) return '😊 Right on time';
    if (isLate) return '🦉 Quite late — try sleeping earlier';
    return '🌙 Sleep well!';
  };

  return (
    <div className="time-picker-custom">
      <div className="time-picker-row">
        <div className="time-picker-field">
          <label className="time-picker-label">Hour</label>
          <input type="number" className="time-picker-input" placeholder="--" min="1" max="12"
            value={hour} onChange={e => handleHour(e.target.value)} />
        </div>
        <div className="time-picker-sep">:</div>
        <div className="time-picker-field">
          <label className="time-picker-label">Min</label>
          <input type="number" className="time-picker-input" placeholder="--" min="0" max="59"
            value={minute} onChange={e => handleMinute(e.target.value)} />
        </div>
        <div className="time-picker-ampm">
          <button type="button" className={`ampm-btn ${period === 'AM' ? 'active' : ''}`} onClick={() => handlePeriod('AM')}>AM</button>
          <button type="button" className={`ampm-btn ${period === 'PM' ? 'active' : ''}`} onClick={() => handlePeriod('PM')}>PM</button>
        </div>
      </div>
      <div className="time-picker-hint">{getLabel()}</div>
    </div>
  );
}

// ── Initial form state ─────────────────────────────────────
const INIT = {
  kriya: '', padmasadhana: '', numberOfMeditations: '',
  intuitionProcess: '', outdoorPlay: '', japa: '',
  sattvikFood: null, screenTime: '', waterIntake: '', sleepTime: '',
  bms: null,
};

// ── Main Page ──────────────────────────────────────────────
export default function FillTracker() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = calendar, 2 = questions
  const [selectedDate, setSelectedDate] = useState(''); // NO default
  const [filledDates, setFilledDates] = useState([]);
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/tracks/dates').then(({ data }) => setFilledDates(data)).catch(() => {});
  }, []);

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.kriya) e.kriya = 'Please select an option';
    if (!form.padmasadhana) e.padmasadhana = 'Please select an option';
    if (form.numberOfMeditations === '' || form.numberOfMeditations < 0) e.numberOfMeditations = 'Enter a valid number';
    if (!form.intuitionProcess) e.intuitionProcess = 'Please select an option';
    if (form.outdoorPlay === '' || form.outdoorPlay < 0) e.outdoorPlay = 'Enter valid hours';
    if (!form.japa) e.japa = 'Please select an option';
    if (form.sattvikFood === null) e.sattvikFood = 'Please rate your food';
    if (form.screenTime === '' || form.screenTime < 0) e.screenTime = 'Enter valid hours';
    if (form.waterIntake === '' || form.waterIntake < 0) e.waterIntake = 'Enter valid litres';
    if (!form.sleepTime) e.sleepTime = 'Please enter sleep time';
    if (form.bms === null || form.bms === undefined) e.bms = 'Please rate your B.M.S score';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true); setSubmitError('');
    try {
      await api.post('/tracks', { ...form, date: selectedDate });
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to save. Please try again.');
      setSubmitting(false);
    }
  };

  const already = selectedDate && filledDates.includes(selectedDate);
  const noDateSelected = !selectedDate;

  return (
    <>
      <Navbar />
      <div className="tracker-page">
        <div className="tracker-container">
          <div className="tracker-header">
            <h1>{step === 1 ? '📅 Select Date' : '✍️ Daily Tracker'}</h1>
            <p>{step === 1 ? 'Choose the date you want to fill the tracker for' : 'Answer all questions honestly for your chosen date'}</p>
          </div>

          {/* Step dots */}
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`} />
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
          </div>

          {/* Step 1: Calendar */}
          {step === 1 && (
            <div>
              <Calendar selected={selectedDate} onChange={setSelectedDate} filledDates={filledDates} />
              {already && (
                <div style={{ marginTop: '14px', background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.3)', borderRadius: '10px', padding: '12px 16px', color: 'var(--gold)', fontSize: '14px' }}>
                  ⚠️ You've already filled the tracker for this date.
                </div>
              )}
              <div className="calendar-footer" style={{ marginTop: '20px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ marginRight: '12px', width: 'auto' }}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={() => setStep(2)} disabled={already || noDateSelected}>
                  {noDateSelected ? 'Select a date' : 'Next →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Questions */}
          {step === 2 && (
            <div className="questions-card">
              <div style={{ marginBottom: '20px', padding: '10px 14px', background: 'rgba(124,92,252,0.08)', borderRadius: '10px', fontSize: '13px', color: 'var(--accent-light)' }}>
                📅 Filling tracker for: <strong>{formatDisplayDate(selectedDate)}</strong>
              </div>

              {submitError && <div className="error-msg">⚠️ {submitError}</div>}

              {/* Q1: Kriya */}
              <div className="question-item">
                <div className="question-label"><span className="q-num">1</span> Kriya</div>
                <Toggle value={form.kriya} onChange={v => set('kriya', v)} />
                {errors.kriya && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.kriya}</div>}
              </div>
              <div className="q-divider" />

              {/* Q2: Padmasadhana */}
              <div className="question-item">
                <div className="question-label"><span className="q-num">2</span> Padmasadhana</div>
                <Toggle value={form.padmasadhana} onChange={v => set('padmasadhana', v)} />
                {errors.padmasadhana && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.padmasadhana}</div>}
              </div>
              <div className="q-divider" />

              {/* Q3: Meditations */}
              <div className="question-item">
                <div className="question-label"><span className="q-num">3</span> Number of Meditations</div>
                <input type="number" className="num-input" placeholder="e.g. 2" min="0"
                  value={form.numberOfMeditations} onChange={e => set('numberOfMeditations', e.target.value)} />
                {errors.numberOfMeditations && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.numberOfMeditations}</div>}
              </div>
              <div className="q-divider" />

              {/* Q4: Intuition Process */}
              <div className="question-item">
                <div className="question-label"><span className="q-num">4</span> Intuition Process / Yoga Nidra</div>
                <Toggle value={form.intuitionProcess} onChange={v => set('intuitionProcess', v)} />
                {errors.intuitionProcess && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.intuitionProcess}</div>}
              </div>
              <div className="q-divider" />

              {/* Q5: Outdoor Play */}
              <div className="question-item">
                <div className="question-label"><span className="q-num">5</span> Outdoor Play / Exercise <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(hours)</span></div>
                <input type="number" className="num-input" placeholder="e.g. 1.5" min="0" step="0.5"
                  value={form.outdoorPlay} onChange={e => set('outdoorPlay', e.target.value)} />
                {errors.outdoorPlay && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.outdoorPlay}</div>}
              </div>
              <div className="q-divider" />

              {/* Q6: Japa */}
              <div className="question-item">
                <div className="question-label"><span className="q-num">6</span> Japa</div>
                <Toggle value={form.japa} onChange={v => set('japa', v)} />
                {errors.japa && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.japa}</div>}
              </div>
              <div className="q-divider" />

              {/* Q7: Sattvik Food */}
              <div className="question-item">
                <div className="question-label"><span className="q-num">7</span> Sattvik Food <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(0 = junk → 5 = fully sattvik)</span></div>
                <StarRating value={form.sattvikFood ?? 0} onChange={v => set('sattvikFood', v)} />
                {errors.sattvikFood && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.sattvikFood}</div>}
              </div>
              <div className="q-divider" />

              {/* Q8: Screen Time */}
              <div className="question-item">
                <div className="question-label"><span className="q-num">8</span> Screen Time <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(hours)</span></div>
                <input type="number" className="num-input" placeholder="e.g. 3" min="0" step="0.5"
                  value={form.screenTime} onChange={e => set('screenTime', e.target.value)} />
                {errors.screenTime && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.screenTime}</div>}
              </div>
              <div className="q-divider" />

              {/* Q9: Water Intake */}
              <div className="question-item">
                <div className="question-label"><span className="q-num">9</span> Water Intake <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(litres)</span></div>
                <input type="number" className="num-input" placeholder="e.g. 2.5" min="0" step="0.25"
                  value={form.waterIntake} onChange={e => set('waterIntake', e.target.value)} />
                {errors.waterIntake && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.waterIntake}</div>}
              </div>
              <div className="q-divider" />

              {/* Q10: Sleep Time */}
              <div className="question-item">
                <div className="question-label"><span className="q-num">10</span> Sleep Time <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(time you went to sleep)</span></div>
                <TimePicker value={form.sleepTime} onChange={v => set('sleepTime', v)} />
                {errors.sleepTime && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.sleepTime}</div>}
              </div>
              <div className="q-divider" />

              {/* Q11: BMS */}
              <div className="question-item">
                <div className="question-label"><span className="q-num">11</span> B.M.S (Body-Mind-Spirit) <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(rate 1-5)</span></div>
                <div className="star-group">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" className="star-btn"
                      onClick={() => set('bms', n)}
                      style={{ opacity: n <= (form.bms || 0) ? 1 : 0.25 }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {!form.bms ? 'Select a score' : `Score: ${form.bms}/5`}
                </div>
                {errors.bms && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.bms}</div>}
              </div>

              <div className="questions-footer">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? '⏳ Saving...' : '🌟 Submit Tracker'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
