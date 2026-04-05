import React from "react";
import L, { LatLngExpression } from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface ILocation {
  latitude: number;
  longitude: number;
}
interface IProps {
  userLocation: ILocation;
  deliveryBoyLocation: ILocation;
}

function LiveMapInner({ userLocation, deliveryBoyLocation }: IProps) {
  const deliveryBoyIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/9561/9561688.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/4821/4821951.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const center: LatLngExpression = [
    userLocation.latitude,
    userLocation.longitude,
  ];

  const linePositions: LatLngExpression[] =
    deliveryBoyLocation && userLocation
      ? [
          [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude],
          [userLocation.latitude, userLocation.longitude],
        ]
      : [];

  return (
    <div className="w-full h-125 rounded-xl overflow-hidden shadow relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>Delivery address</Popup>
          </Marker>
        )}
        {deliveryBoyLocation && (
          <Marker
            position={[
              deliveryBoyLocation.latitude,
              deliveryBoyLocation.longitude,
            ]}
            icon={deliveryBoyIcon}
          >
            <Popup>Delivery Boy</Popup>
          </Marker>
        )}
        <Polyline positions={linePositions} color="green"></Polyline>
      </MapContainer>
    </div>
  );
}

export default LiveMapInner;
