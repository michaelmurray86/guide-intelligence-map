import { GPXRoute } from "@/types/GPXRoute";
import { GuideNote } from "@/types/GuideNote";


function distanceBetween(
  lat1:number,
  lon1:number,
  lat2:number,
  lon2:number
){

  const R = 6371000;

  const dLat =
    (lat2-lat1) *
    Math.PI / 180;

  const dLon =
    (lon2-lon1) *
    Math.PI / 180;


  const a =
    Math.sin(dLat/2) *
    Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2) *
    Math.sin(dLon/2);


  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1-a)
    )
  );

}



function getRouteCoordinates(
  route:GPXRoute
){

  const coordinates:number[][] = [];


  route.geojson.features.forEach(feature=>{


    if(
      feature.geometry.type === "LineString"
    ){

      coordinates.push(
        ...feature.geometry.coordinates
      );

    }


    if(
      feature.geometry.type === "MultiLineString"
    ){

      feature.geometry.coordinates.forEach(
        line=>{
          coordinates.push(...line);
        }
      );

    }


  });


  return coordinates;

}



export type RouteKnowledgeItem = {

  note: GuideNote;

  distanceAlongRoute:number;

};



export function findNotesNearRoute(

  route:GPXRoute,

  notes:GuideNote[],

  radius=250

):RouteKnowledgeItem[]{


  const coordinates =
    getRouteCoordinates(route);



  const cumulativeDistances:number[] =
    [0];



  for(
    let i=1;
    i<coordinates.length;
    i++
  ){

    const previous =
      coordinates[i-1];


    const current =
      coordinates[i];


    cumulativeDistances.push(

      cumulativeDistances[i-1] +

      distanceBetween(

        previous[1],
        previous[0],

        current[1],
        current[0]

      )

    );

  }





  const results:RouteKnowledgeItem[]=[];



  notes.forEach(note=>{


    let closestDistance =
      Infinity;


    let routeDistance =
      0;



    coordinates.forEach(
      coordinate=>{


        const distance =
          distanceBetween(

            coordinate[1],
            coordinate[0],

            note.latitude,
            note.longitude

          );



        if(distance < closestDistance){

          closestDistance = distance;


          const index =
            coordinates.indexOf(
              coordinate
            );


          routeDistance =
            cumulativeDistances[index];

        }


      }
    );



    if(
      closestDistance <= radius
    ){

      results.push({

        note,

        distanceAlongRoute:
          routeDistance

      });

    }


  });



  return results.sort(

    (a,b)=>

      a.distanceAlongRoute -
      b.distanceAlongRoute

  );


}