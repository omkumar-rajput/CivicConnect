import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (s) => {
    switch (s) {
      case 'Submitted':
        return 'badge-submitted';
      case 'Pending':
        return 'badge-pending';
      case 'Assigned':
        return 'badge-assigned';
      case 'In Progress':
        return 'badge-in-progress';
      case 'Resolved':
        return 'badge-resolved';
      case 'Rejected':
        return 'badge-rejected';
      default:
        return 'badge-submitted';
    }
  };

  const getIcon = (s) => {
    switch (s) {
      case 'Submitted':
        return 'bi-send';
      case 'Pending':
        return 'bi-hourglass-split';
      case 'Assigned':
        return 'bi-person-check';
      case 'In Progress':
        return 'bi-gear-wide-connected';
      case 'Resolved':
        return 'bi-check-circle-fill';
      case 'Rejected':
        return 'bi-x-circle';
      default:
        return 'bi-circle';
    }
  };

  return (
    <span
      className={`badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 ${getBadgeClass(
        status
      )}`}
      style={{ fontSize: '0.8rem', fontWeight: '600' }}
    >
      <i className={`bi ${getIcon(status)}`}></i>
      {status || 'Submitted'}
    </span>
  );
};

export default StatusBadge;
