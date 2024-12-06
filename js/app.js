const map = L.map('map',{
  zoomSnap: 0.5,	
  maxZoom:19,
	zoomSnap:1,
  zoomControl:false});

map.setView([52.50, 19.63], 6);

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
	
map.addControl(new L.Control.MyZoomBar());
L.control.measure().addTo(map);//pomiar odleglosci powierzchni
L.control.scale({imperial:false}).addTo(map);

const wojewodztwa= L.tileLayer('tiles/wojewodztwa/{z}/{x}/{y}.png',{maxNativeZoom:9,maxZoom:10,minZoom:6,transparent:true}).addTo(map);
const powiaty=L.tileLayer('tiles/powiaty/{z}/{x}/{y}.png',{maxNativeZoom:11,maxZoom:12,minZoom:10,transparent:true}).addTo(map);
const gminy=L.tileLayer('tiles/gminy/{z}/{x}/{y}.png',{maxNativeZoom:11,maxZoom:14,minZoom:11,transparent:true}).addTo(map);

const googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
	maxZoom: 20,
	subdomains:['mt0','mt1','mt2','mt3'],
	attribution: '&copy; <a href="https://www.google.com/intl/pl_pl/help/terms_maps/">Dane mapy Google 2024</a>'
	});			
const googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
	maxZoom: 22,
	subdomains:['mt0','mt1','mt2','mt3'],
	attribution: '&copy; <a href="https://www.google.com/intl/pl_pl/help/terms_maps/">Dane mapy Google 2024</a>'
	});
const openStreet=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 20,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
const beztla = L.tileLayer('',{maxZoom: 20});

const baseMaps = {
	'Google zdjęcia':googleHybrid,
	'Google mapa':googleStreets,
 	'OpenStreet': openStreet,
 	'Brak': beztla};

const overlayMap={
	"<img src='css/images/woj_legend.png' align=top style='margin:0px 4px 0px 0px'>Województwa":wojewodztwa,  
	"<img src='css/images/pow_legend.png' align=top style='margin:2px 4px 2px 0px'>Powiaty":powiaty,
	"<img src='css/images/gm_legend.png' align=top style='margin:2px 4px 2px 0px'>Gminy":gminy	
}

const layerControl = L.control.layers(baseMaps,overlayMap).addTo(map);
map.on("zoom",()=>{let currentzoom = map.getZoom();
	console.log(currentzoom)});

getVoivodship();

//Popup for gminy GeoJson
let layerGeojsonGminy;
async function renderGminyGeoJson() {
  const url = 'GeoJson/gminy_labels.geojson';
  const response = await fetch(url);
  const gminy = await response.json();
  layerGeojsonGminy=L.geoJson(gminy,{
		onEachFeature: function(feature,layer){
			layer.on("mouseover",()=>addTextToDiv(`<b>TERYT: </b>${feature.properties.JPT_KOD_JE}<br><b>Województwo:</b> ${feature.properties.WOJ_NAME}<br><b>Powiat:</b> ${feature.properties.POW_NAME}<br><b>Gmina: <span style='color:red'>${feature.properties.JPT_NAZWA_}</span></b><br><b>Rodzaj:</b> ${feature.properties.RODZAJ}<br>`))
			layer.on("mouseout",()=>{const markerPlace = document.querySelector(".info-marker-position"); markerPlace.style.visibility='hidden'})
			layer.bindPopup(`<b>Województwo:</b> ${feature.properties.WOJ_NAME}<br><b>Powiat:</b> ${feature.properties.POW_NAME}<br><b>Gmina: <span style='color:red'>${feature.properties.JPT_NAZWA_}</b></span></b><br><b>Rodzaj:</b> ${feature.properties.RODZAJ}<br><b>TERYT: </b>${feature.properties.JPT_KOD_JE}`)
		},	
		style: {color:"transparent",opacity:0}
}).addTo(map);} 
renderGminyGeoJson();

//hover gmina => attributes in div

function addTextToDiv(text) {
  const markerPlace = document.querySelector(".info-marker-position");
	markerPlace.style.visibility='visible';
  markerPlace.innerHTML = text;
}

//Search HTML

const formEl=document.querySelector('.js-search');
const searchBtnEl=document.querySelector('.js-search-btn');
const selectVoivodhipEl= document.querySelector('#js-voivodeship');
const selectDistrictEl=document.querySelector('#js-district');
selectDistrictEl.addEventListener('change',getCommunities);
selectVoivodhipEl.addEventListener("change" ,getDistricts);
searchBtnEl.addEventListener('click',()=>{(layerGeojson)?layerGeojson.remove():null;toggleContainer(formEl)});

function toggleContainer(container){
	container.classList.toggle("show")
}

