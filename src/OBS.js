import './App.css';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const Match_API_URI = 'https://api.stratz.com/api/v1/Player/steamID/matches'
const Hero_API_URI = 'https://api.stratz.com/api/v1/Hero?languageId=20'
const headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJodHRwczovL3N0ZWFtY29tbXVuaXR5LmNvbS9vcGVuaWQvaWQvNzY1NjExOTgyNTk3MTYyMzIiLCJ1bmlxdWVfbmFtZSI6IkNvbnZvbHV0aW9uIiwiU3ViamVjdCI6IjI1MWNlOGNkLWEwMTUtNGNhMi05ZDA3LTllOTMzNTI5Nzg4YSIsIlN0ZWFtSWQiOiIyOTk0NTA1MDQiLCJuYmYiOjE2ODg0NjA1MzIsImV4cCI6MTcxOTk5NjUzMiwiaWF0IjoxNjg4NDYwNTMyLCJpc3MiOiJodHRwczovL2FwaS5zdHJhdHouY29tIn0.KuIL5MM9-WcbWAOGdLpD7EEFRNmI4kFNFbA0ysDanxY',
    accept: 'application/json'
}
const Match_API_URI_v2 = 'https://api.opendota.com/api/players/steamID/matches'
const headers_v2 = {
    accept: 'application/json'
}

const OBS = () => {
    const [searchParams,] = useSearchParams();

    const [inited, setInited] = useState(false);
    const [steamID, setSteamID] = useState('');
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [textColor, setTextColor] = useState(null);
    const [dataSource, setDataSource] = useState(null);

    //const [info, setInfo] = useState([]);
    const [heroInfo, setHeroInfo] = useState(null);
    const [battleLog, setBattleLog] = useState([]);

    const [lastTime, setLastTime] = useState(0);
    const [time, setTime] = useState(Date.now());

    const [lastLink, setLastLink] = useState(null);
    const [concatBattleLog, setConcatBattleLog] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now());
        }, 5000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        setSteamID(searchParams.get("steamID"));
        setTitle(decodeURIComponent(searchParams.get("title")));
        setTextColor(decodeURIComponent(searchParams.get("textColor")));
        setStartTime(searchParams.get("startTime"));
        setLastLink(searchParams.get("lastLink"));
        setDataSource(searchParams.get("dataSource"));

        //load hero info
        //*
        async function fetchHeroInfo() {
            try {
                //console.log("start");
                const res = await fetch(Hero_API_URI, { headers });
                if (!res.ok) {
                    throw Error('could not fetch the data for that resource');
                }
                const data = await res.json();
                let heros = {};
                //console.log(data);
                for (let [k, v] of Object.entries(data)) {
                    if (k == 0 || k == 127)
                        continue;
                    else {
                        //console.log(v);
                        heros[v['language']['heroId']] = v['language']['displayName'];
                    }
                }
                setHeroInfo(heros);
                setInited(true);
                //console.log("inited");
            } catch (error) {
                //console.log(error);
                setTimeout(() => {
                    fetchHeroInfo();
                }, 5000);
            }
        }
        fetchHeroInfo();

    }, []);

    function formatLog(matches) {
        let temp = [];
        for (let [, m] of Object.entries(matches)) {
            temp.push(heroInfo[m['hero_id']] + ' '
                + (m.result ? 'W' : 'L'));
        }
        return temp.reverse();
    }

    //Stratz
    async function fetchMatchInfo(match_uri, retry) {
        try {
            //console.log("try " + match_uri);
            const res = await fetch(match_uri, { headers });
            if (!res.ok) {
                throw Error('could not fetch the data for that resource');
            }
            const data = await res.json();
            
            let matches = [];
            for (let [, v] of Object.entries(data)) {
                matches.push({
                    "hero_id": v['players'][0]['heroId'],
                    "result": (v['didRadiantWin'] === (v['players'][0]['playerSlot'] < 128))
                })
            }

            return formatLog(matches);
        } catch (error) {
            if (retry) {
                setTimeout(() => {
                    fetchMatchInfo(match_uri, true);
                }, 5000);
            } else {
                return null;
            }
        }
    }

    //OpenDota
    async function fetchMatchInfo_v2(match_uri, startTime, endTime, retry) {
        try {
            //console.log("try " + match_uri);
            const res = await fetch(match_uri, { headers_v2 });
            if (!res.ok) {
                throw Error('could not fetch the data for that resource');
            }
            const data = await res.json();
            
            let matches = [];
            for (let [, v] of Object.entries(data)) {
                if (v['start_time'] < startTime || (endTime != null && v['start_time'] > endTime))
                    continue;
                matches.push({
                    "hero_id": v['hero_id'],
                    "result": (v['radiant_win'] === (v['player_slot'] < 128))
                })
            }

            return formatLog(matches);
        } catch (error) {
            if (retry) {
                setTimeout(() => {
                    fetchMatchInfo_v2(match_uri, startTime, endTime, true);
                }, 5000);
            } else {
                return null;
            }
        }
    }

    useEffect(() => {
        async function handleConcatData() {
            let concatTmp = [];
            let link = decodeURIComponent(lastLink);
            let w = link.split('#').map((x) => {
                let _ = x.split("+");
                return ({ id: _[0], startTime: _[1], endTime: _[2] });
            });
            for (let x of w) {
                if (dataSource == null || dataSource == 'Stratz') {
                    let _uri = Match_API_URI.replace('steamID', x.id)
                        + '?startDateTime=' + x.startTime
                        + '&endDateTime=' + x.endTime
                        + '&take=20';
                    let tmp = await fetchMatchInfo(_uri, true);
                    concatTmp = concatTmp.concat(tmp);
                } else if (dataSource == 'OpenDota') {
                    let _uri = Match_API_URI_v2.replace('steamID', x.id)
                        + '?limit=20';
                    let tmp = await fetchMatchInfo_v2(_uri, x.startTime, x.endTime, true);
                    concatTmp = concatTmp.concat(tmp);
                }
            }
            setConcatBattleLog(concatTmp);
        }

        if (lastLink != null) {
            handleConcatData();
        }
        //console.log(inited);
    }, [inited]);

    useEffect(() => {
        if (inited && time - lastTime > 30000) {
            setLastTime(time);

            //console.log("retry");
            //console.log(heroInfo);

            async function handleData() {
                let tmp = null;
                if (dataSource == null || dataSource == 'Stratz') {
                    const uri = Match_API_URI.replace('steamID', steamID)
                        + '?startDateTime=' + startTime
                        + '&take=20';
                    tmp = await fetchMatchInfo(uri, false);
                } else if (dataSource == 'OpenDota') {
                    const uri = Match_API_URI_v2.replace('steamID', steamID)
                        + '?limit=20';
                    tmp = await fetchMatchInfo_v2(uri, startTime, null, false);
                }
                
                if (tmp != null){
                    setBattleLog(tmp);
                }
            }

            handleData();
        }
    }, [time, inited]);

    return (
        <div className="obs">
            <label style={{ fontSize: 40, color: textColor }}>{title}</label>
            {concatBattleLog.map(m => (
                <label style={{ color: textColor }}>{m}</label>
            ))}
            {battleLog.map(m => (
                <label style={{ color: textColor }}>{m}</label>
            ))}
        </div>
    );
}

export default OBS;