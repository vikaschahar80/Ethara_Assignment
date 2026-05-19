import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI, usersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, UserPlus, ArrowLeft, X } from 'lucide-react';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const statusLabel = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
const statusClass = { TODO: 'todo', IN_PROGRESS: 'in_progress', DONE: 'done' };
const priorityClass = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : null;

function TaskModal({ projectId, members, onClose, onSave, initial }) {
  const { user } = useAuth();
  const [form, setForm] = useState(initial || { title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await onSave(form); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{initial ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="Task title" value={form.title} onChange={set('title')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Details…" value={form.description} onChange={set('description')} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={set('status')}>
                  {STATUSES.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={set('priority')}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={form.dueDate || ''} onChange={set('dueDate')} />
              </div>
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select className="form-select" value={form.assigneeId || ''} onChange={set('assigneeId')}>
                  <option value="">Unassigned</option>
                  {members.map(m => <option key={m.user?.id || m.userId} value={m.user?.id || m.userId}>{m.user?.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ projectId, onClose, onAdd }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await onAdd({ email, role }); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Member</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="member@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding…' : 'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null); // null | 'new' | task object
  const [memberModal, setMemberModal] = useState(false);

  const myMembership = project?.members?.find(m => m.user?.id === user?.id || m.userId === user?.id);
  const isProjectAdmin = isAdmin || myMembership?.role === 'ADMIN';

  const fetchProject = useCallback(() =>
    projectsAPI.getOne(id).then(r => setProject(r.data.project)).finally(() => setLoading(false)),
  [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const handleCreateTask = async (form) => {
    await tasksAPI.create(id, { ...form, assigneeId: form.assigneeId || undefined, dueDate: form.dueDate || undefined });
    toast.success('Task created!');
    setTaskModal(null);
    fetchProject();
  };

  const handleUpdateTask = async (form) => {
    await tasksAPI.update(taskModal.id, { ...form, assigneeId: form.assigneeId || undefined, dueDate: form.dueDate || undefined });
    toast.success('Task updated!');
    setTaskModal(null);
    fetchProject();
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await tasksAPI.delete(taskId);
    toast.success('Task deleted');
    fetchProject();
  };

  const handleStatusChange = async (taskId, status) => {
    await tasksAPI.update(taskId, { status });
    setProject(p => ({ ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, status } : t) }));
  };

  const handleAddMember = async (data) => {
    await projectsAPI.addMember(id, data);
    toast.success('Member added!');
    setMemberModal(false);
    fetchProject();
  };

  const handleRemoveMember = async (userId, name) => {
    if (!confirm(`Remove ${name} from project?`)) return;
    await projectsAPI.removeMember(id, userId);
    toast.success('Member removed');
    fetchProject();
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!project) return <div className="page-content"><p>Project not found.</p></div>;

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = (project.tasks || []).filter(t => t.status === s);
    return acc;
  }, {});

  return (
    <>
      <div className="top-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/projects')}><ArrowLeft size={18} /></button>
          <h1 className="page-title">{project.name}</h1>
        </div>
        <div className="header-actions">
          {isProjectAdmin && (
            <button className="btn btn-secondary btn-sm" onClick={() => setMemberModal(true)}>
              <UserPlus size={15} /> Add Member
            </button>
          )}
          <button id="new-task-btn" className="btn btn-primary btn-sm" onClick={() => setTaskModal('new')}>
            <Plus size={15} /> New Task
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Members */}
        <div className="card mb-6">
          <div className="section-header">
            <h2 className="section-title">Team Members</h2>
            <span className="text-sm text-muted">{project.members?.length} member{project.members?.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
            {project.members?.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div className="avatar sm">{m.user?.name?.[0]}</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.user?.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{m.user?.email}</div>
                </div>
                <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
                {isProjectAdmin && m.user?.id !== user?.id && (
                  <button className="btn btn-ghost btn-icon" style={{ padding: 4 }} onClick={() => handleRemoveMember(m.user?.id, m.user?.name)}><X size={13} /></button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="section-header mb-4">
          <h2 className="section-title">Task Board</h2>
          <span className="text-sm text-muted">{project.tasks?.length || 0} tasks total</span>
        </div>
        <div className="kanban-board">
          {STATUSES.map(status => (
            <div key={status} className="kanban-col">
              <div className="kanban-col-header">
                <div className="kanban-col-title">
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: status === 'TODO' ? '#6b7280' : status === 'IN_PROGRESS' ? '#7c6cfc' : '#22d3a0', display: 'inline-block' }} />
                  {statusLabel[status]}
                </div>
                <span className="kanban-col-count">{tasksByStatus[status].length}</span>
              </div>
              <div className="kanban-tasks">
                {tasksByStatus[status].length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No tasks</div>
                )}
                {tasksByStatus[status].map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                  return (
                    <div key={task.id} className="task-card" onClick={() => setTaskModal(task)}>
                      <div className="task-card-title">{task.title}</div>
                      {task.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>{task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}</div>}
                      <div className="task-card-meta">
                        <span className={`badge badge-${priorityClass[task.priority]}`}>{task.priority}</span>
                        {task.dueDate && <span className={isOverdue ? 'overdue-badge' : 'text-muted text-sm'}>{isOverdue ? '⚠️ ' : ''}{formatDate(task.dueDate)}</span>}
                      </div>
                      <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                        {task.assignee ? (
                          <div className="flex items-center gap-1"><div className="avatar sm">{task.assignee.name[0]}</div><span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{task.assignee.name}</span></div>
                        ) : <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Unassigned</span>}
                        <select
                          className="form-select"
                          style={{ width: 'auto', padding: '3px 8px', fontSize: '0.75rem' }}
                          value={task.status}
                          onClick={e => e.stopPropagation()}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                        </select>
                      </div>
                      {isProjectAdmin && (
                        <button className="btn btn-danger btn-icon" style={{ position: 'absolute', top: 8, right: 8, padding: '4px', opacity: 0, transition: 'opacity 0.2s' }}
                          onClick={e => { e.stopPropagation(); handleDeleteTask(task.id); }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {taskModal && taskModal !== 'new' && (
        <TaskModal
          projectId={id}
          members={project.members || []}
          onClose={() => setTaskModal(null)}
          onSave={handleUpdateTask}
          initial={{ ...taskModal, assigneeId: taskModal.assigneeId || '', dueDate: taskModal.dueDate ? taskModal.dueDate.split('T')[0] : '' }}
        />
      )}
      {taskModal === 'new' && (
        <TaskModal projectId={id} members={project.members || []} onClose={() => setTaskModal(null)} onSave={handleCreateTask} />
      )}
      {memberModal && <AddMemberModal projectId={id} onClose={() => setMemberModal(false)} onAdd={handleAddMember} />}
    </>
  );
}
