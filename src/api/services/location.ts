const BASE_URL = "https://countriesnow.space/api/v0.1";

interface CountriesNowState {
  name: string;
  state_code: string;
}

interface CountriesNowStatesResponse {
  error: boolean;
  msg: string;
  data: {
    name: string;
    iso2: string;
    iso3: string;
    states: CountriesNowState[];
  };
}

interface CountriesNowCitiesResponse {
  error: boolean;
  msg: string;
  data: string[];
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function fetchStatesByCountry(
  country: string = "Nigeria",
): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/countries/states`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country }),
  });

  if (!res.ok) throw new Error(`fetchStatesByCountry: HTTP ${res.status}`);

  const json: CountriesNowStatesResponse = await res.json();

  if (json.error) throw new Error(`fetchStatesByCountry: ${json.msg}`);

  return (json.data?.states ?? [])
    .map((s) => s.name)
    .sort((a, b) => a.localeCompare(b));
}


export async function fetchCitiesByState(
  state: string,
  country: string = "Nigeria",
): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/countries/state/cities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country, state }),
  });

  if (!res.ok) throw new Error(`fetchCitiesByState: HTTP ${res.status}`);

  const json: CountriesNowCitiesResponse = await res.json();

  if (json.error) throw new Error(`fetchCitiesByState: ${json.msg}`);

  return (json.data ?? []).sort((a, b) => a.localeCompare(b));
}
