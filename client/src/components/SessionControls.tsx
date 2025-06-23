import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlay, 
    faEye, 
    faRedo, 
    faCheck,
    faClock,
    faUsers
} from '@fortawesome/free-solid-svg-icons';
import './SessionControls.css';

type SessionPhase = 'idle' | 'voting' | 'revealed';

interface EstimationResult {
    average: number;
    median: number;
    mode: string[];
    hasConsensus: boolean;
    finalEstimate?: string;
}

interface SessionControlsProps {
    sessionPhase: SessionPhase;
    estimationResult?: EstimationResult;
    currentTask?: {
        id: string;
        title: string;
        description?: string;
    };
    isHost: boolean;
    voteCount: number;
    userCount: number;
    onStartVoting: () => void;
    onRevealVotes: () => void;
    onResetVoting: () => void;
    onFinalizeEstimate: (estimate: string) => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
    sessionPhase,
    estimationResult,
    currentTask,
    isHost,
    voteCount,
    userCount,
    onStartVoting,
    onRevealVotes,
    onResetVoting,
    onFinalizeEstimate
}) => {
    const [customEstimate, setCustomEstimate] = React.useState('');

    // Quick estimate options based on estimation result
    const getQuickEstimates = () => {
        if (!estimationResult) return [];
        
        const estimates = [];
        if (estimationResult.mode.length === 1) {
            estimates.push(estimationResult.mode[0]);
        }
        if (estimationResult.median > 0) {
            estimates.push(estimationResult.median.toString());
        }
        if (estimationResult.average > 0) {
            estimates.push(Math.round(estimationResult.average).toString());
        }
        
        // Remove duplicates and sort
        return Array.from(new Set(estimates)).sort((a, b) => Number(a) - Number(b));
    };

    const renderSessionControls = () => {
        if (!currentTask) {
            return (
                <div className="session-message">
                    <FontAwesomeIcon icon={faClock} />
                    <span>Select a task to start estimation</span>
                </div>
            );
        }

        switch (sessionPhase) {
            case 'idle':
                return isHost ? (
                    <div className="session-actions">
                        <button 
                            className="session-btn start-voting-btn"
                            onClick={onStartVoting}
                        >
                            <FontAwesomeIcon icon={faPlay} />
                            Start Voting
                        </button>
                    </div>
                ) : (
                    <div className="session-message">
                        <FontAwesomeIcon icon={faClock} />
                        <span>Waiting for host to start voting...</span>
                    </div>
                );

            case 'voting':
                return (
                    <div className="session-status">
                        <div className="voting-progress">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>{voteCount} of {userCount} voted</span>
                        </div>
                        {isHost && voteCount > 0 && (
                            <div className="session-actions">
                                <button 
                                    className="session-btn reveal-btn"
                                    onClick={onRevealVotes}
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                    Reveal Votes
                                </button>
                                <button 
                                    className="session-btn reset-btn"
                                    onClick={onResetVoting}
                                >
                                    <FontAwesomeIcon icon={faRedo} />
                                    Reset
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 'revealed':
                return (
                    <div className="estimation-results">
                        {estimationResult && (
                            <>
                                <div className="results-summary">
                                    <div className="result-stat">
                                        <span className="label">Average:</span>
                                        <span className="value">{estimationResult.average}</span>
                                    </div>
                                    <div className="result-stat">
                                        <span className="label">Median:</span>
                                        <span className="value">{estimationResult.median}</span>
                                    </div>
                                    <div className="result-stat">
                                        <span className="label">Mode:</span>
                                        <span className="value">{estimationResult.mode.join(', ')}</span>
                                    </div>
                                    {estimationResult.hasConsensus && (
                                        <div className="consensus-indicator">
                                            <FontAwesomeIcon icon={faCheck} />
                                            <span>Consensus reached!</span>
                                        </div>
                                    )}
                                </div>

                                {isHost && (
                                    <div className="finalize-section">
                                        <h4>Finalize Estimate</h4>
                                        <div className="estimate-options">
                                            {getQuickEstimates().map(estimate => (
                                                <button
                                                    key={estimate}
                                                    className="estimate-option"
                                                    onClick={() => onFinalizeEstimate(estimate)}
                                                >
                                                    {estimate}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="custom-estimate">
                                            <input
                                                type="text"
                                                placeholder="Custom estimate..."
                                                value={customEstimate}
                                                onChange={(e) => setCustomEstimate(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && customEstimate.trim()) {
                                                        onFinalizeEstimate(customEstimate.trim());
                                                        setCustomEstimate('');
                                                    }
                                                }}
                                            />
                                            <button
                                                className="finalize-btn"
                                                disabled={!customEstimate.trim()}
                                                onClick={() => {
                                                    if (customEstimate.trim()) {
                                                        onFinalizeEstimate(customEstimate.trim());
                                                        setCustomEstimate('');
                                                    }
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faCheck} />
                                                Finalize
                                            </button>
                                        </div>
                                        <div className="session-actions">
                                            <button 
                                                className="session-btn reset-btn"
                                                onClick={onResetVoting}
                                            >
                                                <FontAwesomeIcon icon={faRedo} />
                                                Start New Round
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="session-controls">
            <div className="session-header">
                <h3>Estimation Session</h3>
                <div className={`session-phase phase-${sessionPhase}`}>
                    {sessionPhase === 'idle' && 'Ready'}
                    {sessionPhase === 'voting' && 'Voting in Progress'}
                    {sessionPhase === 'revealed' && 'Results'}
                </div>
            </div>
            {renderSessionControls()}
        </div>
    );
};