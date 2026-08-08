"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet's default marker icons reference image files by relative path,
// which breaks under bundlers — self-hosted under public/leaflet/ (copied
// from node_modules/leaflet/dist/images/) rather than pointed at a CDN.
const deliveryIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function DeliveryMap({
  lat,
  lng,
  shopName,
}: {
  lat: number;
  lng: number;
  shopName: string;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "180px", width: "100%", borderRadius: "16px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={deliveryIcon}>
        <Popup>{shopName}&apos;s delivery is here</Popup>
      </Marker>
    </MapContainer>
  );
}
