// ── Map Popup Content Components ──
// Reusable popup/tooltip content for MapLibre popups.
// Renders as HTML strings for MapLibre Popup API.

import { RISK_COLORS } from "../../config/mapConfig";
import { getRiskLabel, getTrailColor } from "../../utils/geoJsonUtils";

/**
 * Generate HTML content for a fort popup.
 */
export const getFortPopupHTML = (properties) => {
    const { name, elevation, district, region, description, baseVillage } = properties;

    return `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; max-width: 280px;">
            <h3 style="margin: 0 0 6px; font-size: 14px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
                🏰 ${name}
            </h3>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
                <span style="display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; background: #dbeafe; color: #1d4ed8; font-size: 10px; font-weight: 600; border-radius: 999px;">
                    ⛰️ ${elevation}m
                </span>
                <span style="display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; background: #d1fae5; color: #059669; font-size: 10px; font-weight: 600; border-radius: 999px;">
                    📍 ${district}
                </span>
                <span style="display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; background: #ede9fe; color: #7c3aed; font-size: 10px; font-weight: 600; border-radius: 999px;">
                    🗺️ ${region}
                </span>
            </div>
            ${description ? `<p style="margin: 0 0 6px; font-size: 11px; color: #64748b; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${description}</p>` : ""}
            ${baseVillage ? `<p style="margin: 0; font-size: 10px; color: #94a3b8;">Base village: <span style="font-weight: 500; color: #64748b;">${baseVillage}</span></p>` : ""}
        </div>
    `;
};

/**
 * Generate HTML content for a trail tooltip.
 */
export const getTrailTooltipHTML = (properties) => {
    const { name, riskScore, status, distanceKm, isSimulated, color, riskLabel } = properties;

    return `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 160px;">
            <div style="font-weight: 700; font-size: 12px; color: #1e293b; margin-bottom: 4px;">${name}</div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #64748b;">
                <span>Risk: <strong style="color: ${color};">${riskScore}%</strong> <span style="font-size: 9px; font-weight: 600; color: ${color};">${riskLabel}</span></span>
                ${isSimulated ? '<span style="color: #f59e0b; font-weight: 600;">⚡ Simulated</span>' : ""}
                <span>·</span>
                <span style="text-transform: capitalize;">${status}</span>
                <span>·</span>
                <span>${distanceKm} km</span>
            </div>
        </div>
    `;
};

/**
 * Generate HTML content for a cistern tooltip.
 */
export const getCisternTooltipHTML = (properties) => {
    const { name, currentLevelPct, capacityLiters, status } = properties;

    const capacity = Number(capacityLiters).toLocaleString();

    return `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 140px;">
            <div style="font-weight: 700; font-size: 12px; color: #1e293b; display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                💧 ${name}
            </div>
            <div style="font-size: 11px; color: #64748b; line-height: 1.6;">
                <div>Level: <strong>${currentLevelPct}%</strong> / ${capacity}L</div>
                <div style="text-transform: capitalize;">Status: ${status}</div>
            </div>
        </div>
    `;
};

/**
 * Generate HTML content for a severed trail tooltip.
 */
export const getSeveredTrailTooltipHTML = (properties) => {
    const { name, riskScore, severReason, distanceKm } = properties;
    const reasonText = severReason === "authority_severed"
        ? "Manually severed by Authority command"
        : "Critical erosion threshold exceeded (≥75%)";

    return `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 180px;">
            <div style="font-weight: 800; font-size: 12px; color: #dc2626; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                🚨 SEVERED PATH: ${name}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">
                Risk: <strong style="color: #dc2626;">${riskScore}% CRITICAL</strong> · ${distanceKm} km
            </div>
            <div style="font-size: 10px; color: #9f1239; font-weight: 600; background: #ffe4e6; padding: 3px 6px; border-radius: 4px;">
                ⚠️ ${reasonText} — Rerouting via diversion
            </div>
        </div>
    `;
};

/**
 * Generate HTML content for a diversion route segment tooltip.
 */
export const getDiversionTooltipHTML = (properties) => {
    const { name, distanceKm, riskScore } = properties;
    return `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 170px;">
            <div style="font-weight: 800; font-size: 12px; color: #059669; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                ✅ ACTIVE DIVERSION: ${name}
            </div>
            <div style="font-size: 11px; color: #475569;">
                Segment: <strong>${distanceKm} km</strong> · Risk: <span style="color: #059669; font-weight: 600;">${riskScore}% (Safe)</span>
            </div>
        </div>
    `;
};
