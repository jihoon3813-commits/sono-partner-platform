import React from 'react';

// Status Color Mapping Utilities

export interface ColorConfig {
    name: string;
    hex: string;
    color: string;
    bg: string;
    border: string;
}

export const STATUS_COLORS: ColorConfig[] = [
    { name: 'Blue', hex: '#3b82f6', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    { name: 'Slate', hex: '#64748b', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' },
    { name: 'Amber', hex: '#f59e0b', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    { name: 'Gray', hex: '#94a3b8', color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-100' },
    { name: 'Orange', hex: '#f97316', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    { name: 'Red', hex: '#ef4444', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    { name: 'Rose', hex: '#f43f5e', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
    { name: 'Cyan', hex: '#06b6d4', color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-100' },
    { name: 'Emerald', hex: '#10b981', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { name: 'Teal', hex: '#14b8a6', color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-100' },
    { name: 'Pink', hex: '#ec4899', color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-100' },
    { name: 'Stone', hex: '#78716c', color: 'text-stone-500', bg: 'bg-stone-50', border: 'border-stone-100' },
    { name: 'Purple', hex: '#9333ea', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { name: 'Indigo', hex: '#6366f1', color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
];

export interface BadgeProps {
    className: string;
    style: React.CSSProperties;
}

export const getStatusBadgeProps = (statusLabel: string, dbStatuses: any[] | undefined): BadgeProps => {
    if (!dbStatuses || dbStatuses.length === 0) {
        return { className: getLegacyStatusStyles(statusLabel), style: {} };
    }

    const statusInfo = dbStatuses.find(s => s.label === statusLabel);
    if (!statusInfo || !statusInfo.color) {
        return { className: getLegacyStatusStyles(statusLabel), style: {} };
    }

    const colorStr = statusInfo.color.trim();

    // 1. Check if color matches any of our predefined presets (by hex or text-color class)
    const preset = STATUS_COLORS.find(c => 
        c.hex.toLowerCase() === colorStr.toLowerCase() || 
        c.color.toLowerCase() === colorStr.toLowerCase()
    );

    if (preset) {
        return {
            className: `${preset.bg} ${preset.color} ${preset.border} border`,
            style: {}
        };
    }

    // 2. If custom HEX string like #ff0055
    if (colorStr.startsWith('#')) {
        return {
            className: 'border transition-all',
            style: {
                backgroundColor: `${colorStr}18`,
                color: colorStr,
                borderColor: `${colorStr}40`
            }
        };
    }

    // 3. Fallback
    return {
        className: 'bg-gray-50 text-gray-600 border border-gray-100',
        style: {}
    };
};

export const getStatusStyles = (statusLabel: string, dbStatuses: any[] | undefined) => {
    return getStatusBadgeProps(statusLabel, dbStatuses).className;
};

export const getStatusInlineStyle = (colorStr: string | undefined): React.CSSProperties => {
    if (!colorStr) return {};
    if (colorStr.startsWith('#')) {
        return {
            backgroundColor: `${colorStr}18`,
            color: colorStr,
            borderColor: `${colorStr}40`
        };
    }
    return {};
};

export const getLegacyStatusStyles = (status: string) => {
    switch (status) {
        case '접수대기':
        case '접수':
            return 'bg-blue-50 text-blue-600 border border-blue-100';
        case '접수완료':
            return 'bg-blue-50 text-blue-600 border border-blue-100';
        case '상담중':
            return 'bg-amber-50 text-amber-600 border border-amber-100';
        case '부재':
        case '대기':
            return 'bg-gray-50 text-gray-500 border border-gray-100';
        case '보류':
            return 'bg-orange-50 text-orange-600 border border-orange-100';
        case '거부':
        case '불가':
        case '수신거부':
            return 'bg-red-50 text-red-600 border border-red-100';
        case '녹취완료(출금확인중)':
            return 'bg-cyan-50 text-cyan-600 border border-cyan-100';
        case '접수취소':
        case '가입취소':
            return 'bg-rose-50 text-rose-600 border border-rose-100';
        case '정상가입':
            return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
        case '1회출금':
            return 'bg-teal-50 text-teal-600 border border-teal-100';
        case '배송완료':
            return 'bg-purple-50 text-purple-600 border border-purple-100';
        case '청약철회':
            return 'bg-pink-50 text-pink-600 border border-pink-100';
        case '해약':
            return 'bg-stone-50 text-stone-600 border border-stone-100';
        case '정산완료':
            return 'bg-amber-50 text-amber-600 border border-amber-100';
        default:
            return 'bg-gray-50 text-gray-400 border border-gray-200';
    }
};
