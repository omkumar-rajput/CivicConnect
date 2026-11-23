import React from 'react';

const steps = ['Submitted', 'Pending', 'Assigned', 'In Progress', 'Resolved'];

// Safe date formatter that will never throw
const formatStepTime = (val) => {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch (e) {
    return '';
  }
};

const Timeline = ({ currentStatus = 'Submitted', statusHistory = [] }) => {
  const isRejected = currentStatus === 'Rejected';
  const currentIndex = steps.indexOf(currentStatus);

  if (isRejected) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
        <i className="bi bi-x-octagon-fill fs-4"></i>
        <div>
          <strong>Complaint Rejected</strong>
          <p className="mb-0 small">This grievance request could not be processed. Please review remarks below.</p>
        </div>
      </div>
    );
  }

  const safeHistory = Array.isArray(statusHistory) ? statusHistory.filter(Boolean) : [];

  return (
    <div className="workflow-stepper-container my-4 px-2">
      <div className="workflow-stepper">
        {steps.map((step, index) => {
          const isCompleted = currentIndex > index || (currentIndex === steps.length - 1 && index === steps.length - 1);
          const isActive = currentIndex === index && currentStatus !== 'Resolved';

          let stateClass = '';
          if (isCompleted) stateClass = 'completed';
          else if (isActive) stateClass = 'active';

          return (
            <div key={step} className={`workflow-step ${stateClass}`}>
              <div className="workflow-circle">
                {isCompleted ? <i className="bi bi-check-lg"></i> : index + 1}
              </div>
              <div className="workflow-label">{step}</div>
            </div>
          );
        })}
      </div>

      {/* History logs card */}
      {safeHistory.length > 0 && (
        <div className="mt-4 p-3 bg-light rounded-3 border">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-secondary">
            <i className="bi bi-clock-history"></i> Resolution Audit History
          </h6>
          <div className="timeline-list">
            {safeHistory.map((item, idx) => (
              <div
                key={idx}
                className="d-flex align-items-start gap-3 pb-3 mb-3 border-bottom border-light-subtle last:border-0 last:pb-0 last:mb-0"
              >
                <div
                  className="rounded-circle bg-white border d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '32px', height: '32px', flexShrink: 0 }}
                >
                  <i className="bi bi-dot fs-3"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <span className="fw-semibold text-dark">{item.status || 'Updated'}</span>
                    <span className="small text-muted">
                      {formatStepTime(item.updatedAt)}
                    </span>
                  </div>
                  {item.remarks && (
                    <p className="mb-1 text-secondary small">{item.remarks}</p>
                  )}
                  {item.updatedByName && (
                    <span className="badge bg-white text-muted border small">
                      By: {item.updatedByName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
