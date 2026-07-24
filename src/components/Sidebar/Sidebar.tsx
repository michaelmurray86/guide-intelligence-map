"use client";

import {useRouter} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";
import {useProfile} from "@/hooks/useProfile";

import Image from "next/image";

import { GuideFilters } from "@/types/GuideFilters";
import { OfficialLayerFilters } from "@/types/OfficialLayerFilters";
import { GPXRoute } from "@/types/GPXRoute";

import GPXImportButton from "../GPX/GPXImportButton";
import CollapsibleSection from "../UI/CollapsibleSection";
import ToggleSwitch from "../UI/ToggleSwitch";

import DataSources from "../UI/DataSources";


type Props = {
  filters: GuideFilters;

  setFilters: React.Dispatch<
    React.SetStateAction<GuideFilters>
  >;

  officialLayers: OfficialLayerFilters;

  setOfficialLayers: React.Dispatch<
    React.SetStateAction<OfficialLayerFilters>
  >;

  gpxRoute: GPXRoute | null;

  setGpxRoute: React.Dispatch<
    React.SetStateAction<GPXRoute | null>
  >;
};



export default function Sidebar({
  filters,
  setFilters,
  officialLayers,
  setOfficialLayers,
  gpxRoute,
  setGpxRoute,
}: Props) {

  const router = useRouter();

  const {
  user,
  logout
} = useAuth();

const {
  profile
} = useProfile();

  const toggle = (
    key: keyof GuideFilters
  ) => {

    setFilters({

      ...filters,

      [key]: !filters[key],

    });

  };



  const toggleOfficial = (
    key: keyof OfficialLayerFilters
  ) => {

    setOfficialLayers({

      ...officialLayers,

      [key]: !officialLayers[key],

    });

  };



  return (

    <aside
      className="
        w-80
        bg-slate-50
        border-r
        border-slate-300
        p-5
        overflow-y-auto
        flex
        flex-col
        h-full
      "
    >


      {/* Header */}

      <div className="mb-8 flex flex-col items-center">


        <Image

          src="/nae-logo-cropped.png"

          alt="Nord Anglia Education"

          width={319}

          height={70}

          className="mb-3"

          loading="eager"

        />


        <h1 className="
          text-center
          text-xl
          font-bold
          leading-tight
          text-slate-900
        ">

          Switzerland
          <br />
          Mountain Knowledge Hub

        </h1>


      </div>




      {/* NAE Knowledge Layers */}

      <CollapsibleSection
        title="🧭 NAE Knowledge Layers"
      >

        <div className="space-y-4">


          <ToggleSwitch
            checked={filters.water}
            onChange={() => toggle("water")}
            label="💧 Water"
          />


          <ToggleSwitch
            checked={filters.hazard}
            onChange={() => toggle("hazard")}
            label="⚠️ Hazards"
          />


          <ToggleSwitch
            checked={filters.hut}
            onChange={() => toggle("hut")}
            label="🛖 Huts"
          />


          <ToggleSwitch
            checked={filters.cafe}
            onChange={() => toggle("cafe")}
            label="☕ Cafés"
          />


          <ToggleSwitch
            checked={filters.toilet}
            onChange={() => toggle("toilet")}
            label="🚻 Toilets"
          />


          <ToggleSwitch
            checked={filters.snow}
            onChange={() => toggle("snow")}
            label="❄️ Snow"
          />


          <ToggleSwitch
            checked={filters.information}
            onChange={() => toggle("information")}
            label="ℹ️ Information"
          />


          <ToggleSwitch
            checked={filters.sections}
            onChange={() => toggle("sections")}
            label="🟧 Knowledge Sections"
          />


        </div>


      </CollapsibleSection>





      {/* SwissTopo Layers */}

      <CollapsibleSection
        title="🗺 SwissTopo Layers"
      >

        <div className="space-y-4">


          <ToggleSwitch
            checked={officialLayers.hikingTrails}
            onChange={() =>
              toggleOfficial("hikingTrails")
            }
            label="🥾 Hiking Trails"
          />


          <ToggleSwitch
            checked={officialLayers.closures}
            onChange={() =>
              toggleOfficial("closures")
            }
            label="🚧 Closures & Diversions"
          />


          <ToggleSwitch
            checked={officialLayers.guardianDogs}
            onChange={() =>
              toggleOfficial("guardianDogs")
            }
            label="🐕 Guardian Dogs"
          />


          <ToggleSwitch
            checked={officialLayers.shootingRanges}
            onChange={() =>
              toggleOfficial("shootingRanges")
            }
            label="🎯 Shooting Bulletins"
          />


          <ToggleSwitch
            checked={officialLayers.transportStops}
            onChange={() =>
              toggleOfficial("transportStops")
            }
            label="🚉 Transport Stops"
          />


        </div>


      </CollapsibleSection>





      {/* Routes */}

      <CollapsibleSection
        title="🥾 Routes"
      >

        <GPXImportButton
          gpxRoute={gpxRoute}
          setGpxRoute={setGpxRoute}
        />


      </CollapsibleSection>





      {/* Bottom account area */}


      <div className="
        mt-auto
        border-t
        border-slate-300
        pt-4
        space-y-3
      ">

<div className="
  text-center
  text-sm
  text-slate-700
">

  <div className="font-medium">
    {profile?.name}
  </div>

  <div className="text-xs text-slate-500 capitalize">
    {profile?.role}
  </div>

</div>

        <button

          onClick={async () => {

  await logout();

  router.push("/login");

}}

          className="
            w-full
            bg-white
            text-slate-800
            border
            border-slate-300
            rounded
            px-3
            py-2
            font-medium
            hover:bg-slate-100
          "

        >

          Logout

        </button>



<DataSources />


<div className="
  text-center
  text-xs
  text-slate-500
">

  Version 0.8

</div>


      </div>


    </aside>

  );

}