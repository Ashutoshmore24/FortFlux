import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Map as MapLibreMap, Popup, Marker, NavigationControl, AttributionControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useFortStore } from "../../store/useFortStore";
import { RiskLegend } from "./RiskLegend";
import MapControls from "./MapControls";
import {
    getFortPopupHTML,
    getTrailTooltipHTML,
    getCisternTooltipHTML,
    getSeveredTrailTooltipHTML,
    getDiversionTooltipHTML,
    getReportPopupHTML,
} from "./MapPopup";
import {
    fortsToGeoJSON,
    trailsToGeoJSON,
    cisternsToGeoJSON,
    computeFortBounds,
    getTrailColor,
    severedTrailsToGeoJSON,
    diversionRouteToGeoJSON,
    reportsToGeoJSON,
} from "../../utils/geoJsonUtils";
import {
    MAPTILER_KEY,
    MAP_STYLES,
    TERRAIN_SOURCE,
    TERRAIN_EXAGGERATION,
    INITIAL_CENTER,
    INITIAL_ZOOM,
    INITIAL_PITCH,
    INITIAL_BEARING,
    FORT_ZOOM,
    FORT_FLY_SPEED,
    TERRAIN_3D_PITCH,
    TERRAIN_3D_BEARING,
    ROTATION_STEP,
    PITCH_STEP,
    MAX_PITCH,
    MIN_PITCH,
    SOURCES,
    LAYERS,
    FORT_MARKER,
    CISTERN_COLORS,
} from "../../config/mapConfig";
import {
    CheckCircle2,
    AlertTriangle,
    Droplets,
    Navigation,
} from "lucide-react";

// ── Empty GeoJSON (used as initial source data) ──
const EMPTY_FC = { type: "FeatureCollection", features: [] };

// ── Helper: safe layer existence check ──
const hasLayer = (map, id) => {
    try {
        if (!map || !map.isStyleLoaded || !map.isStyleLoaded()) return false;
        return !!map.getLayer(id);
    } catch {
        return false;
    }
};
const hasSource = (map, id) => {
    try {
        if (!map || !map.isStyleLoaded || !map.isStyleLoaded()) return false;
        return !!map.getSource(id);
    } catch {
        return false;
    }
};

