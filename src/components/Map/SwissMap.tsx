"use client";

import {
  useProfile
} from "@/context/ProfileContext";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import Map, { NavigationControl } from "react-map-gl/maplibre";

import {
  createGuideNote,
  updateGuideNote,
  deleteGuideNote,
} from "@/lib/guideNoteDatabase";

import {
  deleteGuideNotePhotos,
  uploadGuideNotePhotos,
} from "@/lib/guideNoteStorage";

import { GuideFilters } from "@/Types/GuideFilters";
import { OfficialLayerFilters } from "@/Types/OfficialLayerFilters";
import { GPXRoute } from "@/Types/GPXRoute";
import { RouteLibrary, routeLibraryToGPXRoute } from "@/Types/RouteLibrary";
import { parseGPX } from "@/lib/parseGPX";

import GuideMarker from "./GuideMarker";
import { markerIcons } from "./markerIcons";
import GuideSectionLayer from "./GuideSectionLayer";
import AddGuideNoteButton from "./AddGuideNoteButton";
import ToggleSwitch from "../UI/ToggleSwitch";
import CurrentLocationMarker from "./CurrentLocationMarker";


import GuideNotePanel from "../Info/GuideNotePanel";
import RouteSectionPanel from "../Info/RouteSectionPanel";
import RouteSectionEditor from "../Info/RouteSectionEditor";
import { deleteGuideSection } from "@/lib/guideSectionDatabase";
import AddGuideNotePanel from "../Info/AddGuideNotePanel";

import OfficialLayers from "../Layers/OfficialLayers";

import GPXLayer from "../GPX/GPXLayer";
import {
  findNotesNearRoute,
  findRouteSectionsNearRoute,
  RouteKnowledgeItem,
} from "@/lib/gpxAnalysis";
import RoutePanel from "../GPX/RoutePanel";
import { GuideSection } from "@/Types/GuideSection";

import { GuideNote } from "@/Types/GuideNote";

import { useGuideNotes } from "@/hooks/useGuideNotes";

const mapStyle = {
  version: 8,

  sources: {
    swissTopo: {
      type: "raster",

      tiles: [
        "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg",
      ],

      tileSize: 256,

      attribution: "© swisstopo",
    },
  },

  layers: [
    {
      id: "swisstopo",

      type: "raster",

      source: "swissTopo",
    },
  ],
};



type Props = {
  filters: GuideFilters;
  setFilters: React.Dispatch<React.SetStateAction<GuideFilters>>;

  officialLayers: OfficialLayerFilters;
  setOfficialLayers: React.Dispatch<React.SetStateAction<OfficialLayerFilters>>;

  gpxRoute: GPXRoute | null;

  setGpxRoute: React.Dispatch<
    React.SetStateAction<GPXRoute | null>
  >;

  routeLibrary: RouteLibrary[];

  guideSections: GuideSection[];
  routeSectionDraft: GPXRoute | null;
  focusedRouteSectionId?: number | null;
  onRouteSectionUpdated?: (section: GuideSection | null) => void;
  onRouteSectionDeleted?: (id: number) => void;
};



