import React from 'react';

type BadgeType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
    children: React.ReactNode;
    type?: BadgeType;
    className?: string;
}

export function Badge({ children, type = 'default', className = '' }: BadgeProps) {
    const styles = {
        success: 'bg-green-100 text-green-700 border-green-200',
        warning: 'bg-amber-100 text-amber-700 border-amber-200',
        error: 'bg-rose-100 text-rose-700 border-rose-200',
        info: 'bg-blue-100 text-blue-700 border-blue-200',
        default: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${styles[type]} ${className}`}
        >
            {children}
        </span>
    );
}

export function StatusBadge({ status }: { status: string }) {
    let type: BadgeType = 'default';

    switch (status?.toUpperCase()) {
        case 'DELIVERED':
        case 'COMPLETED':
            type = 'success';
            break;
        case 'PENDING':
        case 'PROCESSING':
            type = 'warning';
            break;
        case 'CANCELLED':
        case 'RETURNED':
            type = 'error';
            break;
        case 'SHIPPED':
            type = 'info';
            break;
    }

    return <Badge type={type}>{status}</Badge>;
}
