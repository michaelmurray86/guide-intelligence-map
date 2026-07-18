export const officialSwissTopoLayers = {
  hikingTrails: {
    provider: "SwissTopo",
    service: "WMTS",
    tiles: [
      "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swisstlm3d-wanderwege/default/current/3857/{z}/{x}/{y}.png",
    ],
  },

  closures: {
    provider: "FEDRO",
    service: "WMS",
    tiles: [
      "https://wms.geo.admin.ch/?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=ch.astra.wanderland-sperrungen_umleitungen&STYLES=&FORMAT=image/png&TRANSPARENT=true&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256",
    ],
  },

  guardianDogs: {
    provider: "BAFU",
    service: "WMS",
    tiles: [
      "https://wms.geo.admin.ch/?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=ch.bafu.alpweiden-herdenschutzhunde&STYLES=&FORMAT=image/png&TRANSPARENT=true&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256",
    ],
  },

  shootingRanges: {
    provider: "VBS",
    service: "WMS",
    tiles: [
      "https://wms.geo.admin.ch/?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=ch.vbs.schiessanzeigen&STYLES=&FORMAT=image/png&TRANSPARENT=true&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256",
    ],
  },
};