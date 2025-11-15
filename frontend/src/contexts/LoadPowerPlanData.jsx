import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const PowerPlanDataContext = createContext();

export const PowerPlanDataProvider = ({ children }) => {
    const [powerPlanData, setPowerPlanData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/loadPowerPlanData');
                setPowerPlanData(response.data);
            } catch (error) {
                console.error('Error fetching power plan data:', error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1000); // 每秒更新一次
        return () => clearInterval(interval);
    }, []);

    return (
        <PowerPlanDataContext.Provider value={{ powerPlanData }}>
            {children}
        </PowerPlanDataContext.Provider>
    );
};