async function getVoivodship(){
	const url='GeoJson/wojewodztwa_centroidy.geojson'
	const response= await fetch(url);
	const jsonres=await response.json();
	const voivodshipsArr= jsonres.features.map((item)=>item.properties).sort((a,b)=>a.JPT_NAZWA_>b.JPT_NAZWA_);
	let voivodshipOptionsHtml='<option value="initial">Wybierz województwo</option>';
	const selectVoivodhipEl= document.querySelector('#js-voivodeship');
	for(const item of voivodshipsArr){
		voivodshipOptionsHtml+=`<option value="${item.JPT_KOD_JE}">${item.JPT_NAZWA_}</option>`
	}
	selectVoivodhipEl.innerHTML=voivodshipOptionsHtml;
}


async function getDistricts(){
	const selectDistrictEl= document.querySelector('#js-district');
	const selectCommunityEl= document.querySelector('#js-community');
	selectCommunityEl.innerHTML='<option value="initial">Wybierz gmine</option>';
	selectCommunityEl.disabled=true;
	const url='GeoJson/powiaty_centroidy.geojson'
	const response=await fetch(url);	
	const jsonres=await response.json();
	const districtArr= jsonres.features.map((item)=>item.properties).sort((a,b)=>a.JPT_NAZWA_>b.JPT_NAZWA_);
	let districtOptionsHtml='<option value="initial">Wybierz powiat</option>';
	const selectedVoivodEl=document.querySelector('#js-voivodeship').value;
	for(const item of districtArr){
		item.JPT_WOJ==selectedVoivodEl?districtOptionsHtml+=`<option value="${item.JPT_KOD_JE}">${item.JPT_NAZWA_}</option>`:null;
	}
	selectDistrictEl.innerHTML=districtOptionsHtml;
	selectedVoivodEl==='initial'?selectDistrictEl.disabled=true:selectDistrictEl.removeAttribute('disabled');
}

async function getCommunities(){
	const url='GeoJson/gminy_centroidy.geojson'
	const response= await fetch(url);
	const jsonres=await response.json();
	const communityArr= jsonres.features.map((item)=>item.properties).sort((a,b)=>a.JPT_NAZWA_>b.JPT_NAZWA_);
	let communityOptionsHtml='<option value="initial">Wybierz gmine</option>';
	const selectCommunityEl= document.querySelector('#js-community');
	const selectedDistrictEl=document.querySelector('#js-district').value;
	

	for(const item of communityArr){
		item.JPT_POW==selectedDistrictEl?communityOptionsHtml+=`<option value="${item.JPT_KOD_JE}">${item.JPT_NAZWA_}</option>`:null;
	}
	selectCommunityEl.innerHTML=communityOptionsHtml;
	selectedDistrictEl==='initial'?selectCommunityEl.disabled=true:selectCommunityEl.removeAttribute('disabled');
}

//get geometries voivodship for markers
let layerGeojson;
const btnVoivodeshipEL=document.querySelector('.js-voivodeship-btn');
btnVoivodeshipEL.addEventListener('click',()=>{event.preventDefault();getGeometryVoivodship()});
async function getGeometryVoivodship(){
	(layerGeojson)?layerGeojson.remove():null;
	let selectedGeometry;
	const selectedVoivodshipEl=document.querySelector('#js-voivodeship').value;
	const res=await fetch('GeoJson/wojewodztwa_centroidy.geojson');
	const resJson=await res.json();
	for(const element of resJson.features){
		if(element.properties.JPT_KOD_JE==selectedVoivodshipEl){
			selectedGeometry=element;
			break;
			}
		}
		layerGeojson=L.geoJson(selectedGeometry).bindPopup(`<b>Województwo</b>: ${selectedGeometry.properties.JPT_NAZWA_}`).addTo(map);
		map.setView(layerGeojson.getBounds().getCenter(),8)
};

//get geometries district for markers
const btnDistrictEl=document.querySelector('.js-district-btn');
btnDistrictEl.addEventListener('click', ()=>{event.preventDefault();getGeometryDistrict()});
async function getGeometryDistrict(){
	(layerGeojson)?layerGeojson.remove():null;
	let selectedGeometry;
	const selectedDistrictEl=document.querySelector('#js-district').value;
	const res=await fetch('GeoJson/powiaty_centroidy.geojson');
	const resJson=await res.json();
	for(const element of resJson.features){
		if(element.properties.JPT_KOD_JE==selectedDistrictEl){
			selectedGeometry=element;
			break;
			}
		}
		layerGeojson=L.geoJson(selectedGeometry).bindPopup(`<b>Powiat: </b>${selectedGeometry.properties.JPT_NAZWA_}`).addTo(map);
		map.setView(layerGeojson.getBounds().getCenter(),10)
};

