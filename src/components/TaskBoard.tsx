'use client';

import React, { useState } from 'react';
import {
  Kanban,
  Table as TableIcon,
  List as ListIcon,
  Calendar as CalendarIcon,
  Plus,
  MoreVertical,
  CheckSquare,
  MessageSquare,
  User,
  Clock,
  Trash2,
  Copy,
  ChevronRight,
  Filter,
  Search,
  ExternalLink,
  Heart
} from 'lucide-react';
import { Task, Profile, Event } from '@/lib/mockData';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from './ui/Dialog';
import { cn } from '@/lib/utils';
import triggerConfetti from './ui/Confetti';

interface TaskBoardProps {
  tasks: Task[];
  profiles: Profile[];
  events: Event[];
  selectedEventId: string | null;
  currentUser: Profile;
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

type ViewMode = 'kanban' | 'table' | 'list' | 'calendar';

export default function TaskBoard({
  tasks,
  profiles,
  events,
  selectedEventId,
  currentUser,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}: TaskBoardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  
  // Dialog management
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formEventId, setFormEventId] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPriority, setFormPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [formDueDate, setFormDueDate] = useState('');
  const [formStatus, setFormStatus] = useState<Task['status']>('not_started');
  const [formAssignedTo, setFormAssignedTo] = useState<string[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Filter tasks based on Workspace, Search, Priority, and Assignee
  const filteredTasks = tasks.filter(task => {
    if (selectedEventId && task.event_id !== selectedEventId) return false;
    
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assigned_to.includes(assigneeFilter);
    
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const isAdmin = currentUser.role === 'admin';

  // Open Edit / View Dialog
  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormName(task.name);
    setFormDesc(task.description || '');
    setFormEventId(task.event_id);
    setFormCategory(task.category);
    setFormPriority(task.priority);
    setFormDueDate(task.due_date ? task.due_date.substring(0, 16) : '');
    setFormStatus(task.status);
    setFormAssignedTo(task.assigned_to);
    setIsEditOpen(true);
  };

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormName('');
    setFormDesc('');
    setFormEventId(selectedEventId || events[0]?.id || '');
    setFormCategory('General');
    setFormPriority('medium');
    setFormDueDate('');
    setFormStatus('not_started');
    setFormAssignedTo([]);
    setIsEditOpen(true);
  };

  // Check if current user can edit the task contents
  const canEditTask = (task: Task | null) => {
    if (!task) return true; // Adding a new task
    if (isAdmin) return true;
    return task.assigned_to.includes(currentUser.id);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEventId) return;

    const taskData: Task = {
      id: editingTask ? editingTask.id : `t-${Date.now()}`,
      event_id: formEventId,
      name: formName,
      description: formDesc,
      category: formCategory,
      priority: formPriority,
      due_date: formDueDate ? new Date(formDueDate).toISOString() : '',
      status: formStatus,
      assigned_to: formAssignedTo,
      checklist: editingTask ? editingTask.checklist : [],
      comments: editingTask ? editingTask.comments : [],
      completion_percentage: editingTask ? editingTask.completion_percentage : 0
    };

    if (editingTask) {
      onUpdateTask(taskData);
      if (formStatus === 'completed' && editingTask.status !== 'completed') {
        triggerConfetti();
      }
    } else {
      onAddTask(taskData);
    }
    setIsEditOpen(false);
  };

  // Toggle Checklist subtask
  const handleToggleChecklist = (task: Task, itemId: string) => {
    if (!canEditTask(task)) return;
    
    const updatedChecklist = task.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const completedCount = updatedChecklist.filter(i => i.completed).length;
    const progress = Math.round((completedCount / updatedChecklist.length) * 100);

    const updatedTask: Task = {
      ...task,
      checklist: updatedChecklist,
      completion_percentage: progress,
      status: progress === 100 ? 'completed' : task.status
    };

    onUpdateTask(updatedTask);
    if (progress === 100 && task.completion_percentage < 100) {
      triggerConfetti();
    }
  };

