import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faEdit, 
    faTrashAlt, 
    faPlay, 
    faClock,
    faSpinner,
    faCheckCircle,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import './TaskList.css';

export interface Task {
    id: string;
    ticketId: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    finalEstimate?: string;
    createdAt: Date;
}

interface TaskListProps {
    tasks: Task[];
    currentTaskId?: string;
    isHost: boolean;
    jiraBaseUrl: string;
    onCreateTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    onUpdateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
    onDeleteTask: (taskId: string) => void;
    onSetCurrentTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
    tasks,
    currentTaskId,
    isHost,
    jiraBaseUrl,
    onCreateTask,
    onUpdateTask,
    onDeleteTask,
    onSetCurrentTask
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const [formData, setFormData] = useState<{
        ticketId: string;
        description: string;
        status: 'pending' | 'in_progress' | 'completed';
    }>({
        ticketId: '',
        description: '',
        status: 'pending'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.ticketId.trim()) return;

        if (editingTask) {
            onUpdateTask(editingTask.id, {
                ticketId: formData.ticketId,
                description: formData.description, // Allow empty strings to clear description
                status: formData.status
            });
            setEditingTask(null);
        } else {
            onCreateTask({
                ticketId: formData.ticketId,
                description: formData.description || undefined, // Keep undefined for new tasks if empty
                status: formData.status
            });
        }

        setFormData({ ticketId: '', description: '', status: 'pending' });
        setShowForm(false);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setFormData({
            ticketId: task.ticketId,
            description: task.description || '',
            status: task.status
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingTask(null);
        setFormData({ ticketId: '', description: '', status: 'pending' });
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
                <div className="task-list-actions">
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
            </div>

            {showForm && (
                <form className="task-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Ticket ID (e.g., PROJ-123)..."
                        value={formData.ticketId}
                        onChange={(e) => setFormData({ ...formData, ticketId: e.target.value })}
                        required
                        autoFocus
                    />
                    <textarea
                        placeholder="Description (optional)..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
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
                        Click + to add your first ticket
                    </div>
                ) : (
                    tasks.map(task => {
                        // Hide the task card if it's currently being edited
                        if (editingTask && editingTask.id === task.id) {
                            return null;
                        }
                        
                        return (
                            <div 
                                key={task.id} 
                                className={`task-item ${task.id === currentTaskId ? 'current' : ''}`}
                            >
                            <div className="task-header">
                                <span className="task-status" title={task.status}>
                                    {getStatusIcon(task.status)}
                                </span>
                                <span className="task-title">
                                    {jiraBaseUrl ? (
                                        <a href={`${jiraBaseUrl}${task.ticketId}`} target="_blank" rel="noopener noreferrer">
                                            {task.ticketId}
                                        </a>
                                    ) : (
                                        task.ticketId
                                    )}
                                </span>
                                <div className="task-actions">
                                    {isHost && task.status !== 'in_progress' && (
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
                            </div>
                            {task.description && (
                                <div className="task-description">{task.description}</div>
                            )}
                            {task.finalEstimate && (
                                <div className="task-estimate">
                                    Final estimate: <strong>{task.finalEstimate}</strong>
                                </div>
                            )}
                        </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};