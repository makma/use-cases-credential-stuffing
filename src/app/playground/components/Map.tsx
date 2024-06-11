'use client';

import { FunctionComponent } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// This is a workaround for the marker icon not showing up out of the box
const DefaultIcon = L.divIcon({
  html: `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="15" fill="#FF5D22" opacity="0.5"/>
          <circle cx="15" cy="15" r="7" fill="#FF5D22"/>
        </svg>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  // Necessary to prevent default border and background of .leaflet-div-icon
  className: 'playground-map-marker',
});
L.Marker.prototype.options.icon = DefaultIcon;

type MapProps = {
  position: [number, number];
  height?: string;
  width?: string;
};

const Map: FunctionComponent<MapProps> = (props) => {
  return (
    <MapContainer
      center={props.position}
      zoom={9}
      style={{ height: props.height ?? '200px', width: props.width ?? '100%' }}
      dragging={false}
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      {/* More options here https://github.com/leaflet-extras/leaflet-providers */}
      {/* <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' /> */}
      <TileLayer url='https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png' />
      <Marker position={props.position} icon={DefaultIcon} interactive={false} />
    </MapContainer>
  );
};

export default Map;
