import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faEdit, 
    faTrashAlt, 
    faPlay, 
    faLink,
    faClock,
    faSpinner,
    faCheckCircle,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import './TaskList.css';

export interface Task {
    id: string;
    title: string;
    description?: string;
    link?: string;
    status: 'pending' | 'in_progress' | 'completed';
    finalEstimate?: string;
    createdAt: Date;
}

interface TaskListProps {
    tasks: Task[];
    currentTaskId?: string;
    isHost: boolean;
    onCreateTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    onUpdateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
    onDeleteTask: (taskId: string) => void;
    onSetCurrentTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
    tasks,
    currentTaskId,
    isHost,
    onCreateTask,
    onUpdateTask,
    onDeleteTask,
    onSetCurrentTask
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        link: string;
        status: 'pending' | 'in_progress' | 'completed';
    }>({
        title: '',
        description: '',
        link: '',
        status: 'pending'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        if (editingTask) {
            onUpdateTask(editingTask.id, {
                title: formData.title,
                description: formData.description || undefined,
                link: formData.link || undefined,
                status: formData.status
            });
            setEditingTask(null);
        } else {
            onCreateTask({
                title: formData.title,
                description: formData.description || undefined,
                link: formData.link || undefined,
                status: formData.status
            });
        }

        setFormData({ title: '', description: '', link: '', status: 'pending' });
        setShowForm(false);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            link: task.link || '',
            status: task.status
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingTask(null);
        setFormData({ title: '', description: '', link: '', status: 'pending' });
    };

    const getStatusIcon = (status: Task['status']) => {
        switch (status) {
            case 'pending': return <FontAwesomeIcon icon={faClock} />;
            case 'in_progress': return <FontAwesomeIcon icon={faSpinner} spin />;
            case 'completed': return <FontAwesomeIcon icon={faCheckCircle} />;
            default: return <FontAwesomeIcon icon={faQuestionCircle} />;
        }
    };

    return (
        <div className="task-list">
            <div className="task-list-header">
                <h3>Tasks</h3>
                {!showForm && (
                    <button 
                        className="add-task-btn"
                        onClick={() => setShowForm(true)}
                        title="Add new task"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                )}
            </div>

            {showForm && (
                <form className="task-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Task title..."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        autoFocus
                    />
                    <textarea
                        placeholder="Description (optional)..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                    />
                    <input
                        type="url"
                        placeholder="Link (optional)..."
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    />
                    <div className="form-actions">
                        <button type="submit" className="save-btn">
                            {editingTask ? 'Update' : 'Add'}
                        </button>
                        <button type="button" className="cancel-btn" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="tasks-container">
                {tasks.length === 0 && !showForm ? (
                    <div className="no-tasks">
                        {isHost ? 'Click + to add your first task' : 'No tasks yet'}
                    </div>
                ) : (
                    tasks.map(task => (
                        <div 
                            key={task.id} 
                            className={`task-item ${task.id === currentTaskId ? 'current' : ''}`}
                        >
                            <div className="task-header">
                                <span className="task-status" title={task.status}>
                                    {getStatusIcon(task.status)}
                                </span>
                                <span className="task-title">{task.title}</span>
                                {isHost && (
                                    <div className="task-actions">
                                        {task.status !== 'in_progress' && (
                                            <button
                                                className="select-task-btn"
                                                onClick={() => onSetCurrentTask(task.id)}
                                                title="Select this task"
                                            >
                                                <FontAwesomeIcon icon={faPlay} />
                                            </button>
                                        )}
                                        <button
                                            className="edit-task-btn"
                                            onClick={() => handleEdit(task)}
                                            title="Edit task"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            className="delete-task-btn"
                                            onClick={() => onDeleteTask(task.id)}
                                            title="Delete task"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {task.description && (
                                <div className="task-description">{task.description}</div>
                            )}
                            {task.link && (
                                <div className="task-link">
                                    <a href={task.link} target="_blank" rel="noopener noreferrer">
                                        <FontAwesomeIcon icon={faLink} /> View in Jira
                                    </a>
                                </div>
                            )}
                            {task.finalEstimate && (
                                <div className="task-estimate">
                                    Final estimate: <strong>{task.finalEstimate}</strong>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};