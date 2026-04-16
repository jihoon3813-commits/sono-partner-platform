// Status Color Mapping Utilities

export const STATUS_COLORS = [
    { name: 'Blue', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    { name: 'Slate', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' },
    { name: 'Amber', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    { name: 'Gray', color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-100' },
    { name: 'Orange', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    { name: 'Red', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    { name: 'Rose', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
    { name: 'Cyan', color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-100' },
    { name: 'Emerald', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { name: 'Teal', color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-100' },
    { name: 'Pink', color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-100' },
    { name: 'Stone', color: 'text-stone-500', bg: 'bg-stone-50', border: 'border-stone-100' },
    { name: 'Purple', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
];

export const getStatusStyles = (statusLabel: string, dbStatuses: any[] | undefined) => {
    if (!dbStatuses) return 'bg-gray-50 text-gray-400 border border-gray-200';
    
    const statusInfo = dbStatuses.find(s => s.label === statusLabel);
    if (!statusInfo || !statusInfo.color) {
        // Fallback to legacy matching if no DB color yet
        return getLegacyStatusStyles(statusLabel);
    }

    const colorConfig = STATUS_COLORS.find(c => c.color === statusInfo.color) || STATUS_COLORS[1];
    return `${colorConfig.bg} ${colorConfig.color} ${colorConfig.border}`;
};

export const getLegacyStatusStyles = (status: string) => {
    switch (status) {
        case '접수대기':
            return 'bg-slate-50 text-slate-600 border border-slate-100';
        case '접수완료':
            return 'bg-blue-50 text-blue-600 border border-blue-100';
        case '부재':
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
