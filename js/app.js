const map = L.map('map',{
  zoomSnap: 0.5,	
  maxZoom:19,
  zoomControl:false});

map.setView([52.00, 19.63], 6);

//Extend ZoomBar - Adbutton "Start map"
L.Control.MyZoomBar = L.Control.Zoom.extend({
	onAdd: function(map) {
				const container = L.Control.Zoom.prototype.onAdd.call(this, map);
				// Dodaj nowy przycisk
				const startMap = L.DomUtil.create('a', 'leaflet-control-zoom-bar', container);
				startMap.innerHTML = '<img src="css/images/home.png" style="margin-top:2px">';
				startMap.href = '#';
				startMap.title = 'Mapa startowa';
				L.DomEvent.on(startMap, 'click', this._zoomToStart, this);
				container.prepend(startMap);
				return container;
			},
	_zoomToStart: function(e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        map.setView([52.00, 19.63], 6);
    }
});
	
map.addControl(new L.Control.MyZoomBar())


const wojewodztwa= L.tileLayer('tiles/wojewodztwa/{z}/{x}/{y}.png',{maxNativeZoom:9,maxZoom:11,minZoom:6,transparent:true}).addTo(map);
const powiaty=L.tileLayer('tiles/powiaty/{z}/{x}/{y}.png',{maxNativeZoom:11,maxZoom:13,minZoom:10,transparent:true}).addTo(map);

const openStreet=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 20,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
const beztla = L.tileLayer('',{maxZoom: 20});

const baseMaps = {
 'OpenStreet': openStreet,
 'Brak': beztla};

const overlayMap={
  
  'Powiaty':powiaty,
  'Województwa':wojewodztwa
}

const layerControl = L.control.layers(baseMaps,overlayMap).addTo(map);

//Search HTML
const formEl=document.querySelector('.js-search');
const searchBtnEl=document.querySelector('.js-search-btn');
const selectVoivodhipEl= document.querySelector('#js-voivodeship');
selectVoivodhipEl.addEventListener("change" ,getDistricts);
searchBtnEl.addEventListener('click',()=>toggleContainer(formEl));

function toggleContainer(container){
	container.classList.toggle("show")
}

async function getVoivodship(){
	const url='GeoJson/wojewodztwa_centroidy.geojson'
	const response= await fetch(url);
	const jsonres=await response.json();
	const voivodshipsArr= jsonres.features.map((item)=>item.properties);
	const sortedVoiArr=voivodshipsArr.sort((a,b)=>a.JPT_NAZWA_>b.JPT_NAZWA_);
	let voivodshipOptionsHtml='<option value="">Wybierz województwo</option>';
	const selectVoivodhipEl= document.querySelector('#js-voivodeship');
	for(const item of sortedVoiArr){
		voivodshipOptionsHtml+=`<option value="${item.JPT_KOD_JE}">${item.JPT_NAZWA_}</option>`
	}
	selectVoivodhipEl.innerHTML=voivodshipOptionsHtml;
}
getVoivodship();

async function getDistricts(){
	const url='GeoJson/powiaty_centroidy.geojson'
	const response=await fetch(url);	
	const jsonres=await response.json();
	const districtArr= jsonres.features.map((item)=>item.properties).sort((a,b)=>a.JPT_NAZWA_>b.JPT_NAZWA_);
	let districtOptionsHtml='<option value="">Wybierz powiat</option>';
	const selectDistrictEl= document.querySelector('#js-district');
	const selectedVoivodEl=document.querySelector('#js-voivodeship').value;
	
	for(const item of districtArr){
		item.JPT_WOJ==selectedVoivodEl?districtOptionsHtml+=`<option value="${item.JPT_KOD_JE}">${item.JPT_NAZWA_}</option>`:null;
	}
	selectDistrictEl.innerHTML=districtOptionsHtml;
}

