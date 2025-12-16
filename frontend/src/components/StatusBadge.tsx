import React from 'react';
import type { DocumentStatus } from '../types';  // Add 'type' keyword

interface Props {
  status: DocumentStatus | string;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const getBadgeClass = () => {
    switch (status) {
      case 'APPROVED':
        return 'badge-success';
      case 'PENDING_REVIEW':
        return 'badge-warning';
      case 'REJECTED':
        return 'badge-danger';
      case 'PROCESSING':
        return 'badge-info';
      case 'UPLOADED':
        return 'badge-gray';
      case 'FAILED':
        return 'badge-danger';
      default:
        return 'badge-gray';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'APPROVED':
        return '✅';
      case 'PENDING_REVIEW':
        return '⏸️';
      case 'REJECTED':
        return '❌';
      case 'PROCESSING':
        return '🔄';
      case 'UPLOADED':
        return '📄';
      case 'FAILED':
        return '⚠️';
      default:
        return '📄';
    }
  };

  return (
    <span className={`badge ${getBadgeClass()}`}>
      <span className="mr-1">{getIcon()}</span>
      {status.replace('_', ' ')}
    </span>
  );
};
