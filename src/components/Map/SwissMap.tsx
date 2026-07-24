"use client";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import Map, { NavigationControl } from "react-map-gl/maplibre";

import {
  getGuideNotes,
  createGuideNote,
  updateGuideNote,
  deleteGuideNote,
} from "@/lib/guideNoteDatabase";

import { GuideFilters } from "@/types/GuideFilters";
import { OfficialLayerFilters } from "@/types/OfficialLayerFilters";
import { GPXRoute } from "@/types/GPXRoute";

import { guideSections } from "@/data/guideSections";

import GuideMarker from "./GuideMarker";
import GuideSectionLayer from "./GuideSectionLayer";
import AddGuideNoteButton from "./AddGuideNoteButton";


import GuideNotePanel from "../Info/GuideNotePanel";
import AddGuideNotePanel from "../Info/AddGuideNotePanel";

import OfficialLayers from "../Layers/OfficialLayers";

import GPXLayer from "../GPX/GPXLayer";
import {
  RouteKnowledgeItem,
} from "@/lib/gpxAnalysis";
import RoutePanel from "../GPX/RoutePanel";
import { GuideSection } from "@/types/GuideSection";



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

  officialLayers: OfficialLayerFilters;

  gpxRoute: GPXRoute | null;

  setGpxRoute: React.Dispatch<
    React.SetStateAction<GPXRoute | null>
  >;
};



export default function SwissMap({
  filters,
  officialLayers,
  gpxRoute,
  setGpxRoute,
}: Props) {

  const mapRef = useRef<any>(null);


  const [selectedNote, setSelectedNote] =
    useState<GuideNote | null>(null);

  const [hoveredSectionId, setHoveredSectionId] =
    useState<number | null>(null);

  const [editingNote, setEditingNote] =
    useState<GuideNote | null>(null);



  const [guideNotesState, setGuideNotesState] =
    useState<GuideNote[]>([]);



  const [addingNote, setAddingNote] =
    useState(false);



  const [newLocation, setNewLocation] =
    useState<{
      latitude:number;
      longitude:number;
    } | null>(null);

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
        left: 420,
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

useEffect(() => {

  async function loadNotes(){

    const notes =
      await getGuideNotes();

    setGuideNotesState(notes);

  }

  loadNotes();

}, []);

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

const handleSectionClick = (
  section: GuideSection
) => {

  const coordinates = section.coordinates;


  const fakeNote: GuideNote = {

    id: section.id,

    category: "hazard",

    title: section.title,

    description: section.description,

    longitude: coordinates[0][0],

    latitude: coordinates[0][1],

    createdAt: section.updated,

    updatedAt: section.updated,

  };


  setSelectedNote(fakeNote);



  if (!mapRef.current)
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
        top: 120,
        bottom: 120,
        left: 450,
        right: 120,
      },

      duration: 1200,

    }

  );

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



      </Map>



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
            clearRoute={() => {
              setGpxRoute(null);
              setSelectedNote(null);
            }}
          onSelectNote={handleRouteNoteSelect}
          onFocusNote={handleRouteNoteFocus}
          onOverview={handleRouteOverview}
        />

        </div>

      }




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

    setGuideNotesState(
      guideNotesState.filter(
        note =>
          note.id !== id
      )
    );

    setSelectedNote(null);

  }


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
    category
  )=>{


            /*
              EDIT
            */


            if(editingNote){

  const updatedNote =
    await updateGuideNote(
      editingNote.id,
      {
        title,
        description,
        category,
      }
    );


  if(updatedNote){

    setGuideNotesState(
      guideNotesState.map(note =>
        note.id === updatedNote.id
          ? updatedNote
          : note
      )
    );

  }


  setEditingNote(null);


  return;



            }





            /*
              ADD
            */


            if(!newLocation)
              return;



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

});


if(newNote){

  setGuideNotesState([
    ...guideNotesState,
    newNote,
  ]);

}


setNewLocation(null);


          }
        }


      />





      <AddGuideNoteButton


        active={addingNote}


        onClick={()=>{


          setAddingNote(
            !addingNote
          );


          setSelectedNote(null);


        }}


      />


    </>

  );

}