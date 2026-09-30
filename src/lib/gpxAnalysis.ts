import { GPXRoute } from "@/Types/GPXRoute";
import { GuideNote } from "@/Types/GuideNote";


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

export type RouteSectionMatch = {
  section: import("@/Types/GuideSection").GuideSection;
  distanceAlongRoute: number;
  closestDistance: number;
};

function projectToLocalMeters(
  longitude: number,
  latitude: number,
  referenceLatitude: number
): [number, number] {
  const metresPerDegreeLat = 111320;
  const metresPerDegreeLon =
    111320 * Math.cos((referenceLatitude * Math.PI) / 180);

  return [
    longitude * metresPerDegreeLon,
    latitude * metresPerDegreeLat,
  ];
}

function pointToSegmentDistance(
  point: [number, number],
  start: [number, number],
  end: [number, number]
): number {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];

  if (dx === 0 && dy === 0) {
    return Math.hypot(point[0] - start[0], point[1] - start[1]);
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point[0] - start[0]) * dx +
        (point[1] - start[1]) * dy) /
        (dx * dx + dy * dy)
    )
  );

  const closestX = start[0] + t * dx;
  const closestY = start[1] + t * dy;

  return Math.hypot(
    point[0] - closestX,
    point[1] - closestY
  );
}

function segmentDistance(
  aStart: [number, number],
  aEnd: [number, number],
  bStart: [number, number],
  bEnd: [number, number]
): number {
  const denominator =
    (aEnd[0] - aStart[0]) * (bEnd[1] - bStart[1]) -
    (aEnd[1] - aStart[1]) * (bEnd[0] - bStart[0]);

  if (denominator !== 0) {
    const numeratorA =
      (bStart[0] - aStart[0]) * (bEnd[1] - bStart[1]) -
      (bStart[1] - aStart[1]) * (bEnd[0] - bStart[0]);

    const numeratorB =
      (bStart[0] - aStart[0]) * (aEnd[1] - aStart[1]) -
      (bStart[1] - aStart[1]) * (aEnd[0] - aStart[0]);

    const t = numeratorA / denominator;
    const u = numeratorB / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return 0;
    }
  }

  return Math.min(
    pointToSegmentDistance(aStart, bStart, bEnd),
    pointToSegmentDistance(aEnd, bStart, bEnd),
    pointToSegmentDistance(bStart, aStart, aEnd),
    pointToSegmentDistance(bEnd, aStart, aEnd)
  );
}

export function findRouteSectionsNearRoute(
  route: GPXRoute,
  sections: import("@/Types/GuideSection").GuideSection[],
  radius = 10
): RouteSectionMatch[] {
  const routeCoordinates = getRouteCoordinates(route);

  if (routeCoordinates.length < 2) {
    return [];
  }

  const sectionCoordinates = sections.map(section => ({
    section,
    coordinates: section.coordinates,
  }));

  const referenceLatitude =
    routeCoordinates.reduce(
      (sum, coordinate) => sum + coordinate[1],
      0
    ) / routeCoordinates.length;

  const projectedRoute = routeCoordinates.map(coordinate =>
    projectToLocalMeters(
      coordinate[0],
      coordinate[1],
      referenceLatitude
    )
  );

  const cumulativeDistances: number[] = [0];

  for (let i = 1; i < projectedRoute.length; i++) {
    cumulativeDistances.push(
      cumulativeDistances[i - 1] +
        Math.hypot(
          projectedRoute[i][0] - projectedRoute[i - 1][0],
          projectedRoute[i][1] - projectedRoute[i - 1][1]
        )
    );
  }

  const results: RouteSectionMatch[] = [];

  sectionCoordinates.forEach(({ section, coordinates }) => {
    if (coordinates.length < 2) {
      return;
    }

    const projectedSection = coordinates.map(coordinate =>
      projectToLocalMeters(
        coordinate[0],
        coordinate[1],
        referenceLatitude
      )
    );

    let closestDistance = Infinity;
    let closestRouteSegment = 0;

    for (let routeIndex = 0; routeIndex < projectedRoute.length - 1; routeIndex++) {
      const routeStart = projectedRoute[routeIndex];
      const routeEnd = projectedRoute[routeIndex + 1];

      for (
        let sectionIndex = 0;
        sectionIndex < projectedSection.length - 1;
        sectionIndex++
      ) {
        const distance = segmentDistance(
          routeStart,
          routeEnd,
          projectedSection[sectionIndex],
          projectedSection[sectionIndex + 1]
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestRouteSegment = routeIndex;
        }

        if (distance <= radius) {
          results.push({
            section,
            distanceAlongRoute: cumulativeDistances[routeIndex],
            closestDistance: distance,
          });

          return;
        }
      }
    }

    if (closestDistance <= radius) {
      results.push({
        section,
        distanceAlongRoute:
          cumulativeDistances[closestRouteSegment],
        closestDistance,
      });
    }
  });

  return results.sort(
    (a, b) =>
      a.distanceAlongRoute -
      b.distanceAlongRoute
  );
}
