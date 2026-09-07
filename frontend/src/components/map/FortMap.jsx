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
} from "./MapPopup";
import {
    fortsToGeoJSON,
    trailsToGeoJSON,
    cisternsToGeoJSON,
    computeFortBounds,
    getTrailColor,
    severedTrailsToGeoJSON,
    diversionRouteToGeoJSON,
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
    try { return !!map.getLayer(id); } catch { return false; }
};
const hasSource = (map, id) => {
    try { return !!map.getSource(id); } catch { return false; }
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
    const [terrainEnabled, setTerrainEnabled] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [userLocation, setUserLocation] = useState(null); // [lng, lat]

    // ── Refs ──
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const popupRef = useRef(null);
    const userMarkerRef = useRef(null);
    const geoWatchRef = useRef(null);
    // Store current data for re-adding after style changes
    const dataRef = useRef({ forts: EMPTY_FC, trails: EMPTY_FC, cisterns: EMPTY_FC, route: EMPTY_FC });
    const stateRef = useRef({ showTrails: true, showCisterns: true, terrainEnabled: false });

    // Keep stateRef in sync
    useEffect(() => {
        stateRef.current = { showTrails, showCisterns, terrainEnabled };
    }, [showTrails, showCisterns, terrainEnabled]);

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

    // Store latest GeoJSON in ref for style.load handler
    useEffect(() => {
        dataRef.current = {
            forts: fortsGeoJSON,
            trails: trailsGeoJSON,
            cisterns: cisternsGeoJSON,
            route: routeGeoJSON,
            severed: severedGeoJSON,
            diversion: diversionGeoJSON,
        };
    }, [fortsGeoJSON, trailsGeoJSON, cisternsGeoJSON, routeGeoJSON, severedGeoJSON, diversionGeoJSON]);

    // ══════════════════════════════════════════════════════
    // Add GeoJSON sources + layers to the map
    // Called on initial load AND after every style change
    // ══════════════════════════════════════════════════════
    const addSourcesAndLayers = useCallback((map) => {
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

        // ── Trail Source + Layers ──
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
                        8, 2.5,
                        12, ["coalesce", ["get", "width"], 4],
                        16, 6,
                    ],
                    "line-opacity": 0.9,
                },
            });
        }

        // ── Cistern Source + Layers ──
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
                        10, 5,
                        14, 8,
                    ],
                    "circle-color": ["coalesce", ["get", "fillColor"], "#3b82f6"],
                    "circle-opacity": 0.9,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "rgba(255,255,255,0.9)",
                },
            });
        }

        // ── Safe Route Source + Layer (Phase 5 Adaptive Routing) ──
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

        // ── Severed Trails Source + Layer (Phase 5 Adaptive Routing) ──
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

        // ── Diversion Route Source + Layer (Phase 5 Adaptive Routing) ──
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
            addSourcesAndLayers(map);
            setMapReady(true);
        };

        map.on("load", handleMapReady);
        map.on("style.load", handleMapReady);
        map.on("styledata", handleMapReady);

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
            if (onFortSelect) onFortSelect(fortObj);
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
            popupRef.current?.remove();
            userMarkerRef.current?.remove();
            map.remove();
            mapRef.current = null;
        };
    }, [addSourcesAndLayers, onFortSelect, selectFort]);

    // ══════════════════════════════════════════════════════
    // Update GeoJSON sources when data changes
    // ══════════════════════════════════════════════════════
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (map.isStyleLoaded()) {
            addSourcesAndLayers(map);
        }
        const fortSrc = map.getSource(SOURCES.forts);
        if (fortSrc) fortSrc.setData(fortsGeoJSON);
    }, [fortsGeoJSON, addSourcesAndLayers]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (map.isStyleLoaded()) {
            addSourcesAndLayers(map);
        }
        const trailSrc = map.getSource(SOURCES.trails);
        if (trailSrc) trailSrc.setData(trailsGeoJSON);
    }, [trailsGeoJSON, addSourcesAndLayers]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (map.isStyleLoaded()) {
            addSourcesAndLayers(map);
        }
        const cisternSrc = map.getSource(SOURCES.cisterns);
        if (cisternSrc) cisternSrc.setData(cisternsGeoJSON);
    }, [cisternsGeoJSON, addSourcesAndLayers]);

    // Update safe route source when route changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (map.isStyleLoaded()) {
            addSourcesAndLayers(map);
        }
        const routeSrc = map.getSource("safe-route-source");
        if (routeSrc) routeSrc.setData(routeGeoJSON);
    }, [routeGeoJSON, addSourcesAndLayers]);

    // Update severed trails source when severed trails change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (map.isStyleLoaded()) {
            addSourcesAndLayers(map);
        }
        const severedSrc = map.getSource("severed-trails-source");
        if (severedSrc) severedSrc.setData(severedGeoJSON);
    }, [severedGeoJSON, addSourcesAndLayers]);

    // Update diversion route source when diversion changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (map.isStyleLoaded()) {
            addSourcesAndLayers(map);
        }
        const diversionSrc = map.getSource("diversion-route-source");
        if (diversionSrc) diversionSrc.setData(diversionGeoJSON);
    }, [diversionGeoJSON, addSourcesAndLayers]);

    // ══════════════════════════════════════════════════════
    // Fit bounds to all forts on initial data load
    // ══════════════════════════════════════════════════════
    const hasFittedRef = useRef(false);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || hasFittedRef.current || forts.length === 0) return;

        const bounds = computeFortBounds(forts);
        if (bounds) {
            map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 1000 });
            hasFittedRef.current = true;
        }
    }, [forts, mapReady]);

    // ══════════════════════════════════════════════════════
    // Fly to selected fort
    // ══════════════════════════════════════════════════════
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady || !selectedFort?.location?.coordinates) return;

        const [lng, lat] = selectedFort.location.coordinates;
        map.flyTo({
            center: [lng, lat],
            zoom: FORT_ZOOM,
            speed: FORT_FLY_SPEED,
            essential: true,
        });
    }, [selectedFort?.slug, mapReady]);

    // ══════════════════════════════════════════════════════
    // Layer visibility toggles
    // ══════════════════════════════════════════════════════
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady) return;

        if (hasLayer(map, LAYERS.trailLines)) {
            map.setLayoutProperty(LAYERS.trailLines, "visibility", showTrails ? "visible" : "none");
        }
    }, [showTrails, mapReady]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapReady) return;

        if (hasLayer(map, LAYERS.cisternCircles)) {
            map.setLayoutProperty(LAYERS.cisternCircles, "visibility", showCisterns ? "visible" : "none");
        }
    }, [showCisterns, mapReady]);

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
            <div className={`relative rounded-2xl overflow-hidden border border-red-800 bg-slate-950 flex items-center justify-center ${className}`}
                style={{ minHeight: "500px" }}
            >
                <div className="text-center p-6">
                    <div className="text-red-400 text-lg font-bold mb-2">⚠️ MapTiler API Key Missing</div>
                    <p className="text-slate-400 text-sm">
                        Add <code className="bg-slate-800 px-2 py-0.5 rounded text-cyan-300">VITE_MAPTILER_API_KEY</code> to your <code className="bg-slate-800 px-2 py-0.5 rounded text-cyan-300">.env</code> file.
                    </p>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════
    // Render
    // ══════════════════════════════════════════════════════
    return (
        <div className={`relative rounded-2xl overflow-hidden border border-slate-700 ${className}`}>
            {/* MapLibre GL container */}
            <div
                ref={mapContainerRef}
                style={{ height: "100%", width: "100%", minHeight: "500px" }}
                className="bg-slate-950"
            />

            {/* Map Controls Overlay */}
            <MapControls
                mapStyle={mapStyle}
                onStyleChange={handleStyleChange}
                showTrails={showTrails}
                onToggleTrails={() => setShowTrails(!showTrails)}
                showCisterns={showCisterns}
                onToggleCisterns={() => setShowCisterns(!showCisterns)}
                terrainEnabled={terrainEnabled}
                onToggleTerrain={handleToggleTerrain}
                onResetView={handleResetView}
                onLocateMe={handleLocateMe}
                isLocating={isLocating}
            />

            {/* Fort Info Panel (shown when a fort is selected) */}
            {selectedFort && fortDetail && (
                <div className="absolute bottom-3 left-3 right-3 z-[10] bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 max-w-md">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                                🏰 {selectedFort.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {selectedFort.elevation}m ASL · {selectedFort.district} · {selectedFort.region}
                            </p>
                        </div>
                        <button
                            onClick={() => { clearSelection(); popupRef.current?.remove(); }}
                            className="text-slate-400 hover:text-white text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg transition cursor-pointer"
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
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2 px-3 rounded-xl transition"
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
                                        className="flex items-center justify-between text-[11px] bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2"
                                    >
                                        <div className="flex-1 min-w-0 mr-2">
                                            <div className="font-medium text-slate-200 truncate">{trail.name}</div>
                                            <div className="text-slate-500 text-[10px]">{trail.distanceKm} km · {trail.difficulty}</div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="font-bold text-[10px]" style={{ color }}>
                                                Risk {Math.round(effectiveRisk)}%
                                            </span>
                                            {effectiveStatus === "open" ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                            ) : effectiveStatus === "caution" ? (
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                            ) : (
                                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Cistern summary */}
                    {cisterns.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                            <Droplets className="w-3 h-3 text-blue-400" />
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
                <div className="absolute inset-0 z-[10] bg-slate-950/60 flex items-center justify-center">
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl px-5 py-3">
                        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-slate-300">Loading forts...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FortMap;