export default function SwissMap({
  filters,
  setFilters,
  officialLayers,
  setOfficialLayers,
  gpxRoute,
  setGpxRoute,
  routeLibrary,
  guideSections,
  routeSectionDraft,
  focusedRouteSectionId,
  onRouteSectionUpdated,
  onRouteSectionDeleted,
}: Props) {

  const {
  profile
} = useProfile();
  
  const mapRef = useRef<any>(null);


  const [selectedNote, setSelectedNote] =
    useState<GuideNote | null>(null);

  const [hoveredSectionId, setHoveredSectionId] =
    useState<number | null>(null);

  const [editingNote, setEditingNote] =
    useState<GuideNote | null>(null);

  const [selectedSection, setSelectedSection] =
    useState<GuideSection | null>(null);

  const [editingSection, setEditingSection] =
    useState<GuideSection | null>(null);



  const {
    notes: guideNotesState,
    setNotes: setGuideNotesState,
  } = useGuideNotes();



  const [addingNote, setAddingNote] =
    useState(false);



  const [newLocation, setNewLocation] =
    useState<{
      latitude:number;
      longitude:number;
    } | null>(null);

  const [currentLocation, setCurrentLocation] =
    useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

  const [locationStatus, setLocationStatus] =
    useState<"idle" | "locating" | "available" | "error">("idle");

  const [mobileLayersOpen, setMobileLayersOpen] = useState(false);
  const [mobileNaeLayersOpen, setMobileNaeLayersOpen] = useState(false);
  const [mobileSwissTopoLayersOpen, setMobileSwissTopoLayersOpen] = useState(false);
  const [mobileRoutesOpen, setMobileRoutesOpen] = useState(false);
  const [mobileLocationChoiceOpen, setMobileLocationChoiceOpen] = useState(false);
  const [recenterMenuOpen, setRecenterMenuOpen] = useState(false);

  const locationWatchId = useRef<number | null>(null);
  const hasCenteredOnLocation = useRef(false);
  const mobileGpxInputRef = useRef<HTMLInputElement>(null);

  const captureRouteMap = async (): Promise<string | null> => {
    if (!gpxRoute || !mapRef.current) return null;

    const map = mapRef.current.getMap();
    const mapContainer = map.getContainer();

    const originalStyles = {
      position: mapContainer.style.position,
      left: mapContainer.style.left,
      top: mapContainer.style.top,
      width: mapContainer.style.width,
      height: mapContainer.style.height,
      visibility: mapContainer.style.visibility,
    };

    const coordinates = gpxRoute.geojson.features.flatMap(feature => {
      if (feature.geometry.type === "LineString") return feature.geometry.coordinates;
      if (feature.geometry.type === "MultiLineString") return feature.geometry.coordinates.flat();
      return [];
    });

    if (coordinates.length === 0) return null;

    let minLng = coordinates[0][0];
    let maxLng = coordinates[0][0];
    let minLat = coordinates[0][1];
    let maxLat = coordinates[0][1];

    coordinates.forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });

    try {
      // Use a fixed landscape canvas for printing so mobile produces the
      // same landscape-style route overview as desktop.
      mapContainer.style.position = "fixed";
      mapContainer.style.left = "-2000px";
      mapContainer.style.top = "0";
      mapContainer.style.width = "1200px";
      mapContainer.style.height = "675px";
      mapContainer.style.visibility = "hidden";

      map.resize();

      map.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
        padding: { top: 40, bottom: 40, left: 40, right: 40 },
        maxZoom: 13,
        duration: 0,
      });

      await new Promise<void>(resolve => {
        if (map.loaded()) {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        } else {
          map.once("idle", () => resolve());
        }
      });

      const sourceCanvas = map.getCanvas();
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = sourceCanvas.width;
      exportCanvas.height = sourceCanvas.height;

      const context = exportCanvas.getContext("2d");
      if (!context) return null;

      context.drawImage(sourceCanvas, 0, 0);

      const nearbyNotes = findNotesNearRoute(gpxRoute, guideNotesState);
      const nearbySections = findRouteSectionsNearRoute(gpxRoute, guideSections);
      const pixelRatio = window.devicePixelRatio || 1;

      nearbyNotes.forEach(({ note }) => {
        const point = map.project([note.longitude, note.latitude]);
        const x = point.x * pixelRatio;
        const y = point.y * pixelRatio;
        const radius = 13 * pixelRatio;

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = "#ffffff";
        context.fill();
        context.lineWidth = 3 * pixelRatio;
        context.strokeStyle = "#1e293b";
        context.stroke();

        context.font = (18 * pixelRatio) + "px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#111827";
        context.fillText(markerIcons[note.category], x, y + 1 * pixelRatio);
      });

      nearbySections.forEach(({ section }) => {
        if (section.coordinates.length < 2) return;

        context.beginPath();
        section.coordinates.forEach(([lng, lat], index) => {
          const point = map.project([lng, lat]);
          const x = point.x * pixelRatio;
          const y = point.y * pixelRatio;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });

        context.lineWidth = 5 * pixelRatio;
        context.strokeStyle = section.color || "#ea580c";
        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();
      });

      return exportCanvas.toDataURL("image/png");
    } catch (error) {
      console.error("Unable to capture map for route report:", error);
      return null;
    } finally {
      Object.entries(originalStyles).forEach(([property, value]) => {
        mapContainer.style[property as keyof CSSStyleDeclaration] = value;
      });

      map.resize();
    }
  };


  const handleRecenterLesMartinets = () => {
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: [7.091656, 46.256420],
      zoom: 12.5,
      duration: 800,
    });

    setRecenterMenuOpen(false);
  };

  const handleRecenterCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [currentLocation.longitude, currentLocation.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 14),
        duration: 800,
      });
      setRecenterMenuOpen(false);
      return;
    }

    handleLocateMe();
    setRecenterMenuOpen(false);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("locating");
    hasCenteredOnLocation.current = false;

    if (locationWatchId.current !== null) {
      navigator.geolocation.clearWatch(locationWatchId.current);
    }

    locationWatchId.current = navigator.geolocation.watchPosition(
      position => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCurrentLocation(location);
        setLocationStatus("available");

        if (mapRef.current && !hasCenteredOnLocation.current) {
          mapRef.current.flyTo({
            center: [location.longitude, location.latitude],
            zoom: Math.max(mapRef.current.getZoom(), 14),
            duration: 800,
          });
          hasCenteredOnLocation.current = true;
        }
      },
      () => {
        setLocationStatus("error");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    );
  };

  useEffect(() => {
    return () => {
      if (locationWatchId.current !== null) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
    };
  }, []);


  const handleAddKnowledge = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches
    ) {
      setMobileLocationChoiceOpen(true);
      return;
    }

    setAddingNote(current => !current);
    setSelectedNote(null);
  };

  const handleUseCurrentLocation = () => {
    if (!currentLocation) return;

    setNewLocation(currentLocation);
    setMobileLocationChoiceOpen(false);
    setSelectedNote(null);
  };

  const handlePickLocationOnMap = () => {
    setMobileLocationChoiceOpen(false);
    setAddingNote(true);
    setSelectedNote(null);
  };

  const handleMobileGpxImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const route = await parseGPX(file);
      setGpxRoute(route);
      setMobileLayersOpen(false);
    } catch (error) {
      console.error("Failed to import GPX:", error);
      window.alert("Unable to import GPX file.");
    }

    event.target.value = "";
  };

  const handleLoadMobileLibraryRoute = (routeId: string) => {
    const selected = routeLibrary.find(
      route => route.id.toString() === routeId
    );

    if (!selected) return;

    setGpxRoute(routeLibraryToGPXRoute(selected));
    setMobileLayersOpen(false);
  };

