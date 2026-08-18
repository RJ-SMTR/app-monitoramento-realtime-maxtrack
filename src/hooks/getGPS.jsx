/* eslint-disable react/prop-types */
import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const GPSContext = createContext()

// Em dev, as chamadas passam pelo proxy do Vite (vite.config.js) para evitar CORS.
const API_BASE = import.meta.env.DEV ? '/mobilidade-api' : 'https://dados.mobilidade.rio'

export function GPSProvider({ children }) {
    const [realtimeSPPO, setRealtimeSPPO] = useState([])
    const [paintColors, setPaintColors] = useState({})

    async function getSPPO(){
        const datetimeFim = new Date();
        const datetimeInicio = new Date(datetimeFim.getTime() - 5 * 60 * 1000);
        const toApiDatetime = (date) => date.toISOString().slice(0, 19) + 'Z';

        const params = new URLSearchParams({
            datetime_inicio: toApiDatetime(datetimeInicio),
            datetime_fim: toApiDatetime(datetimeFim),
        });

        await axios.get(`${API_BASE}/sppo/maxtrack/gps?${params.toString()}`)
            .then((response) => {
                setRealtimeSPPO(response.data)
            })
    }
    async function getPaintColors() {
        const { data } = await axios.get(`${API_BASE}/api/monitoramento-realtime/`);
        const allColors = {};
        data.forEach((item) => {
            allColors[item.ordem] = item;
        });
        setPaintColors(allColors);
    }

    function getGPSAndSPPO() {
        getPaintColors()
        getSPPO()
    }


    useEffect(() => {
       getGPSAndSPPO()

        const interval = setInterval(getGPSAndSPPO, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <GPSContext.Provider value={{ realtimeSPPO, paintColors }}>
            {children}
        </GPSContext.Provider>
    )
}
