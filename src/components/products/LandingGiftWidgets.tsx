"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    FloatingGiftWidget,
    MaeumGiftDetailModal,
    MaeumGiftEventConfig,
    MaeumGiftEventSection,
    MaeumGiftItem,
} from "./MaeumGiftEventSection";

export function useLandingGiftEvent(landingKey: string) {
    const giftEvent = useQuery(api.maeumGifts.getPublicGiftEvent, {
        landingKey,
    });

    const gifts: MaeumGiftItem[] = useMemo(
        () => (giftEvent?.isEventActive ? giftEvent.gifts || [] : []),
        [giftEvent]
    );
    const config: MaeumGiftEventConfig | null = useMemo(
        () => (giftEvent?.config ? giftEvent.config : null),
        [giftEvent]
    );

    const [selectedGiftId, setSelectedGiftId] = useState<string>("");
    const [detailModalGift, setDetailModalGift] = useState<MaeumGiftItem | null>(null);

    useEffect(() => {
        if (gifts.length === 0) {
            setSelectedGiftId("");
            return;
        }
        const stillExists = gifts.some((g) => g._id === selectedGiftId);
        if (!stillExists) {
            setSelectedGiftId(gifts[0]._id);
        }
    }, [gifts, selectedGiftId]);

    const handleSelectGift = useCallback((gift: MaeumGiftItem) => {
        setSelectedGiftId(gift._id);
    }, []);

    return {
        isEventActive: Boolean(giftEvent?.isEventActive && config && gifts.length > 0),
        config,
        gifts,
        selectedGiftId,
        setSelectedGiftId,
        detailModalGift,
        setDetailModalGift,
        handleSelectGift,
    };
}

interface LandingGiftSlotProps {
    state: ReturnType<typeof useLandingGiftEvent>;
    onApplyWithGift: (gift: MaeumGiftItem) => void;
}

export function LandingGiftTop({ state, onApplyWithGift }: LandingGiftSlotProps) {
    if (!state.isEventActive || !state.config) return null;
    return (
        <MaeumGiftEventSection
            position="top"
            config={state.config}
            gifts={state.gifts}
            selectedGiftId={state.selectedGiftId}
            onSelectGift={state.handleSelectGift}
            onOpenDetail={state.setDetailModalGift}
            onApplyWithGift={onApplyWithGift}
        />
    );
}

export function LandingGiftBottom({ state, onApplyWithGift }: LandingGiftSlotProps) {
    if (!state.isEventActive || !state.config) return null;
    return (
        <MaeumGiftEventSection
            position="bottom"
            config={state.config}
            gifts={state.gifts}
            selectedGiftId={state.selectedGiftId}
            onSelectGift={state.handleSelectGift}
            onOpenDetail={state.setDetailModalGift}
            onApplyWithGift={onApplyWithGift}
        />
    );
}

export function LandingGiftOverlays({ state, onApplyWithGift }: LandingGiftSlotProps) {
    if (!state.isEventActive || !state.config) return null;
    return (
        <>
            <FloatingGiftWidget
                config={state.config}
                gifts={state.gifts}
                selectedGiftId={state.selectedGiftId}
                onSelectGift={state.handleSelectGift}
                onOpenDetail={state.setDetailModalGift}
                onApplyWithGift={onApplyWithGift}
            />
            <MaeumGiftDetailModal
                gift={state.detailModalGift}
                commonNotice={state.config.commonNotice}
                onClose={() => state.setDetailModalGift(null)}
                onApplyWithGift={onApplyWithGift}
            />
        </>
    );
}