const handleRouteOverview = () => {

  setSelectedNote(null);

  if (!gpxRoute || !mapRef.current)
    return;


  const coordinates =
    gpxRoute.geojson.features.flatMap(
      feature => {

        if (
          feature.geometry.type === "LineString"
        ) {
          return feature.geometry.coordinates;
        }


        if (
          feature.geometry.type === "MultiLineString"
        ) {
          return feature.geometry.coordinates.flat();
        }


        return [];

      }
    );


  if (coordinates.length === 0)
    return;


  let minLng = coordinates[0][0];
  let maxLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLat = coordinates[0][1];


  coordinates.forEach(([lng, lat]) => {

    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);

    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);

  });


  mapRef.current.fitBounds(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    {
      padding: {
        top: 80,
        bottom: 80,
        left:
          typeof window !== "undefined" &&
          window.matchMedia("(max-width: 767px)").matches
            ? 40
            : 420,
        right: 80,
      },
      maxZoom: 14,
      duration: 1200,
    }
  );

};



useEffect(() => {

  handleRouteOverview();

}, [gpxRoute]);


  /*
    GPX route analysis
  */

const handleRouteNoteFocus = (
  item: RouteKnowledgeItem
) => {

  const note = item.note;


  // Update the open panel if it is already showing
  if (selectedNote) {
    setSelectedNote(note);
  }


  if (mapRef.current) {

    mapRef.current.flyTo({

      center: [
        note.longitude,
        note.latitude,
      ],

      zoom: 12.8,

      duration: 1200,

    });

  }

};



const handleRouteNoteSelect = (
  item: RouteKnowledgeItem
) => {

  const note = item.note;


  setSelectedNote(note);


  handleRouteNoteFocus(item);

};

  const handleMarkerClick = (
    note:GuideNote
  ) => {

    if(selectedNote?.id === note.id){

      setSelectedNote(null);

    } else {

      setSelectedNote(note);

    }

  };

const focusSection = (section: GuideSection) => {
  const coordinates = section.coordinates;
  if (!mapRef.current || coordinates.length === 0) return;

  let minLng = coordinates[0][0];
  let maxLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLat = coordinates[0][1];

  coordinates.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  const centerLongitude = (minLng + maxLng) / 2;
  const centerLatitude = (minLat + maxLat) / 2;

  mapRef.current.flyTo({
    center: [centerLongitude, centerLatitude],
    zoom: 12.8,
    duration: 1200,
  });
};

