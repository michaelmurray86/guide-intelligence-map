"use client";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import Map, { NavigationControl } from "react-map-gl/maplibre";

import { GuideNote } from "@/types/GuideNote";
import { GuideFilters } from "@/types/GuideFilters";
import { OfficialLayerFilters } from "@/types/OfficialLayerFilters";
import { GPXRoute } from "@/types/GPXRoute";

import { guideNotes } from "@/data/guideNotes";
import { guideSections } from "@/data/guideSections";

import {
  loadGuideNotes,
  saveGuideNotes,
} from "@/lib/guideNoteStorage";

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



  const [editingNote, setEditingNote] =
    useState<GuideNote | null>(null);



  const [guideNotesState, setGuideNotesState] =
    useState(() =>
      loadGuideNotes(guideNotes)
    );



  const [addingNote, setAddingNote] =
    useState(false);



  const [newLocation, setNewLocation] =
    useState<{
      latitude:number;
      longitude:number;
    } | null>(null);



  /*
    GPX route analysis
  */

    const handleRouteNoteFocus = (
  item: RouteKnowledgeItem
) => {

  const note = item.note;


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



  return (

    <>


      <Map

        ref={mapRef}
        initialViewState={{
          longitude:7.092,
          latitude:46.248,
          zoom:12,
        }}


        mapStyle={mapStyle as any}


        style={{
          width:"100%",
          height:"100%",
          position:"relative",
        }}


        onClick={(event)=>{


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


        onDelete={(id)=>{


          const updatedNotes =
            guideNotesState.filter(
              note =>
                note.id !== id
            );


          setGuideNotesState(
            updatedNotes
          );


          saveGuideNotes(
            updatedNotes
          );


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
          (
            title,
            description,
            category
          )=>{


            /*
              EDIT
            */


            if(editingNote){


              const updatedNotes =
                guideNotesState.map(note =>


                  note.id === editingNote.id

                  ?

                  {

                    ...note,

                    title,

                    description,

                    category,

                    updatedAt:
                      new Date()
                      .toISOString(),

                  }


                  :

                  note

                );



              setGuideNotesState(
                updatedNotes
              );


              saveGuideNotes(
                updatedNotes
              );


              setEditingNote(null);


              return;

            }





            /*
              ADD
            */


            if(!newLocation)
              return;



            const updatedNotes = [

              ...guideNotesState,


              {

                id:Date.now(),

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

              }

            ];



            setGuideNotesState(
              updatedNotes
            );


            saveGuideNotes(
              updatedNotes
            );


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