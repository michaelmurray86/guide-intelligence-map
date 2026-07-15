import Header from "./Header";
import Sidebar from "../sidebar/Sidebar";
import SwissMap from "../map/SwissMap";

export default function AppLayout() {
  return (
    <div className="h-screen flex flex-col">

      <Header />

      <div className="flex flex-1">

        <Sidebar />

        <main className="flex-1">
          <SwissMap />
        </main>

      </div>

    </div>
  );
}