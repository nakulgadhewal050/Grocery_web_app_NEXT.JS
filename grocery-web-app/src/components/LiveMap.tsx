import React from "react";
import dynamic from "next/dynamic";

interface ILocation {
  latitude: number;
  longitude: number;
}
interface IProps {
  userLocation: ILocation;
  deliveryBoyLocation: ILocation;
}

const LiveMapInner = dynamic(() => import("./LiveMapInner"), { ssr: false });

function LiveMap({ userLocation, deliveryBoyLocation }: IProps) {
  if (!userLocation) {
    return <div>Loading user location...</div>;
  }
  return <LiveMapInner userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />;
}

export default LiveMap;