  // Add subtask item
  const handleAddChecklistItem = (task: Task) => {
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: `c-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };
    const updatedChecklist = [...task.checklist, newItem];
    const completedCount = updatedChecklist.filter(i => i.completed).length;
    const progress = Math.round((completedCount / updatedChecklist.length) * 100);

    onUpdateTask({
      ...task,
      checklist: updatedChecklist,
      completion_percentage: progress
    });
    setNewChecklistText('');
  };

  // Add Comment
  const handleAddComment = (task: Task) => {
    if (!newCommentText.trim()) return;
    const newComment = {
      id: `cm-${Date.now()}`,
      author: currentUser.full_name,
      text: newCommentText.trim(),
      timestamp: new Date().toISOString()
    };
    onUpdateTask({
      ...task,
      comments: [...task.comments, newComment]
    });
    setNewCommentText('');
  };

  // Duplicate task
  const handleDuplicate = (task: Task) => {
    const duplicated: Task = {
      ...task,
      id: `t-${Date.now()}`,
      name: `${task.name} (Copy)`,
      status: 'not_started',
      completion_percentage: 0,
      checklist: task.checklist.map(item => ({ ...item, id: `c-${Math.random()}`, completed: false })),
      comments: []
    };
    onAddTask(duplicated);
  };

  // Deep WhatsApp links creator
  const getWhatsAppLink = (task: Task, profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile || !profile.phone) return null;
    
    const text = encodeURIComponent(
      `Hi ${profile.full_name}, just checking in on the task "${task.name}" for Prachi's wedding planner. Current status: ${task.status.toUpperCase().replace('_', ' ')}. Please review and update details when possible!`
    );
    return `https://wa.me/${profile.phone.replace(/[^0-9]/g, '')}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900/60 p-4 border border-stone-200/80 dark:border-stone-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-stone-200 dark:border-stone-850 rounded-lg bg-transparent text-xs text-stone-850 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 border border-stone-200 dark:border-stone-850 rounded-lg px-2 py-1 bg-transparent">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs text-stone-600 dark:text-stone-300 focus:outline-none font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center gap-1.5 border border-stone-200 dark:border-stone-850 rounded-lg px-2 py-1 bg-transparent">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="bg-transparent text-xs text-stone-600 dark:text-stone-300 focus:outline-none font-medium"
            >
              <option value="all">All Members</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-3">
          <div className="bg-stone-100 dark:bg-stone-850 p-1 rounded-lg flex items-center gap-1 border border-stone-200/40">
            {([
              { mode: 'kanban', icon: Kanban },
              { mode: 'table', icon: TableIcon },
              { mode: 'list', icon: ListIcon },
              { mode: 'calendar', icon: CalendarIcon }
            ] as const).map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.mode}
                  onClick={() => setViewMode(item.mode)}
                  className={`p-1.5 rounded transition-all ${
                    viewMode === item.mode
                      ? 'bg-white dark:bg-stone-900 shadow text-amber-500'
                      : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-250'
                  }`}
                  title={`${item.mode.toUpperCase()} View`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-3 py-2 rounded-lg shadow-md shadow-emerald-700/10 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Task Views Router */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-xl">
          <CheckSquare className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
          <p className="text-stone-500 dark:text-stone-400 font-medium">No tasks found matching current filters.</p>
        </div>
      ) : (
        <>
          {viewMode === 'kanban' && renderKanbanView()}
          {viewMode === 'table' && renderTableView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'calendar' && renderCalendarView()}
        </>
      )}

      {/* Task inspector and modifier modal */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Task Details' : 'Create Planner Task'}</DialogTitle>
          </DialogHeader>
          <DialogContent className="space-y-4 max-h-[70vh] overflow-y-auto">
            {editingTask && !canEditTask(editingTask) && (
              <div className="bg-amber-500/10 border border-amber-500/25 p-2 rounded text-[11px] text-amber-600 dark:text-amber-400">
                You are viewing in read-only mode because this task is not assigned to you.
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Task Title</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  disabled={editingTask ? !canEditTask(editingTask) : false}
                  required
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  disabled={editingTask ? !canEditTask(editingTask) : false}
                  rows={2}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Workspace / Event</label>
                <select
                  value={formEventId}
                  onChange={e => setFormEventId(e.target.value)}
                  disabled={editingTask ? !canEditTask(editingTask) : false}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-transparent text-stone-700 dark:text-stone-300 focus:ring-1 focus:ring-amber-500"
                >
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Category</label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  disabled={editingTask ? !canEditTask(editingTask) : false}
                  required
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-transparent text-stone-700 dark:text-stone-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Priority</label>
                <select
                  value={formPriority}
                  onChange={e => setFormPriority(e.target.value as any)}
                  disabled={editingTask ? !canEditTask(editingTask) : false}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-transparent text-stone-700 dark:text-stone-300"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={formDueDate}
                  onChange={e => setFormDueDate(e.target.value)}
                  disabled={editingTask ? !canEditTask(editingTask) : false}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-transparent text-stone-700 dark:text-stone-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  disabled={editingTask ? !canEditTask(editingTask) : false}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-transparent text-stone-700 dark:text-stone-300"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting">Waiting</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Assign Members</label>
              <div className="flex flex-wrap gap-2">
                {profiles.map(p => {
                  const isAssigned = formAssignedTo.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={editingTask ? !canEditTask(editingTask) : false}
                      onClick={() => {
                        if (isAssigned) {
                          setFormAssignedTo(formAssignedTo.filter(id => id !== p.id));
                        } else {
                          setFormAssignedTo([...formAssignedTo, p.id]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs border font-medium transition-all ${
                        isAssigned
                          ? 'bg-emerald-600/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-550/10 dark:text-emerald-400'
                          : 'border-stone-200 dark:border-stone-850 hover:bg-stone-50 dark:hover:bg-stone-850 text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      {p.full_name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checklist Section inside inspector */}
            {editingTask && (
              <div className="border-t border-stone-150 dark:border-stone-800/80 pt-4">
                <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Checklist ({editingTask.checklist.length} items - {editingTask.completion_percentage}% done)
                </h4>
                
                <div className="space-y-2">
                  {editingTask.checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        disabled={!canEditTask(editingTask)}
                        onChange={() => handleToggleChecklist(editingTask, item.id)}
                        className="rounded border-stone-300 dark:border-stone-750 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={cn('text-stone-700 dark:text-stone-300', item.completed && 'line-through text-stone-400')}>{item.text}</span>
                    </div>
                  ))}
                </div>

                {canEditTask(editingTask) && (
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Add subtask..."
                      value={newChecklistText}
                      onChange={e => setNewChecklistText(e.target.value)}
                      className="flex-1 px-3 py-1 border border-stone-200 dark:border-stone-750 rounded-lg text-xs bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddChecklistItem(editingTask)}
                      className="px-3 py-1 bg-stone-150 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-750 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Comments Feed inside inspector */}
            {editingTask && (
              <div className="border-t border-stone-150 dark:border-stone-800/80 pt-4">
                <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">Comments & Logs</h4>
                <div className="space-y-2.5 max-h-36 overflow-y-auto mb-3">
                  {editingTask.comments.length === 0 ? (
                    <p className="text-[11px] text-stone-400 italic">No notes logged yet.</p>
                  ) : (
                    editingTask.comments.map(c => (
                      <div key={c.id} className="bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg text-[11px] leading-relaxed">
                        <div className="flex justify-between font-bold text-stone-500 dark:text-stone-450 mb-0.5">
                          <span>{c.author}</span>
                          <span>{new Date(c.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-stone-700 dark:text-stone-300">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Log comment/note..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    className="flex-1 px-3 py-1 border border-stone-200 dark:border-stone-750 rounded-lg text-xs bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddComment(editingTask)}
                    className="px-3 py-1 bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </DialogContent>

          <DialogFooter>
            {editingTask && isAdmin && (
              <div className="mr-auto flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Duplicate this task?')) {
                      handleDuplicate(editingTask);
                      setIsEditOpen(false);
                    }
                  }}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  title="Duplicate Task"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this task forever?')) {
                      onDeleteTask(editingTask.id);
                      setIsEditOpen(false);
                    }
                  }}
                  className="p-2 text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            {(!editingTask || canEditTask(editingTask)) && (
              <button
                type="submit"
                className="px-4 py-2 text-xs bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg transition-colors font-semibold"
              >
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            )}
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );

  // Kanban view renderer
  function renderKanbanView() {
    const statuses: Array<{ id: Task['status']; label: string; bg: string; text: string }> = [
      { id: 'not_started', label: 'Not Started', bg: 'bg-stone-100 dark:bg-stone-850', text: 'text-stone-600 dark:text-stone-400' },
      { id: 'in_progress', label: 'In Progress', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
      { id: 'waiting', label: 'Waiting / Blocked', bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
      { id: 'completed', label: 'Completed', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {statuses.map(col => {
          const colTasks = filteredTasks.filter(t => {
            if (col.id === 'waiting') return t.status === 'waiting' || t.status === 'blocked';
            return t.status === col.id;
          });

          return (
            <div key={col.id} className="rounded-xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded border border-current', col.bg, col.text)}>
                  {col.label}
                </span>
                <span className="text-xs text-stone-400 font-bold">{colTasks.length}</span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {colTasks.map(task => {
                  const event = events.find(e => e.id === task.event_id);
                  const isTaskOverdue = task.due_date && new Date(task.due_date).getTime() < new Date().getTime() && task.status !== 'completed';

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleOpenEdit(task)}
                      className="group bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-4 rounded-lg shadow-sm hover:border-amber-500/50 hover:shadow-md cursor-pointer transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Priority Strip */}
                      <div className={cn(
                        'absolute top-0 left-0 right-0 h-1',
                        task.priority === 'critical' ? 'bg-rose-500' :
                        task.priority === 'high' ? 'bg-orange-500' :
                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      )} />

                      <div className="flex justify-between items-start text-[10px] text-stone-400 mb-2 font-medium">
                        <span className="truncate max-w-[80px] bg-stone-100 dark:bg-stone-850 px-1.5 py-0.5 rounded text-stone-600 dark:text-stone-400">
                          {event?.name || 'General'}
                        </span>
                        <span className="text-stone-400">{task.category}</span>
                      </div>

                      <h4 className={cn('text-xs font-bold text-stone-800 dark:text-stone-150 leading-tight mb-2', task.status === 'completed' && 'line-through text-stone-400')}>
                        {task.name}
                      </h4>

                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-3">
                        {task.description}
                      </p>

                      <div className="flex justify-between items-center border-t border-stone-50 dark:border-stone-850 pt-2.5 text-[10px]">
                        <div className="flex -space-x-1.5">
                          {task.assigned_to.map(id => {
                            const p = profiles.find(pr => pr.id === id);
                            return (
                              <div
                                key={id}
                                className="w-5.5 h-5.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-white dark:border-stone-900 flex items-center justify-center font-bold text-stone-600 dark:text-stone-400"
                                title={p?.full_name}
                              >
                                {p?.full_name[0]}
                              </div>
                            );
                          })}
                          {task.assigned_to.length === 0 && (
                            <span className="text-stone-400 italic">Unassigned</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 font-medium">
                          {task.checklist.length > 0 && (
                            <span className="text-stone-400 flex items-center gap-0.5">
                              <CheckSquare className="w-3 h-3" />
                              {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                            </span>
                          )}
                          {task.comments.length > 0 && (
                            <span className="text-stone-400 flex items-center gap-0.5">
                              <MessageSquare className="w-3 h-3" />
                              {task.comments.length}
                            </span>
                          )}
                          {task.due_date && (
                            <span className={cn(
                              'flex items-center gap-0.5 font-semibold',
                              isTaskOverdue ? 'text-rose-500 animate-pulse' : 'text-stone-400'
                            )}>
                              <Clock className="w-3 h-3" />
                              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Table view renderer
  function renderTableView() {
    return (
      <div className="bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/80 text-stone-500 dark:text-stone-400 font-bold">
                <th className="p-3">Task Name</th>
                <th className="p-3">Workspace</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Checklist</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Assignees</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
              {filteredTasks.map(task => {
                const event = events.find(e => e.id === task.event_id);
                return (
                  <tr
                    key={task.id}
                    onClick={() => handleOpenEdit(task)}
                    className="hover:bg-stone-50/30 dark:hover:bg-stone-850/30 cursor-pointer text-stone-700 dark:text-stone-300 font-medium"
                  >
                    <td className="p-3 font-semibold">{task.name}</td>
                    <td className="p-3">{event?.name || 'General'}</td>
                    <td className="p-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded font-bold capitalize text-[10px]',
                        task.priority === 'critical' && 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
                        task.priority === 'high' && 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
                        task.priority === 'medium' && 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
                        task.priority === 'low' && 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      )}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3 capitalize">{task.status.replace('_', ' ')}</td>
                    <td className="p-3">
                      {task.checklist.length > 0 ? (
                        <span>
                          {task.checklist.filter(i => i.completed).length} / {task.checklist.length} ({task.completion_percentage}%)
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-3">
                      <div className="flex -space-x-1.5">
                        {task.assigned_to.map(id => {
                          const p = profiles.find(pr => pr.id === id);
                          return (
                            <div
                              key={id}
                              className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 border border-white dark:border-stone-900 flex items-center justify-center font-bold text-[9px]"
                              title={p?.full_name}
                            >
                              {p?.full_name[0]}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        {task.assigned_to.map(profileId => {
                          const waLink = getWhatsAppLink(task, profileId);
                          if (!waLink) return null;
                          return (
                            <a
                              key={profileId}
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 hover:bg-emerald-500/10 text-emerald-600 rounded"
                              title={`WhatsApp ping ${profiles.find(p => p.id === profileId)?.full_name}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          );
                        })}
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // List view renderer
  function renderListView() {
    return (
      <div className="space-y-2">
        {filteredTasks.map(task => {
          const isTaskOverdue = task.due_date && new Date(task.due_date).getTime() < new Date().getTime() && task.status !== 'completed';
          return (
            <div
              key={task.id}
              onClick={() => handleOpenEdit(task)}
              className="bg-white dark:bg-stone-900/60 hover:bg-stone-50/50 dark:hover:bg-stone-850/50 border border-stone-200/80 dark:border-stone-800 p-4 rounded-xl shadow-sm cursor-pointer transition-all duration-300 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  disabled={!canEditTask(task)}
                  onClick={e => e.stopPropagation()}
                  onChange={() => {
                    const newStatus = task.status === 'completed' ? 'not_started' : 'completed';
                    onUpdateTask({ ...task, status: newStatus, completion_percentage: newStatus === 'completed' ? 100 : 0 });
                    if (newStatus === 'completed') triggerConfetti();
                  }}
                  className="rounded border-stone-300 dark:border-stone-750 text-emerald-600 w-4 h-4"
                />
                <div>
                  <h4 className={cn('text-xs font-bold text-stone-800 dark:text-stone-150', task.status === 'completed' && 'line-through text-stone-400')}>
                    {task.name}
                  </h4>
                  {task.description && (
                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px]">
                <span className={cn(
                  'px-2 py-0.5 rounded font-bold capitalize text-[9px]',
                  task.priority === 'critical' ? 'bg-rose-500/10 text-rose-500' :
                  task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                  task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                )}>
                  {task.priority}
                </span>

                {task.due_date && (
                  <span className={cn(
                    'flex items-center gap-1 font-semibold',
                    isTaskOverdue ? 'text-rose-500' : 'text-stone-400'
                  )}>
                    <Clock className="w-3 h-3" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Calendar rendering helper
  function renderCalendarView() {
    // Generate dates for current view (e.g. Feb 2027 since wedding is Feb 21, 2027)
    // Or dynamically base it on current month, but to make it immediately relevant to the wedding date:
    // Let's render the month of February 2027 by default!
    const year = 2027;
    const month = 1; // 0-indexed, so February is index 1

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const daysArray: Array<{ date: number; tasks: Task[] }> = [];

    // Pre fill empty slots before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push({ date: 0, tasks: [] });
    }

    // Fill days
    for (let day = 1; day <= totalDays; day++) {
      const dayDateStr = new Date(year, month, day).toDateString();
      const dayTasks = filteredTasks.filter(t => {
        if (!t.due_date) return false;
        return new Date(t.due_date).toDateString() === dayDateStr;
      });
      daysArray.push({ date: day, tasks: dayTasks });
    }

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 text-center mb-4">
          February 2027 Wedding Month
        </h3>
        
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-stone-400 text-[10px] mb-2">
          {weekdays.map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {daysArray.map((dayObj, idx) => (
            <div
              key={idx}
              className={cn(
                'min-h-[70px] border border-stone-100 dark:border-stone-850 p-1.5 rounded-lg flex flex-col justify-between text-left transition-all',
                dayObj.date === 0 ? 'opacity-25 bg-stone-50/50 dark:bg-stone-900/20' : 'bg-stone-50/20 dark:bg-stone-900/40 hover:border-amber-500/30'
              )}
            >
              {dayObj.date > 0 && (
                <>
                  <span className={cn(
                    'text-[10px] font-bold',
                    dayObj.date === 21 ? 'text-amber-500 font-extrabold flex items-center gap-0.5' : 'text-stone-400'
                  )}>
                    {dayObj.date}
                    {dayObj.date === 21 && <Heart className="w-2.5 h-2.5 fill-current" />}
                  </span>
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[40px]">
                    {dayObj.tasks.map(t => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(t);
                        }}
                        className={cn(
                          'text-[8px] truncate p-1 rounded-sm border cursor-pointer font-semibold leading-none',
                          t.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 line-through'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        )}
                        title={t.name}
                      >
                        {t.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
