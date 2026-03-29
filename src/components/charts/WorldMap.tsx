'use client';

import { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { formatValue } from '@/lib/data';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO 3166-1 numeric → ISO3 alpha-3 mapping (for joining map geometries to our data)
const NUM_TO_ISO3: Record<string, string> = {
  '004':'AFG','008':'ALB','012':'DZA','020':'AND','024':'AGO','028':'ATG','032':'ARG','036':'AUS',
  '040':'AUT','044':'BHS','048':'BHR','050':'BGD','051':'ARM','052':'BRB','056':'BEL','060':'BMU',
  '064':'BTN','068':'BOL','070':'BIH','072':'BWA','076':'BRA','084':'BLZ','090':'SLB','096':'BRN',
  '100':'BGR','104':'MMR','108':'BDI','112':'BLR','116':'KHM','120':'CMR','124':'CAN','132':'CPV',
  '140':'CAF','144':'LKA','148':'TCD','152':'CHL','156':'CHN','158':'TWN','170':'COL','174':'COM',
  '178':'COG','180':'COD','188':'CRI','191':'HRV','192':'CUB','196':'CYP','203':'CZE','204':'BEN',
  '208':'DNK','214':'DOM','218':'ECU','222':'SLV','226':'GNQ','231':'ETH','232':'ERI','233':'EST',
  '234':'FRO','242':'FJI','246':'FIN','250':'FRA','258':'PYF','262':'DJI','266':'GAB','268':'GEO',
  '270':'GMB','275':'PSE','276':'DEU','288':'GHA','300':'GRC','308':'GRD','316':'GUM','320':'GTM',
  '324':'GIN','328':'GUY','332':'HTI','340':'HND','344':'HKG','348':'HUN','352':'ISL','356':'IND',
  '360':'IDN','364':'IRN','368':'IRQ','372':'IRL','376':'ISR','380':'ITA','384':'CIV','388':'JAM',
  '392':'JPN','398':'KAZ','400':'JOR','404':'KEN','408':'PRK','410':'KOR','414':'KWT','417':'KGZ',
  '418':'LAO','422':'LBN','426':'LSO','428':'LVA','430':'LBR','434':'LBY','438':'LIE','440':'LTU',
  '442':'LUX','450':'MDG','454':'MWI','458':'MYS','462':'MDV','466':'MLI','470':'MLT','478':'MRT',
  '480':'MUS','484':'MEX','492':'MCO','496':'MNG','498':'MDA','499':'MNE','504':'MAR','508':'MOZ',
  '512':'OMN','516':'NAM','520':'NRU','524':'NPL','528':'NLD','540':'NCL','554':'NZL','558':'NIC',
  '562':'NER','566':'NGA','578':'NOR','586':'PAK','591':'PAN','598':'PNG','600':'PRY','604':'PER',
  '608':'PHL','616':'POL','620':'PRT','624':'GNB','626':'TLS','630':'PRI','634':'QAT','642':'ROU',
  '643':'RUS','646':'RWA','662':'LCA','670':'VCT','674':'SMR','678':'STP','682':'SAU','686':'SEN',
  '688':'SRB','690':'SYC','694':'SLE','702':'SGP','703':'SVK','704':'VNM','705':'SVN','706':'SOM',
  '710':'ZAF','716':'ZWE','724':'ESP','728':'SSD','729':'SDN','740':'SUR','748':'SWZ','752':'SWE',
  '756':'CHE','760':'SYR','762':'TJK','764':'THA','768':'TGO','776':'TON','780':'TTO','784':'ARE',
  '788':'TUN','792':'TUR','795':'TKM','800':'UGA','804':'UKR','807':'MKD','818':'EGY','826':'GBR',
  '834':'TZA','840':'USA','854':'BFA','858':'URY','860':'UZB','862':'VEN','887':'YEM','894':'ZMB',
};

interface MapData {
  countryId: string;
  value: number | null;
  year: string;
}

interface WorldMapProps {
  data: MapData[];
  format: string;
  decimals?: number;
  label?: string;
  colorScale?: [string, string]; // [low, high] color
}

function interpolateColor(low: [number, number, number], high: [number, number, number], t: number): string {
  const r = Math.round(low[0] + (high[0] - low[0]) * t);
  const g = Math.round(low[1] + (high[1] - low[1]) * t);
  const b = Math.round(low[2] + (high[2] - low[2]) * t);
  return `rgb(${r},${g},${b})`;
}

export default function WorldMap({
  data,
  format,
  decimals = 0,
  label,
  colorScale,
}: WorldMapProps) {
  const [tooltip, setTooltip] = useState<{ name: string; value: string; x: number; y: number } | null>(null);

  // Build lookup: iso3 -> { value, year }
  const dataMap = useMemo(() => {
    const m = new Map<string, MapData>();
    for (const d of data) {
      m.set(d.countryId, d);
    }
    return m;
  }, [data]);

  // Compute min/max for color scale
  const { min, max, useLog } = useMemo(() => {
    const values = data.filter(d => d.value != null).map(d => d.value as number);
    if (values.length === 0) return { min: 0, max: 1, useLog: false };
    const mn = Math.min(...values);
    const mx = Math.max(...values);
    // Use log scale when data is highly skewed (max/min ratio > 100 and all positive)
    const shouldLog = mn > 0 && mx / mn > 100;
    return { min: mn, max: mx, useLog: shouldLog };
  }, [data]);

  const lowColor: [number, number, number] = [219, 234, 254]; // blue-100
  const highColor: [number, number, number] = [30, 64, 175]; // blue-800

  return (
    <div className="relative">
      {label && <div className="text-[13px] font-medium text-[#666] mb-2">{label}</div>}
      <div className="border border-[#e8e8e8] rounded-xl overflow-hidden bg-[#f8fafe]">
        <ComposableMap
          projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
          width={800}
          height={400}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const numCode = geo.id || geo.properties?.['ISO_A3_EH'];
                  const iso3 = NUM_TO_ISO3[numCode] || geo.properties?.['ISO_A3'] || '';
                  const d = dataMap.get(iso3);
                  const hasData = d && d.value != null;

                  let fill = '#e8e8e8'; // no data
                  if (hasData && max > min) {
                    let t: number;
                    if (useLog) {
                      t = (Math.log(d.value as number) - Math.log(min)) / (Math.log(max) - Math.log(min));
                    } else {
                      t = ((d.value as number) - min) / (max - min);
                    }
                    fill = interpolateColor(lowColor, highColor, Math.max(0, Math.min(1, t)));
                  } else if (hasData) {
                    fill = interpolateColor(lowColor, highColor, 0.5);
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#fff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', fill: hasData ? '#f59e0b' : '#ddd', cursor: hasData ? 'pointer' : 'default' },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={(evt) => {
                        const name = geo.properties?.name || iso3;
                        const val = hasData ? formatValue(d.value, format, decimals) : 'No data';
                        setTooltip({
                          name,
                          value: hasData ? `${val} (${d.year})` : val,
                          x: evt.clientX,
                          y: evt.clientY,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] text-[#999]">
          <span>{formatValue(min, format, decimals)}</span>
          <div className="w-[120px] h-[8px] rounded-full" style={{
            background: `linear-gradient(to right, rgb(${lowColor.join(',')}), rgb(${highColor.join(',')}))`
          }} />
          <span>{formatValue(max, format, decimals)}</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-[100] bg-white border border-[#e8e8e8] rounded-lg px-3 py-2 shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <div className="text-[12px] font-semibold text-[#333]">{tooltip.name}</div>
          <div className="text-[12px] text-[#666]">{tooltip.value}</div>
        </div>
      )}
    </div>
  );
}
