import { useQuery } from "@tanstack/react-query";
import {
  fetchStatesByCountry,
  fetchCitiesByState,
} from "../api/services/location";

export const useStates = (country: string = "Nigeria") => {
  return useQuery({
    queryKey: ["states", country],
    queryFn: () => fetchStatesByCountry(country),
    staleTime: Infinity,
  });
};

export const useCities = (state: string, country: string = "Nigeria") => {
  return useQuery({
    queryKey: ["cities", state, country],
    queryFn: () => fetchCitiesByState(state, country),
    enabled: !!state,
    staleTime: Infinity,
  });
};
