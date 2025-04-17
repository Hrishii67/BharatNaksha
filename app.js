var map = L.map('map').setView([20.5937, 78.9629], 4);
map.zoomControl.setPosition('topright');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


let selected=null;




const style = document.createElement('style');
style.textContent = `
  .leaflet-interactive.hatch {
    animation: float 1s forwards;
    filter: drop-shadow(3px 5px 5px rgba(0, 0, 0, 0.5));
  }
  
  @keyframes float {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-5px);
    }
  }
`;
document.head.appendChild(style);

function updateHatchColor(color) {
    const pattern = document.querySelector('#diagonalHatch');
    if (pattern) {
      const lines = pattern.querySelectorAll('line, path');
      lines.forEach(line => {
        line.setAttribute('stroke', color);
      });
    }
  }
  

function highlightFeature(e){
    if (selected){
        geojson.resetStyle(selected);
        const prevEl = selected.getElement();
        if (prevEl) {
            prevEl.classList.remove('hatch');
            prevEl.style.filter = 'none';
            prevEl.style.transform = 'translateY(0)';
        }
    }
    selected = e.target;
    selected.setStyle({
        color: '#FF004C',
        weight: 5,
        fillColor: '#CCCCCC',
        fillOpacity: 0.9,
        dashArray: '5,5'
    });

    updateHatchColor('#FFCC00');
    selected.bringToFront()

    const el = selected.getElement()
    if (el) {
        el.classList.add('hatch');
        el.style.filter = 'drop-shadow(3px 5px 5px rgba(0, 0, 0, 0.5))';
    }
}


let allFeatures = [];

let geojson, geojson2;

fetch('https://raw.githubusercontent.com/Hrishii67/BharatNaksha/main/Data/Indian_State_Shapefile_1.geojson')
  .then(response => response.json())
  .then(data => {
    allFeatures = allFeatures.concat(data.features);
    document.getElementById('total-states').innerText = `Total States & Union Territories: 36`;
    geojson = L.geoJSON(data, {
      style: {
        color: '#FFCC00',
        weight: 1,
        fillColor: '#003773',
        fillOpacity: 0.95
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.Name, {
          sticky: true,
          direction: 'top'
        });

        layer.on({
          click: function (e) {
            highlightFeature(e);
            const props = e.target.feature.properties;
            const randomStates = allFeatures.map(f => f.properties.Name).sort(() => Math.random() - 0.5).slice(0, 5);

            document.getElementById('state').innerText = `State Name: ${props.Name}`;
            document.getElementById('state-stats').innerText = `Population: ${props.Population} people`;
            document.getElementById('surrounding-states').innerText = `Other States: ${randomStates.join(', ')}`;
            document.getElementById('state-unique').innerText = `Spotlight On: ${props["Famous For"]}`;
            document.getElementById('sidebar').classList.add('visible');
          },
          mouseover: function (e) {
            if (e.target !== selected) {
              e.target.setStyle({
                weight: 2,
                color: '#FF004C',
                fillOpacity: 0.7
              });
            }
          },
          mouseout: function (e) {
            if (e.target !== selected) {
              geojson.resetStyle(e.target);
            }
          }
        });
      }
    }).addTo(map);
  })
  .catch(error => console.error("Error loading GeoJSON 1: ", error));

fetch('https://raw.githubusercontent.com/Hrishii67/BharatNaksha/main/Data/Indian_State_Shapefile_2.json')
  .then(res => res.json())
  .then(data => {
    allFeatures = allFeatures.concat(data.features);
    geojson2 = L.geoJSON(data, {
      style: {
        color: '#FFCC00',
        weight: 1,
        fillColor: '#003773',
        fillOpacity: 0.95
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.Name, {
          sticky: true,
          direction: 'top'
        });

        layer.on({
          click: function (e) {
            highlightFeature(e);
            const props = e.target.feature.properties;
            const randomStates = allFeatures.map(f => f.properties.Name).sort(() => Math.random() - 0.5).slice(0, 5);

            document.getElementById('state').innerText = `State Name: ${props.Name}`;
            document.getElementById('state-stats').innerText = `Population: ${props.Population} people`;
            document.getElementById('surrounding-states').innerText = `Other States: ${randomStates.join(', ')}`;
            document.getElementById('state-unique').innerText = `Spotlight On: ${props["Famous For"]}`;
            document.getElementById('sidebar').classList.add('visible');
          },
          mouseover: function (e) {
            if (e.target !== selected) {
              e.target.setStyle({
                weight: 2,
                color: '#FF004C',
                fillOpacity: 0.7
              });
            }
          },
          mouseout: function (e) {
            if (e.target !== selected) {
              geojson2.resetStyle(e.target);
            }
          }
        });
      }
    }).addTo(map);
  })
  .catch(error => console.error("Error loading GeoJSON 2: ", error));


document.getElementById('toggleBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('visible');
});


const searchInput = document.getElementById('stateSearch');
const suggestionsDiv = document.getElementById('suggestions');

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  suggestionsDiv.innerHTML = '';

  if (!query) return;

  const allNames = allFeatures.map(f => f.properties.Name);
  const matches = allNames.filter(name => name.toLowerCase().includes(query));

  matches.slice(0, 5).forEach(match => {
    const div = document.createElement('div');
    div.textContent = match;
    div.classList.add('suggestion');
    div.onclick = () => {
      searchInput.value = match;
      suggestionsDiv.innerHTML = '';
      triggerSearch(match.toLowerCase());
    };
    suggestionsDiv.appendChild(div);
  });
});

function triggerSearch(query) {
  [geojson, geojson2].forEach(layerGroup => {
    if (layerGroup) {
      layerGroup.eachLayer(layer => {
        const name = layer.feature.properties.Name.toLowerCase();
        if (name === query) {
          highlightFeature({ target: layer });

          const props = layer.feature.properties;
          const randomStates = allFeatures.map(f => f.properties.Name).sort(() => Math.random() - 0.5).slice(0, 5);

          document.getElementById('state').innerText = `State Name: ${props.Name}`;
          document.getElementById('state-stats').innerText = `Population: ${props.Population} people`;
          document.getElementById('surrounding-states').innerText = `Other States: ${randomStates.join(', ')}`;
          document.getElementById('state-unique').innerText = `Spotlight On: ${props["Famous For"]}`;

          document.getElementById('sidebar').classList.add('visible');
        }
      });
    }
  });
}

map.on('click', function () {
  document.getElementById('sidebar').classList.add('visible');
});




