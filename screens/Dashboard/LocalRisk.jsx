import { useEffect, useState } from "react";
import { Text } from "react-native";
import { fetchEarthquakeData } from "../../requests";

export default function LocalRisk() {
  const [earthquakeData, setEarthquakeData] = useState({});
  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchEarthquakeData(94404);
        setEarthquakeData(data);
      } catch (error) {
        console.error("Error fetching earthquake data:", error);
      }
    };
    getData();
  }, []);
  return <Text>{JSON.stringify(earthquakeData)}</Text>;
}