// ═══════════════════════════════════════════════════════════
// FortMap — MapLibre GL JS Implementation
// Props interface is identical to the original Leaflet version:
//   className, onFortSelect, riskOverrides
// ═══════════════════════════════════════════════════════════
const FortMap = ({
    className = "",
    onFortSelect,
    riskOverrides = null,
    safeRoute = null,
    severedTrails = null,
    diversionRoute = null,
    photoReports = null,
}) => {
    const {
        forts,
        selectedFort,
        fortDetail,
        isLoading,
        fetchForts,
        selectFort,
        clearSelection,
    } = useFortStore();

    // ── Local UI state ──
    const [mapStyle, setMapStyle] = useState("satellite");
    const [showTrails, setShowTrails] = useState(true);
    const [showCisterns, setShowCisterns] = useState(true);
    const [showReports, setShowReports] = useState(true);
    const [terrainEnabled, setTerrainEnabled] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [userLocation, setUserLocation] = useState(null); // [lng, lat]
    const [isFullscreen, setIsFullscreen] = useState(false);
    // 3D Camera & Rotation state
    const [cameraBearing, setCameraBearing] = useState(INITIAL_BEARING);
    const [cameraPitch, setCameraPitch] = useState(INITIAL_PITCH);
    const [isAutoRotating, setIsAutoRotating] = useState(false);
    const [interactionMode, setInteractionMode] = useState("pan"); // "pan" | "rotate"

    // ── Refs ──
    const rootContainerRef = useRef(null);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const popupRef = useRef(null);
    const userMarkerRef = useRef(null);
    const geoWatchRef = useRef(null);
    const autoRotateAnimRef = useRef(null);
    const isOrbitDraggingRef = useRef(false);
    const orbitDragStartRef = useRef({ x: 0, y: 0, bearing: 0, pitch: 0 });
    // Store current data for re-adding after style changes
    const dataRef = useRef({ forts: EMPTY_FC, trails: EMPTY_FC, cisterns: EMPTY_FC, route: EMPTY_FC, reports: EMPTY_FC });
    const stateRef = useRef({ showTrails: true, showCisterns: true, showReports: true, terrainEnabled: false });
    const onFortSelectRef = useRef(onFortSelect);

    useEffect(() => {
        onFortSelectRef.current = onFortSelect;
    }, [onFortSelect]);

    // Keep stateRef in sync
    useEffect(() => {
        stateRef.current = { showTrails, showCisterns, showReports, terrainEnabled };
    }, [showTrails, showCisterns, showReports, terrainEnabled]);

    const trails = fortDetail?.trails || [];
    const cisterns = fortDetail?.cisterns || [];

    // ── Fetch forts on mount ──
    useEffect(() => {
        if (forts.length === 0) fetchForts();
    }, []);

    // ── Memoized GeoJSON ──
    const fortsGeoJSON = useMemo(
        () => fortsToGeoJSON(forts, selectedFort?.slug),
        [forts, selectedFort?.slug]
    );
    const trailsGeoJSON = useMemo(
        () => trailsToGeoJSON(trails, riskOverrides),
        [trails, riskOverrides]
    );
    const cisternsGeoJSON = useMemo(
        () => cisternsToGeoJSON(cisterns),
        [cisterns]
    );

    // ── Safe Route GeoJSON (Phase 5 Adaptive Routing) ──
    const routeGeoJSON = useMemo(() => {
        if (!safeRoute || !safeRoute.safe || !safeRoute.segments?.length) {
            return EMPTY_FC;
        }
        const features = safeRoute.segments
            .filter((seg) => seg.path && seg.path.length >= 2)
            .map((seg) => ({
                type: "Feature",
                properties: {
                    name: seg.name,
                    distanceKm: seg.distanceKm || 0,
                    riskScore: seg.currentRiskScore || 0,
                },
                geometry: {
                    type: "LineString",
                    coordinates: seg.path, // [[lng, lat], ...]
                },
            }));
        return { type: "FeatureCollection", features };
    }, [safeRoute]);

    // ── Severed Trails GeoJSON (Phase 5 Adaptive Routing) ──
    const severedGeoJSON = useMemo(() => {
        return severedTrailsToGeoJSON(severedTrails || []);
    }, [severedTrails]);

    // ── Diversion Route GeoJSON (Phase 5 Adaptive Routing) ──
    const diversionGeoJSON = useMemo(() => {
        return diversionRouteToGeoJSON(diversionRoute);
    }, [diversionRoute]);

    // ── Photo Reports GeoJSON (Phase 6 Crowdsourced Evidence) ──
    const reportsGeoJSON = useMemo(() => {
        return reportsToGeoJSON(photoReports || []);
    }, [photoReports]);

    // Store latest GeoJSON in ref for style.load handler
    useEffect(() => {
        dataRef.current = {
            forts: fortsGeoJSON,
            trails: trailsGeoJSON,
            cisterns: cisternsGeoJSON,
            route: routeGeoJSON,
            severed: severedGeoJSON,
            diversion: diversionGeoJSON,
            reports: reportsGeoJSON,
        };
    }, [fortsGeoJSON, trailsGeoJSON, cisternsGeoJSON, routeGeoJSON, severedGeoJSON, diversionGeoJSON, reportsGeoJSON]);

    // ══════════════════════════════════════════════════════
    // Add GeoJSON sources + layers to the map
    // Called on initial load AND after every style change
    // ══════════════════════════════════════════════════════
    const addSourcesAndLayers = useCallback((map) => {
        if (!map || !map.isStyleLoaded || !map.isStyleLoaded()) return;
        const data = dataRef.current;
        const state = stateRef.current;

        // ── Terrain source (always add for 3D elevation support) ──
        if (!hasSource(map, TERRAIN_SOURCE.id)) {
            try {
                map.addSource(TERRAIN_SOURCE.id, {
                    type: TERRAIN_SOURCE.type,
                    url: TERRAIN_SOURCE.url,
                    tileSize: TERRAIN_SOURCE.tileSize,
                });
            } catch (err) {
                console.warn("[FortFlux] Error adding terrain source:", err);
            }
        }

        // Re-enable terrain if it was enabled before style change
        if (state.terrainEnabled) {
            try {
                map.setTerrain({ source: TERRAIN_SOURCE.id, exaggeration: TERRAIN_EXAGGERATION });
            } catch { /* terrain source may still be loading */ }
        }

        // ── Fort Source + Layers ──
        try {
            if (!hasSource(map, SOURCES.forts)) {
                map.addSource(SOURCES.forts, { type: "geojson", data: data.forts });
            } else {
                map.getSource(SOURCES.forts).setData(data.forts);
            }

            // Fort circles (unselected)
            if (!hasLayer(map, LAYERS.fortCircles)) {
                map.addLayer({
                    id: LAYERS.fortCircles,
                    type: "circle",
                    source: SOURCES.forts,
                    filter: ["!=", ["get", "isSelected"], true],
                    paint: {
                        "circle-radius": [
                            "interpolate", ["linear"], ["zoom"],
                            6, 6,
                            10, 9,
                            14, 13,
                        ],
                        "circle-color": [
                            "case",
                            ["==", ["get", "isSeaFort"], true], FORT_MARKER.seaFort,
                            FORT_MARKER.default,
                        ],
                        "circle-stroke-width": 2.5,
                        "circle-stroke-color": FORT_MARKER.border,
                        "circle-opacity": 0.95,
                    },
                });
            }

            // Fort labels
            if (!hasLayer(map, LAYERS.fortLabels)) {
                map.addLayer({
                    id: LAYERS.fortLabels,
                    type: "symbol",
                    source: SOURCES.forts,
                    layout: {
                        "text-field": ["get", "name"],
                        "text-size": [
                            "interpolate", ["linear"], ["zoom"],
                            6, 0,
                            9, 11,
                            14, 13,
                        ],
                        "text-offset": [0, 1.6],
                        "text-anchor": "top",
                        "text-optional": true,
                        "text-allow-overlap": false,
                    },
                    paint: {
                        "text-color": "#ffffff",
                        "text-halo-color": "rgba(15, 23, 42, 0.9)",
                        "text-halo-width": 2,
                    },
                });
            }

            // Selected fort circle (larger, amber with white border)
            if (!hasLayer(map, LAYERS.fortSelected)) {
                map.addLayer({
                    id: LAYERS.fortSelected,
                    type: "circle",
                    source: SOURCES.forts,
                    filter: ["==", ["get", "isSelected"], true],
                    paint: {
                        "circle-radius": [
                            "interpolate", ["linear"], ["zoom"],
                            6, 9,
                            10, 13,
                            14, 18,
                        ],
                        "circle-color": FORT_MARKER.selected,
                        "circle-stroke-width": 3.5,
                        "circle-stroke-color": "#ffffff",
                        "circle-opacity": 1,
                    },
                });
            }
        } catch (err) {
            console.warn("[FortFlux] Error initializing forts layer:", err);
        }

        // ── Trail Source + Layers ──
        try {
            if (!hasSource(map, SOURCES.trails)) {
                map.addSource(SOURCES.trails, { type: "geojson", data: data.trails });
            } else {
                map.getSource(SOURCES.trails).setData(data.trails);
            }

            // Trail lines
            if (!hasLayer(map, LAYERS.trailLines)) {
                map.addLayer({
                    id: LAYERS.trailLines,
                    type: "line",
                    source: SOURCES.trails,
                    layout: {
                        "line-cap": "round",
                        "line-join": "round",
                        visibility: state.showTrails ? "visible" : "none",
                    },
                    paint: {
                        "line-color": ["coalesce", ["get", "color"], "#22c55e"],
                        "line-width": [
                            "interpolate", ["linear"], ["zoom"],
                            8, 3,
                            12, 5,
                            16, 7,
                        ],
                        "line-opacity": 0.95,
                    },
                });
            }
        } catch (err) {
            console.warn("[FortFlux] Error initializing trails layer:", err);
        }

        // ── Cistern Source + Layers ──
        try {
            if (!hasSource(map, SOURCES.cisterns)) {
                map.addSource(SOURCES.cisterns, { type: "geojson", data: data.cisterns });
            } else {
                map.getSource(SOURCES.cisterns).setData(data.cisterns);
            }

            // Cistern circles
            if (!hasLayer(map, LAYERS.cisternCircles)) {
                map.addLayer({
                    id: LAYERS.cisternCircles,
                    type: "circle",
                    source: SOURCES.cisterns,
                    layout: {
                        visibility: state.showCisterns ? "visible" : "none",
                    },
                    paint: {
                        "circle-radius": [
                            "interpolate", ["linear"], ["zoom"],
                            10, 6,
                            14, 9,
                        ],
                        "circle-color": ["coalesce", ["get", "fillColor"], "#3b82f6"],
                        "circle-opacity": 0.95,
                        "circle-stroke-width": 2.5,
                        "circle-stroke-color": "rgba(255,255,255,0.95)",
                    },
                });
            }
        } catch (err) {
            console.warn("[FortFlux] Error initializing cisterns layer:", err);
        }

        // ── Safe Route Source + Layer (Phase 5 Adaptive Routing) ──
        try {
            if (!hasSource(map, "safe-route-source")) {
                map.addSource("safe-route-source", { type: "geojson", data: data.route || EMPTY_FC });
            } else {
                map.getSource("safe-route-source").setData(data.route || EMPTY_FC);
            }

            // Safe route glow (wider, semi-transparent backdrop)
            if (!hasLayer(map, "safe-route-glow")) {
                map.addLayer({
                    id: "safe-route-glow",
                    type: "line",
                    source: "safe-route-source",
                    layout: {
                        "line-cap": "round",
                        "line-join": "round",
                    },
                    paint: {
                        "line-color": "#22c55e",
                        "line-width": 10,
                        "line-opacity": 0.3,
                    },
                });
            }

            // Safe route line (bright green, thicker than base trails)
            if (!hasLayer(map, "safe-route-line")) {
                map.addLayer({
                    id: "safe-route-line",
                    type: "line",
                    source: "safe-route-source",
                    layout: {
                        "line-cap": "round",
                        "line-join": "round",
                    },
                    paint: {
                        "line-color": "#4ade80",
                        "line-width": 5,
                        "line-opacity": 0.95,
                        "line-dasharray": [2, 1],
                    },
                });
            }
        } catch (err) {
            console.warn("[FortFlux] Error initializing safe route layer:", err);
        }

        // ── Severed Trails Source + Layer (Phase 5 Adaptive Routing) ──
        try {
            if (!hasSource(map, "severed-trails-source")) {
                map.addSource("severed-trails-source", { type: "geojson", data: data.severed || EMPTY_FC });
            } else {
                map.getSource("severed-trails-source").setData(data.severed || EMPTY_FC);
            }

            // Severed trails glow (wide semi-transparent hazard red halo)
            if (!hasLayer(map, "severed-trails-glow")) {
                map.addLayer({
                    id: "severed-trails-glow",
                    type: "line",
                    source: "severed-trails-source",
                    layout: {
                        "line-cap": "round",
                        "line-join": "round",
                    },
                    paint: {
                        "line-color": "#ef4444",
                        "line-width": 14,
                        "line-opacity": 0.45,
                    },
                });
            }

            // Severed trails dashed line (high-visibility hazard red dashed line)
            if (!hasLayer(map, "severed-trails-line")) {
                map.addLayer({
                    id: "severed-trails-line",
                    type: "line",
                    source: "severed-trails-source",
                    layout: {
                        "line-cap": "round",
                        "line-join": "round",
                    },
                    paint: {
                        "line-color": "#dc2626",
                        "line-width": 5,
                        "line-opacity": 1.0,
                        "line-dasharray": [3, 2],
                    },
                });
            }
        } catch (err) {
            console.warn("[FortFlux] Error initializing severed trails layer:", err);
        }

        // ── Diversion Route Source + Layer (Phase 5 Adaptive Routing) ──
        try {
            if (!hasSource(map, "diversion-route-source")) {
                map.addSource("diversion-route-source", { type: "geojson", data: data.diversion || EMPTY_FC });
            } else {
                map.getSource("diversion-route-source").setData(data.diversion || EMPTY_FC);
            }

            // Diversion route glow (pulsing emerald aura)
            if (!hasLayer(map, "diversion-route-glow")) {
                map.addLayer({
                    id: "diversion-route-glow",
                    type: "line",
                    source: "diversion-route-source",
                    layout: {
                        "line-cap": "round",
                        "line-join": "round",
                    },
                    paint: {
                        "line-color": "#10b981",
                        "line-width": 14,
                        "line-opacity": 0.45,
                    },
                });
            }

            // Diversion route line (high-visibility neon green line)
            if (!hasLayer(map, "diversion-route-line")) {
                map.addLayer({
                    id: "diversion-route-line",
                    type: "line",
                    source: "diversion-route-source",
                    layout: {
                        "line-cap": "round",
                        "line-join": "round",
                    },
                    paint: {
                        "line-color": "#22c55e",
                        "line-width": 6,
                        "line-opacity": 0.98,
                        "line-dasharray": [2, 1],
                    },
                });
            }
        } catch (err) {
            console.warn("[FortFlux] Error initializing diversion route layer:", err);
        }

        // ── Photo Reports Source + Layers (Phase 6 Crowdsourced Evidence) ──
        try {
            if (!hasSource(map, "reports-source")) {
                map.addSource("reports-source", { type: "geojson", data: data.reports || EMPTY_FC });
            } else {
                map.getSource("reports-source").setData(data.reports || EMPTY_FC);
            }

            // Photo Reports glow halo
            if (!hasLayer(map, "reports-glow")) {
                map.addLayer({
                    id: "reports-glow",
                    type: "circle",
                    source: "reports-source",
                    layout: {
                        visibility: state.showReports ? "visible" : "none",
                    },
                    paint: {
                        "circle-radius": [
                            "interpolate", ["linear"], ["zoom"],
                            8, 8,
                            12, 14,
                            16, 20,
                        ],
                        "circle-color": ["coalesce", ["get", "severityColor"], "#f59e0b"],
                        "circle-opacity": 0.35,
                    },
                });
            }

            // Photo Reports central circle pin
            if (!hasLayer(map, "reports-circles")) {
                map.addLayer({
                    id: "reports-circles",
                    type: "circle",
                    source: "reports-source",
                    layout: {
                        visibility: state.showReports ? "visible" : "none",
                    },
                    paint: {
                        "circle-radius": [
                            "interpolate", ["linear"], ["zoom"],
                            8, 5,
                            12, 8,
                            16, 11,
                        ],
                        "circle-color": ["coalesce", ["get", "severityColor"], "#f59e0b"],
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#ffffff",
                        "circle-opacity": 0.95,
                    },
                });
            }
        } catch (err) {
            console.warn("[FortFlux] Error initializing photo reports layer:", err);
        }
    }, []);

    // ══════════════════════════════════════════════════════
    // Initialize MapLibre map (runs once)
    // ══════════════════════════════════════════════════════
    useEffect(() => {
        if (!MAPTILER_KEY) {
            console.error("[FortFlux] MapTiler API key is missing. Add VITE_MAPTILER_API_KEY to .env");
            return;
        }
        if (!mapContainerRef.current || mapRef.current) return;

        const initialStyle = MAP_STYLES.satellite?.style || MAP_STYLES.satellite?.url;

        const map = new MapLibreMap({
            container: mapContainerRef.current,
            style: initialStyle,
            center: INITIAL_CENTER,
            zoom: INITIAL_ZOOM,
            pitch: INITIAL_PITCH,
            bearing: INITIAL_BEARING,
            maxBounds: undefined, // Allow free panning, use fitBounds for initial view
            attributionControl: false,
        });

        // Error logging
        map.on("error", (e) => {
            if (e?.error?.status === 404) return;
            console.warn("[FortFlux MapLibre]", e?.error?.message || e);
        });

        // Add compact attribution
        map.addControl(new AttributionControl({ compact: true }), "bottom-left");

        // Add zoom/navigation controls
        map.addControl(new NavigationControl({ showCompass: true, showZoom: true }), "top-left");

        // Create reusable popup
        popupRef.current = new Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: "300px",
            className: "fortflux-popup",
        });

        // ── On style / map loaded ──
        const handleMapReady = () => {
            if (!map.isStyleLoaded || !map.isStyleLoaded()) {
                map.once("style.load", () => {
                    addSourcesAndLayers(map);
                    setMapReady(true);
                });
                return;
            }
            addSourcesAndLayers(map);
            setMapReady(true);
        };

        map.on("load", handleMapReady);
        map.on("style.load", handleMapReady);

        // ── Camera orientation tracking ──
        const updateCameraState = () => {
            setCameraBearing(map.getBearing());
            setCameraPitch(map.getPitch());
        };
        map.on("rotate", updateCameraState);
        map.on("pitch", updateCameraState);
        map.on("moveend", updateCameraState);

        // Interrupt auto-rotate if user manually drags or touches
        const handleUserInterrupt = () => {
            setIsAutoRotating(false);
        };
        map.on("dragstart", handleUserInterrupt);
        map.on("rotatestart", handleUserInterrupt);
        map.on("pitchstart", handleUserInterrupt);

        // ── Fort click handler (unselected and selected markers) ──
        const handleFortClick = (e) => {
            if (!e.features?.length) return;
            const props = e.features[0].properties;
            const coords = e.features[0].geometry.coordinates.slice();

            // Show popup
            popupRef.current
                .setLngLat(coords)
                .setHTML(getFortPopupHTML(props))
                .addTo(map);

            // Direct smooth zoom into clicked fort
            map.flyTo({
                center: coords,
                zoom: FORT_ZOOM,
                speed: FORT_FLY_SPEED,
                essential: true,
            });

            // Trigger fort selection via Zustand store
            const fortObj = {
                _id: props.id,
                name: props.name,
                slug: props.slug,
                elevation: props.elevation,
                district: props.district,
                region: props.region,
                description: props.description,
                baseVillage: props.baseVillage,
                location: { coordinates: coords },
            };
            selectFort(fortObj);
            if (onFortSelectRef.current) onFortSelectRef.current(fortObj);
        };

        map.on("click", LAYERS.fortCircles, handleFortClick);
        map.on("click", LAYERS.fortSelected, handleFortClick);

        // ── Trail hover/click for tooltip ──
        map.on("mouseenter", LAYERS.trailLines, (e) => {
            map.getCanvas().style.cursor = "pointer";
            if (!e.features?.length) return;
            const props = e.features[0].properties;
            popupRef.current
                .setLngLat(e.lngLat)
                .setHTML(getTrailTooltipHTML(props))
                .addTo(map);
        });
        map.on("mouseleave", LAYERS.trailLines, () => {
            map.getCanvas().style.cursor = "";
            popupRef.current.remove();
        });

        // ── Cistern hover/click for tooltip ──
        map.on("mouseenter", LAYERS.cisternCircles, (e) => {
            map.getCanvas().style.cursor = "pointer";
            if (!e.features?.length) return;
            const props = e.features[0].properties;
            const coords = e.features[0].geometry.coordinates.slice();
            popupRef.current
                .setLngLat(coords)
                .setHTML(getCisternTooltipHTML(props))
                .addTo(map);
        });
        map.on("mouseleave", LAYERS.cisternCircles, () => {
            map.getCanvas().style.cursor = "";
            popupRef.current.remove();
        });

        // ── Severed trail hover for tooltip ──
        map.on("mouseenter", "severed-trails-line", (e) => {
            map.getCanvas().style.cursor = "pointer";
            if (!e.features?.length) return;
            const props = e.features[0].properties;
            popupRef.current
                .setLngLat(e.lngLat)
                .setHTML(getSeveredTrailTooltipHTML(props))
                .addTo(map);
        });
        map.on("mouseleave", "severed-trails-line", () => {
            map.getCanvas().style.cursor = "";
            popupRef.current.remove();
        });

        // ── Diversion route hover for tooltip ──
        map.on("mouseenter", "diversion-route-line", (e) => {
            map.getCanvas().style.cursor = "pointer";
            if (!e.features?.length) return;
            const props = e.features[0].properties;
            popupRef.current
                .setLngLat(e.lngLat)
                .setHTML(getDiversionTooltipHTML(props))
                .addTo(map);
        });
        map.on("mouseleave", "diversion-route-line", () => {
            map.getCanvas().style.cursor = "";
            popupRef.current.remove();
        });

        // ── Photo Reports hover / click for popup ──
        map.on("mouseenter", "reports-circles", (e) => {
            map.getCanvas().style.cursor = "pointer";
            if (!e.features?.length) return;
            const props = e.features[0].properties;
            const coords = e.features[0].geometry.coordinates.slice();
            popupRef.current
                .setLngLat(coords)
                .setHTML(getReportPopupHTML(props))
                .addTo(map);
        });
        map.on("mouseleave", "reports-circles", () => {
            map.getCanvas().style.cursor = "";
            popupRef.current.remove();
        });
        map.on("click", "reports-circles", (e) => {
            if (!e.features?.length) return;
            const props = e.features[0].properties;
            const coords = e.features[0].geometry.coordinates.slice();
            popupRef.current
                .setLngLat(coords)
                .setHTML(getReportPopupHTML(props))
                .addTo(map);
        });

        // ── Fort hover cursor ──
        const setPointer = () => { map.getCanvas().style.cursor = "pointer"; };
        const resetPointer = () => { map.getCanvas().style.cursor = ""; };
        map.on("mouseenter", LAYERS.fortCircles, setPointer);
        map.on("mouseleave", LAYERS.fortCircles, resetPointer);
        map.on("mouseenter", LAYERS.fortSelected, setPointer);
        map.on("mouseleave", LAYERS.fortSelected, resetPointer);

        mapRef.current = map;

        // Cleanup on unmount
        return () => {
            if (geoWatchRef.current !== null) {
                navigator.geolocation.clearWatch(geoWatchRef.current);
            }
            if (autoRotateAnimRef.current) {
                cancelAnimationFrame(autoRotateAnimRef.current);
                autoRotateAnimRef.current = null;
            }
            popupRef.current?.remove();
            userMarkerRef.current?.remove();
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // ══════════════════════════════════════════════════════
    // Update GeoJSON sources when data changes
    // ══════════════════════════════════════════════════════
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || !map.isStyleLoaded || !map.isStyleLoaded()) return;
        try {
            if (!hasSource(map, SOURCES.forts) || !hasLayer(map, LAYERS.fortCircles)) {
                addSourcesAndLayers(map);
            }
            const fortSrc = map.getSource(SOURCES.forts);
            if (fortSrc) fortSrc.setData(fortsGeoJSON);
        } catch (err) {
            console.warn("[FortMap] Error updating forts GeoJSON:", err);
        }
    }, [fortsGeoJSON, mapReady, addSourcesAndLayers]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || !map.isStyleLoaded || !map.isStyleLoaded()) return;
        try {
            if (!hasSource(map, SOURCES.trails) || !hasLayer(map, LAYERS.trailLines)) {
                addSourcesAndLayers(map);
            }
            const trailSrc = map.getSource(SOURCES.trails);
            if (trailSrc) trailSrc.setData(trailsGeoJSON);
        } catch (err) {
            console.warn("[FortMap] Error updating trails GeoJSON:", err);
        }
    }, [trailsGeoJSON, mapReady, addSourcesAndLayers]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || !map.isStyleLoaded || !map.isStyleLoaded()) return;
        try {
            if (!hasSource(map, SOURCES.cisterns) || !hasLayer(map, LAYERS.cisternCircles)) {
                addSourcesAndLayers(map);
            }
            const cisternSrc = map.getSource(SOURCES.cisterns);
            if (cisternSrc) cisternSrc.setData(cisternsGeoJSON);
        } catch (err) {
            console.warn("[FortMap] Error updating cisterns GeoJSON:", err);
        }
    }, [cisternsGeoJSON, mapReady, addSourcesAndLayers]);

    // Update safe route source when route changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || !map.isStyleLoaded || !map.isStyleLoaded()) return;
        try {
            const routeSrc = map.getSource("safe-route-source");
            if (routeSrc) routeSrc.setData(routeGeoJSON);
        } catch (err) {
            console.warn("[FortMap] Error updating safe route:", err);
        }
    }, [routeGeoJSON, mapReady]);

    // Update severed trails source when severed trails change
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || !map.isStyleLoaded || !map.isStyleLoaded()) return;
        try {
            const severedSrc = map.getSource("severed-trails-source");
            if (severedSrc) severedSrc.setData(severedGeoJSON);
        } catch (err) {
            console.warn("[FortMap] Error updating severed trails:", err);
        }
    }, [severedGeoJSON, mapReady]);

    // Update diversion route source when diversion changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || !map.isStyleLoaded || !map.isStyleLoaded()) return;
        try {
            const diversionSrc = map.getSource("diversion-route-source");
            if (diversionSrc) diversionSrc.setData(diversionGeoJSON);
        } catch (err) {
            console.warn("[FortMap] Error updating diversion route:", err);
        }
    }, [diversionGeoJSON, mapReady]);

    // Update photo reports source when photo reports change
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || !map.isStyleLoaded || !map.isStyleLoaded()) return;
        try {
            const reportSrc = map.getSource("reports-source");
            if (reportSrc) reportSrc.setData(reportsGeoJSON);
        } catch (err) {
            console.warn("[FortMap] Error updating reports:", err);
        }
    }, [reportsGeoJSON, mapReady]);

    // ══════════════════════════════════════════════════════
    // Fit bounds to all forts on initial data load (if no fort pre-selected)
    // ══════════════════════════════════════════════════════
    const hasFittedRef = useRef(false);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || hasFittedRef.current || forts.length === 0) return;

        // If a fort is already selected, let the selectedFort flyTo handle it
        if (selectedFort?.slug) {
            hasFittedRef.current = true;
            return;
        }

        const bounds = computeFortBounds(forts);
        if (bounds) {
            map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 1000 });
            hasFittedRef.current = true;
        }
    }, [forts, mapReady, selectedFort?.slug]);

    // ══════════════════════════════════════════════════════
    // Fly to selected fort
    // ══════════════════════════════════════════════════════
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || !selectedFort) return;

        let coords = selectedFort.location?.coordinates;
        if (!coords && selectedFort.coordinates) coords = selectedFort.coordinates;
        if (!coords && selectedFort.lat && selectedFort.lng) coords = [selectedFort.lng, selectedFort.lat];
        if (!coords && forts && forts.length > 0) {
            const match = forts.find((f) => f.slug === selectedFort.slug);
            coords = match?.location?.coordinates;
        }

        if (coords && Array.isArray(coords) && coords.length >= 2) {
            const [lng, lat] = coords;
            if (!isNaN(lng) && !isNaN(lat)) {
                map.flyTo({
                    center: [lng, lat],
                    zoom: FORT_ZOOM,
                    speed: FORT_FLY_SPEED,
                    essential: true,
                });
            }
        }
    }, [selectedFort?.slug, mapReady, forts]);

    // ══════════════════════════════════════════════════════
    // Layer visibility toggles
    // ══════════════════════════════════════════════════════
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || !map.isStyleLoaded || !map.isStyleLoaded()) return;
        try {
            if (hasLayer(map, LAYERS.trailLines)) {
                map.setLayoutProperty(LAYERS.trailLines, "visibility", showTrails ? "visible" : "none");
            }
        } catch (err) {
            console.warn("[FortMap] Error setting trail visibility:", err);
        }
    }, [showTrails, mapReady]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || !map.isStyleLoaded || !map.isStyleLoaded()) return;
        try {
            if (hasLayer(map, LAYERS.cisternCircles)) {
                map.setLayoutProperty(LAYERS.cisternCircles, "visibility", showCisterns ? "visible" : "none");
            }
        } catch (err) {
            console.warn("[FortMap] Error setting cistern visibility:", err);
        }
    }, [showCisterns, mapReady]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || !map.isStyleLoaded || !map.isStyleLoaded()) return;
        try {
            if (hasLayer(map, "reports-glow")) {
                map.setLayoutProperty("reports-glow", "visibility", showReports ? "visible" : "none");
            }
            if (hasLayer(map, "reports-circles")) {
                map.setLayoutProperty("reports-circles", "visibility", showReports ? "visible" : "none");
            }
        } catch (err) {
            console.warn("[FortMap] Error setting reports visibility:", err);
        }
    }, [showReports, mapReady]);

    // ══════════════════════════════════════════════════════
    // Style Change Handler
    // ══════════════════════════════════════════════════════
    const handleStyleChange = useCallback((styleId) => {
        const map = mapRef.current;
        if (!map || !MAP_STYLES[styleId]) return;

        setMapStyle(styleId);
        setMapReady(false);

        // Support both pre-built style objects (raster topo) and style URLs (hybrid satellite)
        const targetStyle = MAP_STYLES[styleId].style || MAP_STYLES[styleId].url;
        map.setStyle(targetStyle);
    }, []);

    // ══════════════════════════════════════════════════════
    // 3D Terrain Toggle
    // ══════════════════════════════════════════════════════
    const handleToggleTerrain = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;

        const newEnabled = !terrainEnabled;
        setTerrainEnabled(newEnabled);

        if (newEnabled) {
            // Ensure terrain source exists
            if (!hasSource(map, TERRAIN_SOURCE.id)) {
                map.addSource(TERRAIN_SOURCE.id, {
                    type: TERRAIN_SOURCE.type,
                    url: TERRAIN_SOURCE.url,
                    tileSize: TERRAIN_SOURCE.tileSize,
                });
            }
            map.setTerrain({ source: TERRAIN_SOURCE.id, exaggeration: TERRAIN_EXAGGERATION });
            map.easeTo({ pitch: TERRAIN_3D_PITCH, bearing: TERRAIN_3D_BEARING, duration: 1000 });
        } else {
            setIsAutoRotating(false);
            setInteractionMode("pan");
            map.setTerrain(null);
            map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
        }
    }, [terrainEnabled]);

    // ══════════════════════════════════════════════════════
    // Reset View
    // ══════════════════════════════════════════════════════
    const handleResetView = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;

        setIsAutoRotating(false);
        setInteractionMode("pan");
        clearSelection();
        popupRef.current?.remove();

        const bounds = computeFortBounds(forts);
        if (bounds) {
            map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 1000 });
        } else {
            map.flyTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM, pitch: 0, bearing: 0 });
        }

        if (!terrainEnabled) {
            map.easeTo({ pitch: 0, bearing: 0, duration: 600 });
        }
    }, [forts, terrainEnabled, clearSelection]);

    // ══════════════════════════════════════════════════════
    // 3D Auto-Orbit Animation Loop
    // ══════════════════════════════════════════════════════
    useEffect(() => {
        if (!isAutoRotating) {
            if (autoRotateAnimRef.current) {
                cancelAnimationFrame(autoRotateAnimRef.current);
                autoRotateAnimRef.current = null;
            }
            return;
        }

        let lastTime = performance.now();
        const rotateFrame = (now) => {
            const dt = (now - lastTime) / 1000;
            lastTime = now;
            const map = mapRef.current;
            if (map) {
                map.setBearing(map.getBearing() + 15 * dt);
            }
            autoRotateAnimRef.current = requestAnimationFrame(rotateFrame);
        };

        autoRotateAnimRef.current = requestAnimationFrame(rotateFrame);

        return () => {
            if (autoRotateAnimRef.current) {
                cancelAnimationFrame(autoRotateAnimRef.current);
                autoRotateAnimRef.current = null;
            }
        };
    }, [isAutoRotating]);

    // ══════════════════════════════════════════════════════
    // 3D Orbit Interaction Drag Mode (Left-Click to Rotate & Tilt)
    // ══════════════════════════════════════════════════════
    useEffect(() => {
        const map = mapRef.current;
        const container = mapContainerRef.current;
        if (!map || !container) return;

        if (interactionMode === "rotate") {
            map.dragPan.disable();
            map.getCanvas().style.cursor = "grab";
        } else {
            map.dragPan.enable();
            map.getCanvas().style.cursor = "";
        }

        const handleMouseDown = (e) => {
            if (interactionMode !== "rotate" || e.button !== 0) return;
            // Ignore clicks on popups or control overlays
            if (e.target.closest && (e.target.closest(".fortflux-popup") || e.target.closest(".maplibregl-popup") || e.target.closest("button") || e.target.closest(".maplibregl-ctrl"))) {
                return;
            }

            setIsAutoRotating(false);
            isOrbitDraggingRef.current = true;
            orbitDragStartRef.current = {
                x: e.clientX,
                y: e.clientY,
                bearing: map.getBearing(),
                pitch: map.getPitch(),
            };
            if (map.getCanvas()) map.getCanvas().style.cursor = "grabbing";
        };

        const handleMouseMove = (e) => {
            if (!isOrbitDraggingRef.current || interactionMode !== "rotate") return;
            const dx = e.clientX - orbitDragStartRef.current.x;
            const dy = e.clientY - orbitDragStartRef.current.y;

            if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;

            const newBearing = orbitDragStartRef.current.bearing + dx * 0.45;
            const newPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, orbitDragStartRef.current.pitch - dy * 0.35));

            map.setBearing(newBearing);
            map.setPitch(newPitch);
        };

        const handleMouseUp = () => {
            if (isOrbitDraggingRef.current) {
                isOrbitDraggingRef.current = false;
                if (map && map.getCanvas()) {
                    map.getCanvas().style.cursor = interactionMode === "rotate" ? "grab" : "";
                }
            }
        };

        const handleTouchStart = (e) => {
            if (interactionMode !== "rotate" || e.touches.length !== 1) return;
            const touch = e.touches[0];
            if (touch.target.closest && (touch.target.closest(".fortflux-popup") || touch.target.closest("button") || touch.target.closest(".maplibregl-ctrl"))) {
                return;
            }
            setIsAutoRotating(false);
            isOrbitDraggingRef.current = true;
            orbitDragStartRef.current = {
                x: touch.clientX,
                y: touch.clientY,
                bearing: map.getBearing(),
                pitch: map.getPitch(),
            };
        };

        const handleTouchMove = (e) => {
            if (!isOrbitDraggingRef.current || interactionMode !== "rotate" || e.touches.length !== 1) return;
            const touch = e.touches[0];
            const dx = touch.clientX - orbitDragStartRef.current.x;
            const dy = touch.clientY - orbitDragStartRef.current.y;

            const newBearing = orbitDragStartRef.current.bearing + dx * 0.45;
            const newPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, orbitDragStartRef.current.pitch - dy * 0.35));

            map.setBearing(newBearing);
            map.setPitch(newPitch);
        };

        const handleTouchEnd = () => {
            isOrbitDraggingRef.current = false;
        };

        container.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        container.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchmove", handleTouchMove, { passive: true });
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            container.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);

            container.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [interactionMode]);

    // ── 3D Camera Discrete Controls ──
    const handleRotateLeft = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;
        setIsAutoRotating(false);
        map.easeTo({ bearing: map.getBearing() - ROTATION_STEP, duration: 350 });
    }, []);

    const handleRotateRight = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;
        setIsAutoRotating(false);
        map.easeTo({ bearing: map.getBearing() + ROTATION_STEP, duration: 350 });
    }, []);

    const handlePitchUp = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;
        const currentPitch = map.getPitch();
        map.easeTo({ pitch: Math.min(MAX_PITCH, currentPitch + PITCH_STEP), duration: 350 });
    }, []);

    const handlePitchDown = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;
        const currentPitch = map.getPitch();
        map.easeTo({ pitch: Math.max(MIN_PITCH, currentPitch - PITCH_STEP), duration: 350 });
    }, []);

    const handleResetNorth = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;
        setIsAutoRotating(false);
        map.easeTo({ bearing: 0, duration: 400 });
    }, []);

    const handleToggleAutoRotate = useCallback(() => {
        setIsAutoRotating((prev) => !prev);
    }, []);

    const handleToggleInteractionMode = useCallback((mode) => {
        setInteractionMode(mode);
    }, []);

    // ── Fullscreen Toggle ──
    const handleToggleFullscreen = useCallback(() => {
        const root = rootContainerRef.current;
        if (!root) return;

        if (!document.fullscreenElement && !isFullscreen) {
            if (root.requestFullscreen) {
                root.requestFullscreen().catch(() => {
                    setIsFullscreen(true);
                });
            } else if (root.webkitRequestFullscreen) {
                root.webkitRequestFullscreen();
            } else {
                setIsFullscreen(true);
            }
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
            setIsFullscreen(false);
        }

        setTimeout(() => {
            if (mapRef.current) mapRef.current.resize();
        }, 80);
        setTimeout(() => {
            if (mapRef.current) mapRef.current.resize();
        }, 300);
    }, [isFullscreen]);

    // Keep isFullscreen in sync with ESC key and browser fullscreen events
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);
            setTimeout(() => {
                if (mapRef.current) mapRef.current.resize();
            }, 100);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
        };
    }, []);


    // ══════════════════════════════════════════════════════
    // GPS / Locate Me
    // ══════════════════════════════════════════════════════
    const handleLocateMe = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;

        if (isLocating) {
            // Stop watching
            if (geoWatchRef.current !== null) {
                navigator.geolocation.clearWatch(geoWatchRef.current);
                geoWatchRef.current = null;
            }
            userMarkerRef.current?.remove();
            userMarkerRef.current = null;
            setIsLocating(false);
            setUserLocation(null);
            return;
        }

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setIsLocating(true);

        // Create user location marker
        const el = document.createElement("div");
        el.style.cssText = `
            width: 16px; height: 16px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0,0,0,0.3);
        `;

        const marker = new Marker({ element: el });
        userMarkerRef.current = marker;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { longitude, latitude, accuracy } = pos.coords;
                marker.setLngLat([longitude, latitude]).addTo(map);
                setUserLocation([longitude, latitude]);

                // Fly to user on first fix
                if (geoWatchRef.current === watchId) {
                    // Already watching, just update position
                } else {
                    map.flyTo({ center: [longitude, latitude], zoom: 13 });
                }
            },
            (err) => {
                console.warn("[FortFlux] Geolocation error:", err.message);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );

        geoWatchRef.current = watchId;
    }, [isLocating]);

    // ══════════════════════════════════════════════════════
    // Missing API Key — show error
    // ══════════════════════════════════════════════════════
    if (!MAPTILER_KEY) {
        return (
            <div className={`relative rounded-2xl overflow-hidden border border-rose-300 bg-[#F8FAF8] flex items-center justify-center ${className}`}
                style={{ minHeight: "500px" }}
            >
                <div className="text-center p-6">
                    <div className="text-rose-700 text-lg font-bold mb-2">⚠️ MapTiler API Key Missing</div>
                    <p className="text-slate-600 text-sm">
                        Add <code className="bg-slate-100 border border-[#E2ECE4] px-2 py-0.5 rounded text-emerald-800 font-mono">VITE_MAPTILER_API_KEY</code> to your <code className="bg-slate-100 border border-[#E2ECE4] px-2 py-0.5 rounded text-emerald-800 font-mono">.env</code> file.
                    </p>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════
    // Render
    // ══════════════════════════════════════════════════════
    return (
        <div
            ref={rootContainerRef}
            className={`overflow-hidden transition-all duration-300 ${
                isFullscreen
                    ? "fixed inset-0 z-[9999] w-screen h-screen rounded-none bg-[#F5F8F4]"
                    : `relative rounded-2xl border border-[#E2ECE4] shadow-sm ${className}`
            }`}
        >
            {/* MapLibre GL container */}
            <div
                ref={mapContainerRef}
                style={{ height: "100%", width: "100%", minHeight: isFullscreen ? "100vh" : "600px" }}
                className="bg-[#EEF5EF]"
            />

            {/* Map Controls Overlay */}
            <MapControls
                mapStyle={mapStyle}
                onStyleChange={handleStyleChange}
                showTrails={showTrails}
                onToggleTrails={() => setShowTrails(!showTrails)}
                showCisterns={showCisterns}
                onToggleCisterns={() => setShowCisterns(!showCisterns)}
                showReports={showReports}
                onToggleReports={() => setShowReports(!showReports)}
                terrainEnabled={terrainEnabled}
                onToggleTerrain={handleToggleTerrain}
                onResetView={handleResetView}
                onLocateMe={handleLocateMe}
                isLocating={isLocating}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
                bearing={cameraBearing}
                pitch={cameraPitch}
                onRotateLeft={handleRotateLeft}
                onRotateRight={handleRotateRight}
                onPitchUp={handlePitchUp}
                onPitchDown={handlePitchDown}
                onResetNorth={handleResetNorth}
                isAutoRotating={isAutoRotating}
                onToggleAutoRotate={handleToggleAutoRotate}
                interactionMode={interactionMode}
                onToggleInteractionMode={handleToggleInteractionMode}
            />

            {/* Fort Info Panel (shown when a fort is selected) */}
            {selectedFort && fortDetail && (
                <div className="absolute bottom-3 left-3 right-3 z-[10] bg-white/95 backdrop-blur-md border border-[#E2ECE4] rounded-2xl p-4 max-w-md shadow-lg">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <h3 className="font-bold text-[#132A22] text-sm flex items-center gap-1.5">
                                🏰 {selectedFort.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                {selectedFort.elevation}m ASL · {selectedFort.district} · {selectedFort.region}
                            </p>
                        </div>
                        <button
                            onClick={() => { clearSelection(); popupRef.current?.remove(); }}
                            className="text-slate-400 hover:text-slate-700 text-xs bg-[#F5F8F4] hover:bg-slate-100 px-2 py-1 rounded-lg transition cursor-pointer"
                            aria-label="Close fort detail panel"
                        >
                            ✕
                        </button>
                    </div>

                    {isLocating && userLocation && selectedFort?.location?.coordinates && (
                        <div className="mb-3">
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation[1]},${userLocation[0]}&destination=${selectedFort.location.coordinates[1]},${selectedFort.location.coordinates[0]}&travelmode=driving`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-2 px-3 rounded-xl transition shadow-xs"
                            >
                                <Navigation className="w-3.5 h-3.5" />
                                Find Route (Car/Bike) to Entry Gate
                            </a>
                        </div>
                    )}

                    {/* Trail summary */}
                    {trails.length > 0 && (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            {trails.map((trail) => {
                                const effectiveRisk = riskOverrides?.get(trail._id) ?? trail.currentRiskScore;
                                const effectiveStatus = effectiveRisk >= 75 ? "closed" : trail.status;
                                const color = getTrailColor(effectiveStatus, effectiveRisk);

                                return (
                                    <div
                                        key={trail._id}
                                        className="flex items-center justify-between text-[11px] bg-[#F8FAF8] border border-[#E2ECE4] rounded-lg px-3 py-2"
                                    >
                                        <div className="flex-1 min-w-0 mr-2">
                                            <div className="font-semibold text-slate-800 truncate">{trail.name}</div>
                                            <div className="text-slate-500 text-[10px]">{trail.distanceKm} km · {trail.difficulty}</div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="font-bold text-[10px]" style={{ color }}>
                                                Risk {Math.round(effectiveRisk)}%
                                            </span>
                                            {effectiveStatus === "open" ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            ) : effectiveStatus === "caution" ? (
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                            ) : (
                                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Cistern summary */}
                    {cisterns.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-600">
                            <Droplets className="w-3 h-3 text-blue-600" />
                            <span>{cisterns.length} cistern{cisterns.length > 1 ? "s" : ""} ·
                                Total capacity: {cisterns.reduce((s, c) => s + c.capacityLiters, 0).toLocaleString()}L
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Risk Legend */}
            <RiskLegend />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-[10] bg-white/50 backdrop-blur-xs flex items-center justify-center">
                    <div className="flex items-center gap-3 bg-white border border-[#E2ECE4] rounded-xl px-5 py-3 shadow-md">
                        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-semibold text-[#132A22]">Loading forts...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FortMap;
