import React, {useEffect, useState} from 'react';
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import {sortData, prettyPrintStat} from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import{
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent
} from "@material-ui/core";

function App() {
  const [countries, setCountries]=useState([]);
  const [country,setCountry]=useState('worldwide');
  const [countryInfo, setCountryInfo]=useState({});
  const [tableData,setTableData]=useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter,setMapCenter]=useState({lat:34.80746, lng: -40.4796});
  const [mapZoom,setMapZoom]=useState(3);
  const [mapCountries,setMapCountries]= useState([]);

  useEffect(()=>{
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response=>response.json())
    .then(data=>{
      setCountryInfo(data);
    });
  },[])

  useEffect(()=>{
    const getCountriesData=async()=>{
    await fetch("https://disease.sh/v3/covid-19/countries")
    .then((response)=>response.json())
    .then((data)=>{
      const countries= data.map((country) => (
        {
          name: country.country,
          value:country.countryInfo.iso2
        }));

        const sortedData=sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
    });
    };
    getCountriesData(); 
  }, []);

  const onCountryChange=async(event)=>{
    const countryCode=event.target.value;

    const url= countryCode==='worldwide' 
    ? 'https://disease.sh/v3/covid-19/all' : 
    `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then(response=>response.json())
    .then(data=>{
      setCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map((country)=>(
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
          active={casesType==="cases"}
          onClick={e=> setCasesType('cases')}
          title="Coronavirus Cases Today" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}/>
          <InfoBox 
          active={casesType==="recovered"}
          onClick={e=> setCasesType('recovered')}
          title="Recovered Today" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}/>
          <InfoBox 
          active={casesType==="deaths"}
          onClick={e=> setCasesType('deaths')}
          title="Deaths Today" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}/>
        </div>
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Life Cases By Country</h3>
          <Table countries={tableData}/>
          <h3>Worldwide New {(casesType)}</h3>
          <LineGraph casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
