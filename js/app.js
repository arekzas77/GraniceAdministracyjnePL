const map = L.map('map',{
  zoomSnap: 0.5,	
  maxZoom:19
        });

map.setView([52.00, 19.63], 6.5);

const wojewodztwa= L.tileLayer('tiles/wojewodztwa/{z}/{x}/{y}.png',{maxNativeZoom:9,maxZoom:10,minZoom:6,transparent:true}).addTo(map)

const openStreet=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 20,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
const beztla = L.tileLayer('',{maxZoom: 20});

const baseMaps = {
 'OpenStreet': openStreet,
 'Brak': beztla};

const overlayMap={
  'Województwa':wojewodztwa
}

const layerControl = L.control.layers(baseMaps,overlayMap).addTo(map);