const handleSectionClick = (section: GuideSection) => {
  setSelectedNote(null);
  setSelectedSection(section);
  focusSection(section);
};

useEffect(() => {
  if (!focusedRouteSectionId) return;
  const section = guideSections.find(
    item => item.id === focusedRouteSectionId
  );
  if (section) {
    setSelectedNote(null);
    setSelectedSection(section);
    focusSection(section);
  }
}, [focusedRouteSectionId, guideSections]);

const canManageRouteSections =
  profile?.role === "admin" ||
  profile?.role === "superadmin";

const handleSectionDelete = async (section: GuideSection) => {
  if (!window.confirm(
    `Delete the Route Section "${section.title}"? This cannot be undone.`
  )) return;

  const success = await deleteGuideSection(section.id);
  if (!success) {
    window.alert("The Route Section could not be deleted.");
    return;
  }

  setSelectedSection(null);
  onRouteSectionDeleted?.(section.id);
};

  return (

    <>


      <Map

        ref={mapRef}

        interactiveLayerIds={
          guideSections.map(
            section => `hit-${section.id}`
          )
        }

        initialViewState={{
          longitude:7.091656,
          latitude:46.256420,
          zoom:12.5,
        }}


        mapStyle={mapStyle as any}

        style={{
          width:"100%",
          height:"100%",
          position:"relative",
        }}

        onMouseMove={(event) => {

  if(event.features?.length){

    const layerId = event.features[0].layer.id;

    if(layerId.startsWith("hit-")){

      const sectionId =
        Number(
          layerId.replace("hit-", "")
        );

      setHoveredSectionId(sectionId);

      return;

    }

  }

  setHoveredSectionId(null);

}}

        onClick={(event)=>{


  // Clicked a guide section
  if(event.features?.length){

    const sectionId =
      Number(
        event.features[0].layer.id
          .replace("hit-", "")
      );


    const section =
      guideSections.find(
        section =>
          section.id === sectionId
      );


    if(section){

      handleSectionClick(section);

      return;

    }

  }



  // Normal add note behaviour

  if(!addingNote)
    return;


  setNewLocation({

    latitude:event.lngLat.lat,

    longitude:event.lngLat.lng,

  });


  setAddingNote(false);


}}

      >



        <NavigationControl
          position="top-right"
        />

        {currentLocation && (
          <CurrentLocationMarker
            latitude={currentLocation.latitude}
            longitude={currentLocation.longitude}
          />
        )}



        {
          filters.sections &&

          guideSections.map(section => (

            <GuideSectionLayer

              key={section.id}

              section={section}

                hovered={
    hoveredSectionId === section.id
                }

            />

          ))

        }



        {
          guideNotesState

          .filter(note =>
            filters[note.category]
          )

          .map(note => (

            <GuideMarker

              key={note.id}

              note={note}

              onClick={handleMarkerClick}

            />

          ))

        }



        <OfficialLayers

          layers={officialLayers}

        />



        {
          gpxRoute &&

          <GPXLayer

            route={gpxRoute}

          />

        }


        {routeSectionDraft && (
          <GPXLayer
            route={routeSectionDraft}
            idPrefix="route-section-preview"
            color={routeSectionDraft.previewColor ?? "#ea580c"}
            showArrows={false}
          />
        )}



      </Map>





      <div className="absolute right-2 top-28 z-20">
        <button
          type="button"
          onClick={() => setRecenterMenuOpen(current => !current)}
          disabled={locationStatus === "locating"}
          aria-label="Recenter map"
          title="Recenter map"
          className="flex h-11 w-11 items-center justify-center rounded border border-slate-300 bg-white text-xl text-slate-900 shadow-md transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
        >
          {locationStatus === "locating" ? "…" : "⌖"}
        </button>

        {recenterMenuOpen && (
          <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl">
            <button
              type="button"
              onClick={handleRecenterCurrentLocation}
              className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              📍 {currentLocation ? "Centre on my location" : "Use my current location"}
            </button>
            <button
              type="button"
              onClick={handleRecenterLesMartinets}
              className="block w-full border-t border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              🏔 Centre on Les Martinets
            </button>
          </div>
        )}
      </div>

      {locationStatus === "error" && (
        <div className="absolute right-2 top-40 z-20 max-w-56 rounded bg-white px-3 py-2 text-xs text-slate-700 shadow-md">
          Location could not be accessed. Please check your browser location permission.
        </div>
      )}


      {
        gpxRoute &&

        <div

          className="
          absolute
          right-6
          top-6
          w-80
          z-10
          "

        >

        <RoutePanel
          route={gpxRoute}
          notes={guideNotesState}
          guideSections={guideSections}
          clearRoute={() => {
            setGpxRoute(null);
            setSelectedNote(null);
          }}
          onSelectNote={handleRouteNoteSelect}
          onFocusNote={handleRouteNoteFocus}
          onFocusSection={focusSection}
          onSelectSection={handleSectionClick}
          onOverview={handleRouteOverview}
          onPrintMapSnapshot={captureRouteMap}
        />

        </div>

      }




      <RouteSectionPanel
        section={selectedSection}
        canManage={canManageRouteSections}
        onClose={() => setSelectedSection(null)}
        onEdit={(section) => {
          setEditingSection(section);
          setSelectedSection(null);
        }}
        onDelete={handleSectionDelete}
      />

      {editingSection && (
        <div className="fixed right-15 top-6 z-40 w-96">
          <RouteSectionEditor
            existingSection={editingSection}
            onCancel={() => setEditingSection(null)}
            onPreview={() => {}}
            onUpdated={(section) => {
              onRouteSectionUpdated?.(section);
              setEditingSection(null);
            }}
            createdBy={profile?.name}
          />
        </div>
      )}

      <GuideNotePanel

        note={selectedNote}


        onClose={() =>
          setSelectedNote(null)
        }


        onEdit={(note)=>{

          setEditingNote(note);

          setSelectedNote(null);

        }}


        onDelete={async (id)=>{

  const success =
    await deleteGuideNote(id);

  if(success){

    alert(
      "Deletion request submitted. An approver or admin will review it."
    );

  }

  return success;

}}

      />





      <AddGuideNotePanel


        open={
          newLocation !== null ||
          editingNote !== null
        }



        editingNote={editingNote}



        onCancel={()=>{

          setEditingNote(null);

          setNewLocation(null);

        }}




        onSave={
  async (
    title,
    description,
    category,
    newPhotos,
    removedPhotos
  )=>{


            /*
              EDIT
            */


            if(editingNote){

              const currentPhotos =
                editingNote.photos ?? [];

              const remainingPhotos =
                currentPhotos.filter(
                  photo =>
                    !removedPhotos.includes(photo)
                );

              const uploadedPaths =
                await uploadGuideNotePhotos(
                  editingNote.id,
                  newPhotos
                );

              if(uploadedPaths === null){

                alert(
                  "One or more photos could not be uploaded. No changes were saved."
                );

                return;

              }

              const updatedPhotos = [
                ...remainingPhotos,
                ...uploadedPaths,
              ];

              const updatedNote =
                await updateGuideNote(
                  editingNote.id,
                  {
                    title,
                    description,
                    category,
                    photos: updatedPhotos,
                  },
                  profile?.name
                );

              if(!updatedNote){

                await deleteGuideNotePhotos(
                  uploadedPaths
                );

                alert(
                  "The guide note could not be updated. No photo changes were saved."
                );

                return;

              }

              const deleted =
                await deleteGuideNotePhotos(
                  removedPhotos
                );

              if(!deleted){

                console.warn(
                  "Some removed guide note photos could not be deleted from Storage."
                );

              }

              setGuideNotesState(
                guideNotesState.map(note =>
                  note.id === updatedNote.id
                    ? updatedNote
                    : note
                )
              );

              setSelectedNote(updatedNote);
              setEditingNote(null);

              return;

            }





            /*
              ADD
            */


            if(!newLocation)
              return;

            console.log("Profile when creating note:", profile);

            const newNote = await createGuideNote({

              title,

              description,

              category,

              latitude:
                newLocation.latitude,

              longitude:
                newLocation.longitude,

              createdAt:
                new Date()
                .toISOString(),

              updatedAt:
                new Date()
                .toISOString(),

              createdBy:
                profile?.name ?? "Unknown",

              updatedBy:
                profile?.name ?? "Unknown",

              photos: [],

              status:
                profile?.role === "admin"
                  ? "approved"
                  : "pending",

            });


            if(!newNote){

              alert(
                "The guide note could not be saved."
              );

              return;

            }

            const uploadedPaths =
              await uploadGuideNotePhotos(
                newNote.id,
                newPhotos
              );

            if(uploadedPaths === null){

              alert(
                "The guide note was saved, but its photos could not be uploaded."
              );

              setGuideNotesState([
                ...guideNotesState,
                newNote,
              ]);

              setNewLocation(null);

              return;

            }

            let savedNote = newNote;

            if(uploadedPaths.length > 0){

              const updatedNote =
                await updateGuideNote(
                  newNote.id,
                  {
                    photos: uploadedPaths,
                  },
                  profile?.name
                );

              if(!updatedNote){

                await deleteGuideNotePhotos(
                  uploadedPaths
                );

                alert(
                  "The guide note was saved, but its photos could not be attached."
                );

                setGuideNotesState([
                  ...guideNotesState,
                  newNote,
                ]);

                setNewLocation(null);

                return;

              }

              savedNote = updatedNote;

            }

            setGuideNotesState([
              ...guideNotesState,
              savedNote,
            ]);

            setNewLocation(null);

          }
        }


      />





      <button
        type="button"
        onClick={() => setMobileLayersOpen(current => !current)}
        aria-label="Open map layers"
        title="Map layers"
        className="absolute bottom-4 left-4 z-20 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-xl text-slate-900 shadow-lg transition hover:bg-slate-100 md:hidden"
      >
        ☰
      </button>

      <div
        className={`fixed bottom-0 left-4 right-4 z-40 max-h-[70vh] overflow-hidden rounded-t-2xl border border-b-0 border-slate-300 bg-white shadow-2xl transition-transform duration-300 md:hidden ${mobileLayersOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">Map Layers</h2>
          <button
            type="button"
            onClick={() => setMobileLayersOpen(false)}
            aria-label="Close map layers"
            className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 text-lg text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(70vh-65px)] overflow-y-auto p-5">
          <div>
            <button
              type="button"
              onClick={() => setMobileNaeLayersOpen(current => !current)}
              className="flex w-full items-center justify-between text-left"
              aria-expanded={mobileNaeLayersOpen}
            >
              <span className="text-sm font-bold text-slate-900">🧭 NAE Knowledge</span>
              <span className="text-lg font-semibold text-slate-700">{mobileNaeLayersOpen ? "−" : "+"}</span>
            </button>
            {mobileNaeLayersOpen && (
              <div className="mt-3 space-y-3">
              <ToggleSwitch checked={Object.values(filters).every(Boolean)} onChange={() => {
                const nextValue = !Object.values(filters).every(Boolean);
                setFilters(Object.fromEntries(Object.keys(filters).map(key => [key, nextValue])) as GuideFilters);
              }} label="All NAE Knowledge" />
              <ToggleSwitch checked={filters.sections} onChange={() => setFilters(current => ({ ...current, sections: !current.sections }))} label="🟧 Route Sections" />
              <ToggleSwitch checked={filters.water} onChange={() => setFilters(current => ({ ...current, water: !current.water }))} label="💧 Water" />
              <ToggleSwitch checked={filters.cattle} onChange={() => setFilters(current => ({ ...current, cattle: !current.cattle }))} label="🐄 Cattle" />
              <ToggleSwitch checked={filters.hazard} onChange={() => setFilters(current => ({ ...current, hazard: !current.hazard }))} label="⚠️ Hazards" />
              <ToggleSwitch checked={filters.hut} onChange={() => setFilters(current => ({ ...current, hut: !current.hut }))} label="🛖 Huts" />
              <ToggleSwitch checked={filters.cafe} onChange={() => setFilters(current => ({ ...current, cafe: !current.cafe }))} label="☕ Cafés" />
              <ToggleSwitch checked={filters.toilet} onChange={() => setFilters(current => ({ ...current, toilet: !current.toilet }))} label="🚻 Toilets" />
              <ToggleSwitch checked={filters.snow} onChange={() => setFilters(current => ({ ...current, snow: !current.snow }))} label="❄️ Snow" />
              <ToggleSwitch checked={filters.information} onChange={() => setFilters(current => ({ ...current, information: !current.information }))} label="ℹ️ Information" />
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => setMobileSwissTopoLayersOpen(current => !current)}
              className="flex w-full items-center justify-between text-left"
              aria-expanded={mobileSwissTopoLayersOpen}
            >
              <span className="text-sm font-bold text-slate-900">🗺 SwissTopo</span>
              <span className="text-lg font-semibold text-slate-700">{mobileSwissTopoLayersOpen ? "−" : "+"}</span>
            </button>
            {mobileSwissTopoLayersOpen && (
              <div className="mt-3 space-y-3">
                <ToggleSwitch checked={officialLayers.hikingTrails} onChange={() => setOfficialLayers(current => ({ ...current, hikingTrails: !current.hikingTrails }))} label="🥾 Hiking Trails" />
                <ToggleSwitch checked={officialLayers.closures} onChange={() => setOfficialLayers(current => ({ ...current, closures: !current.closures }))} label="🚧 Closures & Diversions" />
                <ToggleSwitch checked={officialLayers.guardianDogs} onChange={() => setOfficialLayers(current => ({ ...current, guardianDogs: !current.guardianDogs }))} label="🐕 Guardian Dogs" />
                <ToggleSwitch checked={officialLayers.shootingRanges} onChange={() => setOfficialLayers(current => ({ ...current, shootingRanges: !current.shootingRanges }))} label="🎯 Shooting Bulletins" />
                <ToggleSwitch checked={officialLayers.transportStops} onChange={() => setOfficialLayers(current => ({ ...current, transportStops: !current.transportStops }))} label="🚉 Transport Stops" />
                <ToggleSwitch checked={officialLayers.slopeAngle} onChange={() => setOfficialLayers(current => ({ ...current, slopeAngle: !current.slopeAngle }))} label="⛰️ Slope angle >30°" />
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => setMobileRoutesOpen(current => !current)}
              className="flex w-full items-center justify-between text-left"
              aria-expanded={mobileRoutesOpen}
            >
              <span className="text-sm font-bold text-slate-900">🥾 Routes</span>
              <span className="text-lg font-semibold text-slate-700">{mobileRoutesOpen ? "−" : "+"}</span>
            </button>
            {mobileRoutesOpen && (
              <div className="mt-3 space-y-3">
              <input
                ref={mobileGpxInputRef}
                type="file"
                accept=".gpx,application/gpx+xml,application/xml,text/xml"
                onChange={handleMobileGpxImport}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => mobileGpxInputRef.current?.click()}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-semibold text-white hover:bg-blue-700"
              >
                📂 Import GPX
              </button>

              {routeLibrary.length > 0 && (
                <select
                  value={gpxRoute ? routeLibrary.find(route => route.name === gpxRoute.name)?.id.toString() ?? "" : ""}
                  onChange={event => handleLoadMobileLibraryRoute(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700"
                >
                  <option value="">Load from Route Library...</option>
                  {routeLibrary.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              )}

              {gpxRoute && (
                <button
                  type="button"
                  onClick={() => {
                    setGpxRoute(null);
                    setSelectedNote(null);
                  }}
                  className="w-full rounded-lg border border-red-200 px-4 py-3 text-left font-semibold text-red-700 hover:bg-red-50"
                >
                  ❌ Remove loaded route
                </button>
              )}
              </div>
            )}
          </div>


        </div>
      </div>

      {mobileLocationChoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 md:hidden">
          <div className="w-full rounded-t-2xl bg-white p-5 shadow-2xl">
            <div className="mb-1 text-lg font-bold text-slate-900">Add Knowledge</div>
            <p className="mb-4 text-sm text-slate-600">
              Choose where to place the new knowledge point.
            </p>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={!currentLocation}
              className="mb-3 w-full rounded-lg bg-blue-600 px-4 py-3 text-left font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              📍 Use my current location
            </button>

            {!currentLocation && (
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={locationStatus === "locating"}
                className="mb-3 w-full rounded-lg border border-slate-300 px-4 py-3 text-left font-semibold text-slate-800"
              >
                {locationStatus === "locating" ? "Getting your location..." : "Get my current location"}
              </button>
            )}

            <button
              type="button"
              onClick={handlePickLocationOnMap}
              className="mb-3 w-full rounded-lg border border-slate-300 px-4 py-3 text-left font-semibold text-slate-800"
            >
              🗺️ Pick a location on the map
            </button>

            <button
              type="button"
              onClick={() => setMobileLocationChoiceOpen(false)}
              className="w-full rounded-lg bg-slate-100 px-4 py-3 font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <AddGuideNoteButton
        active={addingNote}
        onClick={handleAddKnowledge}
      />


    </>

  );

}
