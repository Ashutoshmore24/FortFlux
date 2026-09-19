// ── Map Popup Content Components ──
// Reusable popup/tooltip content for MapLibre popups.
// Renders as HTML strings for MapLibre Popup API.

import { RISK_COLORS } from "../../config/mapConfig";
import { getRiskLabel, getTrailColor } from "../../utils/geoJsonUtils";

/**
 * Generate HTML content for a fort popup.
 */
export const getFortPopupHTML = (properties) => {
    const {
        name,
        elevation,
        district,
        region,
        description,
        baseVillage,
        slug,
        temperature,
        precipitation,
        weatherIcon = "☀️",
        weatherDesc = "",
        hasMonsoonSurge,
    } = properties;

    const weatherBadge = temperature != null ? `
        <div style="margin-bottom: 8px; padding: 4px 8px; background: ${hasMonsoonSurge ? "#fef2f2" : "#f0fdf4"}; border: 1px solid ${hasMonsoonSurge ? "#fecaca" : "#bbf7d0"}; border-radius: 8px; display: flex; align-items: center; justify-between; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: ${hasMonsoonSurge ? "#991b1b" : "#166534"};">
                <span>${weatherIcon}</span>
                <span>${temperature}°C · ${weatherDesc || "Sahyadri Climate"}</span>
            </div>
            ${precipitation > 0 ? `
                <span style="font-size: 10px; font-weight: 700; color: ${hasMonsoonSurge ? "#dc2626" : "#0284c7"};">
                    🌧️ ${precipitation} mm/h
                </span>
            ` : ""}
        </div>
    ` : "";

    return `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 210px; max-width: 290px;">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 4px; margin-bottom: 4px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
                    🏰 ${name}
                </h3>
            </div>

            ${weatherBadge}

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
            ${baseVillage ? `<p style="margin: 0 0 6px; font-size: 10px; color: #94a3b8;">Base village: <span style="font-weight: 500; color: #64748b;">${baseVillage}</span></p>` : ""}
            ${slug ? `
                <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #f1f5f9; display: flex; gap: 6px;">
                    <a href="/forts/${slug}/history" style="flex: 1; text-align: center; font-size: 11px; font-weight: 600; color: #059669; text-decoration: none; padding: 5px 8px; background: #ecfdf5; border-radius: 6px; border: 1px solid #a7f3d0; cursor: pointer;">
                        📜 View Heritage History &rarr;
                    </a>
                </div>
            ` : ""}
        </div>
    `;
};

/**
 * Generate HTML content for a trail tooltip.
 */
export const getTrailTooltipHTML = (properties) => {
    const { name, riskScore, status, distanceKm, isSimulated, color, riskLabel } = properties;

    return `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 170px;">
            <div style="font-weight: 700; font-size: 12px; color: #1e293b; margin-bottom: 4px;">${name}</div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #64748b; margin-bottom: 4px;">
                <span>Risk: <strong style="color: ${color};">${riskScore}%</strong> <span style="font-size: 9px; font-weight: 600; color: ${color};">${riskLabel}</span></span>
                ${isSimulated ? '<span style="color: #f59e0b; font-weight: 600;">⚡ Simulated</span>' : ""}
                <span>·</span>
                <span style="text-transform: capitalize;">${status}</span>
                <span>·</span>
                <span>${distanceKm} km</span>
            </div>
            <div style="font-size: 9px; font-weight: 600; color: #059669; background: #f0fdf4; padding: 2px 6px; border-radius: 4px; border: 1px solid #dcfce7; display: flex; align-items: center; gap: 3px;">
                <span>📈 Click to open Elevation Profile</span>
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

/**
 * Generate HTML content for a fort landmark popup on the map.
 * Displays key landmark photos from Fort History, landmark name, category,
 * description, and a direct button to View History Page of that fort.
 */
export const getReportPopupHTML = (properties) => {
    const {
        name,
        landmarkName,
        category,
        description,
        imageUrl,
        duration,
        fortSlug,
        fortName,
    } = properties;

    const displayTitle = landmarkName || name || "Key Fort Landmark";
    const displayCategory = category || "Historic Landmark";
    const displayFort = fortName ? `🏰 ${fortName}` : "";
    const historySlug = fortSlug || "sinhagad";

    return `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 230px; max-width: 275px; overflow: hidden;">
            ${imageUrl ? `
                <div style="width: 100%; height: 135px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #0f172a; position: relative;">
                    <img src="${imageUrl}" alt="${displayTitle}" style="width: 100%; height: 135px; object-fit: cover; display: block;" onerror="this.style.display='none'" />
                    <span style="position: absolute; top: 6px; right: 6px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px); color: #f8fafc; font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.25);">
                        ${displayCategory}
                    </span>
                    ${duration ? `
                        <span style="position: absolute; bottom: 6px; left: 6px; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px); color: #fbbf24; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(251, 191, 36, 0.3);">
                            ⏱️ ${duration}
                        </span>
                    ` : ""}
                </div>
            ` : ""}

            <div style="margin-bottom: 6px;">
                <h4 style="margin: 0 0 2px; font-size: 13px; font-weight: 800; color: #1e293b; line-height: 1.3;">
                    ${displayTitle}
                </h4>
                ${displayFort ? `
                    <div style="font-size: 11px; font-weight: 600; color: #059669; display: flex; align-items: center; gap: 4px;">
                        ${displayFort}
                    </div>
                ` : ""}
            </div>

            ${description ? `
                <p style="font-size: 11px; color: #475569; margin: 0 0 10px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                    ${description}
                </p>
            ` : ""}

            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #f1f5f9;">
                <a href="/forts/${historySlug}/history" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; box-sizing: border-box; text-align: center; font-size: 11px; font-weight: 700; color: #ffffff; background: linear-gradient(135deg, #059669 0%, #047857 100%); text-decoration: none; padding: 7px 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.25); cursor: pointer; transition: opacity 0.2s ease;">
                    <span>📜 View Fort History & Heritage</span>
                    <span style="font-size: 12px;">&rarr;</span>
                </a>
            </div>
        </div>
    `;
};
