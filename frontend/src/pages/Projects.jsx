import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, FolderKanban, Trash2, ArrowRight } from 'lucide-react';

function ProjectModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { name: '', description: '' });
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
          <h2 className="modal-title">{initial ? 'Edit Project' : 'New Project'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input id="proj-name" className="form-input" placeholder="My Awesome Project" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea id="proj-desc" className="form-textarea" placeholder="What is this project about?" value={form.description} onChange={set('description')} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="proj-save" type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchProjects = () =>
    projectsAPI.getAll().then(r => setProjects(r.data.projects)).finally(() => setLoading(false));

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (form) => {
    await projectsAPI.create(form);
    toast.success('Project created!');
    setShowModal(false);
    fetchProjects();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete project "${name}"? This will also delete all tasks.`)) return;
    await projectsAPI.delete(id);
    toast.success('Project deleted');
    setProjects(p => p.filter(x => x.id !== id));
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="top-header">
        <h1 className="page-title">Projects</h1>
        <button id="new-project-btn" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      <div className="page-content">
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No projects yet</h3>
            <p>Create your first project to get started</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
              <Plus size={16} /> Create Project
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {projects.map(project => (
              <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                    <FolderKanban size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }} className="truncate">{project.name}</div>
                    <div className="text-sm text-muted">{project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-muted" style={{ lineHeight: 1.5 }}>{project.description}</p>
                )}

                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                  {project.members?.slice(0, 5).map(m => (
                    <div key={m.userId || m.user?.id} className="avatar sm" title={m.user?.name}>
                      {m.user?.name?.[0]?.toUpperCase()}
                    </div>
                  ))}
                  {(project.members?.length || 0) > 5 && (
                    <span className="text-muted text-sm">+{project.members.length - 5}</span>
                  )}
                </div>

                <div className="flex items-center justify-between" style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <span className="text-sm text-muted">{project._count?.tasks || 0} task{project._count?.tasks !== 1 ? 's' : ''}</span>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(project.id, project.name)} title="Delete project">
                        <Trash2 size={14} />
                      </button>
                    )}
                    <Link to={`/projects/${project.id}`} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Open <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <ProjectModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
    </>
  );
}