//get geometries communities for markers
const btnCommunityEl=document.querySelector('.js-community-btn');
btnCommunityEl.addEventListener('click', ()=>{event.preventDefault();getGeometryCommunity()});
async function getGeometryCommunity(){
	(layerGeojson)?layerGeojson.remove():null;
	let selectedGeometry;
	const selectedDistrictEl=document.querySelector('#js-community').value;
	const res=await fetch('GeoJson/gminy_centroidy.geojson');
	const resJson=await res.json();
	for(const element of resJson.features){
		if(element.properties.JPT_KOD_JE==selectedDistrictEl){
			selectedGeometry=element;
			break;
			}
		}
		layerGeojson=L.geoJson(selectedGeometry).bindPopup(`<b>Gmina:</b> ${selectedGeometry.properties.JPT_NAZWA_}`).addTo(map);
		map.setView(layerGeojson.getBounds().getCenter(),12)
};

//support for coordinate systems
map.on("mousemove", function (e) {
	const markerPlaceWGS84 = document.querySelector(".wgs84");
	const markerPlacePozostale = document.querySelector(".pozostaleWSP");
	const crs1992proj = "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
	let crs1992 = proj4(crs1992proj, [e.latlng.lng, e.latlng.lat]);
	const crs2000s6proj = "+proj=tmerc +lat_0=0 +lon_0=18 +k=0.999923 +x_0=6500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
	let crs2000s6 = proj4(crs2000s6proj, [e.latlng.lng, e.latlng.lat]);
	const crs2000s7proj = "+proj=tmerc +lat_0=0 +lon_0=21 +k=0.999923 +x_0=7500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
	let crs2000s7 = proj4(crs2000s7proj, [e.latlng.lng, e.latlng.lat]);
	const crs1965s1proj = "+proj=sterea +lat_0=50.625 +lon_0=21.08333333333333 +k=0.9998 +x_0=4637000 +y_0=5467000 +ellps=krass +towgs84=33.4,-146.6,-76.3,-0.359,-0.053,0.844,-0.84 +units=m +no_defs";
	let crs1965s1 = proj4(crs1965s1proj, [e.latlng.lng, e.latlng.lat]);
	let x = e.latlng.lat;
	let y = e.latlng.lng;
	let selectedUkladEl = document.querySelector(".js-wybierzUklad").value;
	if (selectedUkladEl == 'PUWG1992') {
		markerPlacePozostale.innerHTML = crs1992[0].toFixed(2) + ', ' + crs1992[1].toFixed(2)
	}
	else if (selectedUkladEl == '2000s6') {
		markerPlacePozostale.innerHTML = crs2000s6[0].toFixed(2) + ',  ' + crs2000s6[1].toFixed(2)
	}
	else if (selectedUkladEl == '2000s7') {
		markerPlacePozostale.innerHTML = crs2000s7[0].toFixed(2) + ',  ' + crs2000s7[1].toFixed(2)
	}
	else if (selectedUkladEl == '1965s1') {
		markerPlacePozostale.innerHTML = crs1965s1[0].toFixed(2) + ',  ' + crs1965s1[1].toFixed(2)
	}
	markerPlaceWGS84.innerHTML = '<span style="font-weight:700">WGS 84	</span>' + '<span style="font-weight:700">X: </span>' + x.toFixed(6) + '<span style="font-weight:700"> Y: </span>' + y.toFixed(6)})


//Control Search for gminy
const initialGmina={
	"type": "FeatureCollection",
	"name": "gminy",
	"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
	"features": [
{ "type": "Feature", "properties": { "JPT_NAZWA_": "W trakcie realizacji..." }, "geometry": { "type": "Point", "coordinates": [ 19.48489, 50.304294 ] } },
	]
};
const testGmina= new L.geoJson(initialGmina);

/*function nowylayer(){
	let selectElObrebWFS=document.querySelector("#obreby").value.substring(0,13);
	console.log(selectElObrebWFS);
	document.getElementById("searchtext16").placeholder="Ładuję listę działek...";
	let urlWFSDzialki=`http://192.168.0.65:8080/geoserver/gorzowski_Arek/ows?service=WFS&version=1.0.0&request=GetFeature&CQL_FILTER=idDzialki%20LIKE%20%27${selectElObrebWFS}%25%27&typeName=gorzowski_Arek%3Adzialki_etykiety&outputFormat=application%2Fjson&srsName=epsg:4326`;
	console.log(urlWFSDzialki);
		$.getJSON(urlWFSDzialki)
		.then((res)=>{
			console.log(res);
		let layerWFSDzialki=L.geoJson(res);
		controlSearch.setLayer(layerWFSDzialki)})
		.then(()=>{
		document.getElementById("searchtext16").placeholder="Wyszukaj działkę";})
		.then(()=>{document.getElementById("searchtext16").disabled = false;})
			};*/

const controlSearch= new L.Control.Search({
	layer: testGmina,
	collapsed: false,
	initial: false,
	hideMarkerOnCollapse: true,
	container:"js-search",
	textPlaceholder: "W trakcie realizacji...",
	propertyName: 'JPT_NAZWA_'});
	map.addControl(controlSearch);
		
	//document.getElementById("searchtext16").disabled = true;
				