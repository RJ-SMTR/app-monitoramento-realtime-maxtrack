/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react"
import { GPSContext } from "./getGPS"
import * as turf from '@turf/turf';
import { wktRio } from '../components/polygon/holes.js'
import wellknown from 'wellknown';




export const MovingMarkerContext = createContext()


export function MovingMarkerProvider({ children }) {
    const colors = {
        "Área A": "#8031A7",
        "Área B": "#FF7500",
        "Área C": "#9E652E",
        "Área D": "#71C5E8",
        "Área E": "#F04E98",
        "Área F": "#1FA824",
        "Área G": "#0047BB",
        "Área H": "#E4002B",
        "Área I": "#B1B3B3",
        "Demais": "#FFFFFF",
}

    const { realtimeSPPO, paintColors } = useContext(GPSContext)
    const [selectedLinhas, setSelectedLinhas] = useState(null)
    const [trackedSPPO, setTrackedSPPO] = useState([])
    const [showSPPO, setShowSPPO] = useState(true);
    const [enabledColors, setEnabledColors] = useState(Object.fromEntries( Object.values(colors).map(color => [color, true])));

    const wktToGeoJson = (wkt) => {
        const geometry = wellknown.parse(wkt);
        return {
            type: 'Feature',
            geometry,
        }

    }

    useEffect(() => {
        if (realtimeSPPO) {
            const max_latitude = -22.59
            const min_latitude = -23.13
            const max_longitude = -43.0
            const min_longitude = -43.87


            const wktExample = wktRio
            const geoJsonFromWkt = wktToGeoJson(wktExample)

            const uniqueItems = realtimeSPPO.reduce((uniqueItems, item) => {
                const existingItemIndex = uniqueItems.findIndex(existingItem => existingItem.id_veiculo === item.id_veiculo)

                if (existingItemIndex === -1) {
                    uniqueItems.push(item)
                } else {
                    const existingDatahora = uniqueItems[existingItemIndex].datetime
                    const newDatahora = item.datetime

                    if (newDatahora > existingDatahora) {
                        uniqueItems[existingItemIndex] = item;
                    }
                }

                return uniqueItems;
            }, []);
            const filteredSPPO = uniqueItems.filter(item => {
                const latitude = item.latitude;
                const longitude = item.longitude;
                const point = turf.point([longitude, latitude]);

                return turf.booleanPointInPolygon(point, geoJsonFromWkt) && min_latitude <= latitude && latitude <= max_latitude && min_longitude <= longitude && longitude <= max_longitude;
            });
            setTrackedSPPO(filteredSPPO);

        }
    }, [realtimeSPPO]);
















    return (
        <MovingMarkerContext.Provider value={{ trackedSPPO, selectedLinhas, setSelectedLinhas, showSPPO, setShowSPPO, paintColors, enabledColors, setEnabledColors, colors }}>
            {children}
        </MovingMarkerContext.Provider>
    )
}