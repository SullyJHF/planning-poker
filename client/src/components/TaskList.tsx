import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faEdit, 
    faTrashAlt, 
    faPlay, 
    faClock,
    faSpinner,
    faCheckCircle,
    faQuestionCircle,
    faCog,
    faSave,
    faTimes
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
    onUpdateJiraBaseUrl: (jiraBaseUrl: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
    tasks,
    currentTaskId,
    isHost,
    jiraBaseUrl,
    onCreateTask,
    onUpdateTask,
    onDeleteTask,
    onSetCurrentTask,
    onUpdateJiraBaseUrl
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showJiraSettings, setShowJiraSettings] = useState(false);
    const [tempJiraUrl, setTempJiraUrl] = useState(jiraBaseUrl || 'https://yourcompany.atlassian.net/browse/');
    const jiraUrlInputRef = useRef<HTMLInputElement>(null);

    // Update tempJiraUrl when jiraBaseUrl prop changes
    useEffect(() => {
        setTempJiraUrl(jiraBaseUrl || 'https://yourcompany.atlassian.net/browse/');
    }, [jiraBaseUrl]);

    // Auto-focus and select text when settings panel opens
    useEffect(() => {
        if (showJiraSettings && jiraUrlInputRef.current) {
            setTimeout(() => {
                jiraUrlInputRef.current?.focus();
                jiraUrlInputRef.current?.select();
            }, 100); // Small delay to ensure the input is rendered
        }
    }, [showJiraSettings]);
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
                description: formData.description || undefined,
                status: formData.status
            });
            setEditingTask(null);
        } else {
            onCreateTask({
                ticketId: formData.ticketId,
                description: formData.description || undefined,
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

    const handleJiraSettingsSubmit = () => {
        // Ensure URL ends with a slash to prevent malformed URLs
        const normalizedUrl = tempJiraUrl.trim().endsWith('/') ? tempJiraUrl.trim() : tempJiraUrl.trim() + '/';
        onUpdateJiraBaseUrl(normalizedUrl);
        setShowJiraSettings(false);
    };

    const handleJiraSettingsCancel = () => {
        setTempJiraUrl(jiraBaseUrl);
        setShowJiraSettings(false);
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
                    {isHost && (
                        <button 
                            className="jira-settings-btn"
                            onClick={() => setShowJiraSettings(true)}
                            title="Configure Jira settings"
                        >
                            <FontAwesomeIcon icon={faCog} />
                        </button>
                    )}
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

            {showJiraSettings && isHost && (
                <div className="jira-settings-form">
                    <div className="jira-settings-header">
                        <h4>Jira Settings</h4>
                        <button className="close-settings-btn" onClick={handleJiraSettingsCancel}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    <div className="jira-settings-content">
                        <label htmlFor="jira-base-url">Jira Base URL</label>
                        <input
                            ref={jiraUrlInputRef}
                            id="jira-base-url"
                            type="url"
                            value={tempJiraUrl}
                            onChange={(e) => setTempJiraUrl(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="https://yourcompany.atlassian.net/browse/"
                        />
                        <div className="jira-settings-description">
                            Ticket IDs will be automatically appended to this URL.
                        </div>
                        <div className="jira-settings-actions">
                            <button type="button" className="cancel-btn" onClick={handleJiraSettingsCancel}>
                                Cancel
                            </button>
                            <button type="button" className="save-btn" onClick={handleJiraSettingsSubmit}>
                                <FontAwesomeIcon icon={faSave} />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="tasks-container">
                {tasks.length === 0 && !showForm ? (
                    <div className="no-tasks">
                        {isHost ? 'Click + to add your first ticket' : 'No tickets yet'}
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
                                <span className="task-title">
                                    {jiraBaseUrl ? (
                                        <a href={`${jiraBaseUrl}${task.ticketId}`} target="_blank" rel="noopener noreferrer">
                                            {task.ticketId}
                                        </a>
                                    ) : (
                                        task.ticketId
                                    )}
                                </span>
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