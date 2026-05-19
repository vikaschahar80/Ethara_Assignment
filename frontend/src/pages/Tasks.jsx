import { useEffect, useState } from 'react';
import { tasksAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Trash2, Filter } from 'lucide-react';

const statusLabel = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
const statusClass = { TODO: 'todo', IN_PROGRESS: 'in_progress', DONE: 'done' };
const priorityClass = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function Tasks() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  const fetchTasks = () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    tasksAPI.getAll(params).then(r => setTasks(r.data.tasks)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, [filters]);

  const handleStatusChange = async (id, status) => {
    await tasksAPI.update(id, { status });
    setTasks(t => t.map(x => x.id === id ? { ...x, status } : x));
    toast.success('Status updated');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await tasksAPI.delete(id);
    toast.success('Task deleted');
    setTasks(t => t.filter(x => x.id !== id));
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="top-header">
        <h1 className="page-title">All Tasks</h1>
        <div className="header-actions">
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          <select className="form-select" style={{ width: 'auto', padding: '6px 10px', fontSize: '0.82rem' }}
            value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <select className="form-select" style={{ width: 'auto', padding: '6px 10px', fontSize: '0.82rem' }}
            value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div className="page-content">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No tasks found</h3>
            <p>Create tasks from a project page</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Due Date</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                  return (
                    <tr key={task.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{task.title}</div>
                        {task.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{task.description.slice(0, 60)}…</div>}
                      </td>
                      <td><span className="tag">{task.project?.name}</span></td>
                      <td>
                        <select
                          className="form-select"
                          style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                          value={task.status}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </td>
                      <td><span className={`badge badge-${priorityClass[task.priority]}`}>{task.priority}</span></td>
                      <td>
                        {task.assignee
                          ? <div className="flex items-center gap-2"><div className="avatar sm">{task.assignee.name[0]}</div>{task.assignee.name}</div>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {isOverdue
                          ? <span className="overdue-badge">⚠️ {formatDate(task.dueDate)}</span>
                          : <span className="text-muted">{formatDate(task.dueDate)}</span>}
                      </td>
                      {isAdmin && (
                        <td>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(task.id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
