import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FolderKanban, CheckSquare, Clock, AlertCircle, ArrowRight } from 'lucide-react';

const statusColors = { TODO: '#6b7280', IN_PROGRESS: '#7c6cfc', DONE: '#22d3a0' };

const priorityClass = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };
const statusClass = { TODO: 'todo', IN_PROGRESS: 'in_progress', DONE: 'done' };

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!data) return null;

  const { stats, overdueTasks, recentTasks } = data;

  const chartData = [
    { name: 'To Do', value: stats.todoTasks, color: '#6b7280' },
    { name: 'In Progress', value: stats.inProgressTasks, color: '#7c6cfc' },
    { name: 'Done', value: stats.doneTasks, color: '#22d3a0' },
  ];

  return (
    <>
      <div className="top-header">
        <h1 className="page-title">Dashboard</h1>
        <span className="text-sm text-muted">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="page-content">
        {/* KPI Cards */}
        <div className="grid-4 mb-6">
          <div className="stat-card accent">
            <div className="stat-icon accent"><FolderKanban size={22} /></div>
            <div>
              <div className="stat-value">{stats.totalProjects}</div>
              <div className="stat-label">Total Projects</div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon success"><CheckSquare size={22} /></div>
            <div>
              <div className="stat-value">{stats.totalTasks}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon warning"><Clock size={22} /></div>
            <div>
              <div className="stat-value">{stats.inProgressTasks}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon danger"><AlertCircle size={22} /></div>
            <div>
              <div className="stat-value">{stats.overdueCount}</div>
              <div className="stat-label">Overdue</div>
            </div>
          </div>
        </div>

        <div className="grid-2 mb-6" style={{ alignItems: 'start' }}>
          {/* Chart */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">Task Status Overview</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={40}>
                <XAxis dataKey="name" stroke="#55556a" fontSize={12} />
                <YAxis stroke="#55556a" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0f0ff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Overdue Tasks */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">⚠️ Overdue Tasks</h2>
              {overdueTasks.length > 0 && <span className="badge badge-high">{overdueTasks.length}</span>}
            </div>
            {overdueTasks.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">✅</div><h3>All caught up!</h3><p>No overdue tasks</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {overdueTasks.slice(0, 5).map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(239,68,68,0.05)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.1)' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{task.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{task.project?.name}</div>
                    </div>
                    <span className="overdue-badge">Due {formatDate(task.dueDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">Recent Tasks</h2>
            <Link to="/tasks" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={14} /></Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><h3>No tasks yet</h3></div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>Title</th><th>Project</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due</th></tr></thead>
                <tbody>
                  {recentTasks.map(task => (
                    <tr key={task.id}>
                      <td style={{ fontWeight: 500 }}>{task.title}</td>
                      <td><span className="tag">{task.project?.name}</span></td>
                      <td><span className={`badge badge-${statusClass[task.status]}`}>{task.status.replace('_', ' ')}</span></td>
                      <td><span className={`badge badge-${priorityClass[task.priority]}`}>{task.priority}</span></td>
                      <td>{task.assignee ? <div className="flex items-center gap-2"><div className="avatar sm">{task.assignee.name[0]}</div>{task.assignee.name}</div> : <span className="text-muted">—</span>}</td>
                      <td className="text-muted">{formatDate(task.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
