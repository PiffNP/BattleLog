import './App.css';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gql, GraphQLClient, request} from 'graphql-request'

const stratz_endpoint = 'https://api.stratz.com/graphql'
const stratz_header = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdWJqZWN0IjoiMjUxY2U4Y2QtYTAxNS00Y2EyLTlkMDctOWU5MzM1Mjk3ODhhIiwiU3RlYW1JZCI6IjI5OTQ1MDUwNCIsIm5iZiI6MTcyMDc4NTExMCwiZXhwIjoxNzUyMzIxMTEwLCJpYXQiOjE3MjA3ODUxMTAsImlzcyI6Imh0dHBzOi8vYXBpLnN0cmF0ei5jb20ifQ.3tQ6ek4lW7U5CPcyWKtHF6ZYmQXbOnd_bVpJ60wUhbI',
}
const hero_query = `{constants{heroes(language: S_CHINESE){id displayName language {displayName}}}}`
const match_query = `{player(steamAccountId: STEAM_ID) {matches(request: {REQ_PARAM}) {
        players(steamAccountId: STEAM_ID) {
          matchId
          heroId
          isVictory
        }
      }
    }
}`

const Match_API_URI = 'https://api.stratz.com/api/v1/Player/steamID/matches'
//const Hero_API_URI = 'https://api.stratz.com/api/v1/Hero?languageId=20'
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

        //load hero info from Stratz
        //*
        async function fetchHeroInfo() {
            try {
                const res = await request(stratz_endpoint, hero_query, null, stratz_header);
                //console.log(res);
                const data = res["constants"]["heroes"];
                //console.log(data);
                let heroes = {};
                for (let i = 0; i < data.length; i++) {
                    if (data[i].language && data[i].language.displayName)
                        heroes[data[i].id] = data[i].language.displayName;
                    else if (data[i].displayName){
                        const shortname = {"Crystal Maiden":"CM",
                        "Phantom Lancer":"PL",
                        "Vengeful Spirit":"VS",
                        "Shadow Shaman":"Shaman",
                        "Queen of Pain":"QoP",
                        "Faceless Void":"FV",
                        "Death Prophet":"DP",
                        "Phantom Assassin":"PA",
                        "Templar Assassin":"TA",
                        "Dragon Knight":"DK",
                        "Nature's Prophet":"NP",
                        "Night Stalker":"NS",
                        "Bounty Hunter":"BH",
                        "Ancient Apparition":"AA",
                        "Spirit Breaker":"SB",
                        "Outworld Destroyer":"OD",
                        "Treant Protector":"Treant",
                        "Keeper of the Light":"KotL",
                        "Troll Warlord":"Troll",
                        "Centaur Warrunner":"Centaur",
                        "Skywrath Mage":"Skywrath",
                        "Legion Commander":"LC",
                        "Winter Wyvern":"WW"};            
                        let hero_name = data[i].displayName;
                        if (hero_name in shortname)
                            hero_name = shortname[hero_name];
                        heroes[data[i].id] = hero_name;
                        //if (data[i].displayName.length > 12)
                        //    console.log("\"" + data[i].displayName + '(' + hero_name + ')' + '\":\"' + data[i].id +"\",");
                    }
                    else{
                        if(data[i].id == 131)
                            heroes[data[i].id] = `Ringmaster`;
                        else
                            heroes[data[i].id] = `hero_${data[i].id}`;                    
                    }
                }
                //console.log(heroes)
                setHeroInfo(heroes);
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
        //console.log(matches);
        matches.sort((a,b) => {
            return a['match_id'] - b['match_id'];
        });
        let temp = [];
        let last_match_id = -1;
        for (let [, m] of Object.entries(matches)) {
            if (m['match_id'] != last_match_id){
                last_match_id = m['match_id'];
                temp.push(heroInfo[m['hero_id']] + ' '
                    + (m.result ? 'W' : 'L'));
            }
        }
        return temp;
    }

    //Stratz
    async function fetchMatchInfo(match_uri, retry) {
        try {
            //console.log("try " + match_uri);
            //const res = await fetch(match_uri, { headers });
            const res = await request(stratz_endpoint, match_uri, null, stratz_header);
            const data = res.player.matches;
            //console.log(data);
            let matches = [];
            for (let i = 0; i < data.length; i++) {
                let v = data[i].players[0];
                matches.push({
                    "match_id": v.matchId,
                    "hero_id": v.heroId,
                    "result": v.isVictory
                })
            }
            //console.log(matches);
            return matches;
        } catch (error) {
            if (retry) {
                setTimeout(() => {
                    fetchMatchInfo(match_uri, true);
                }, 5000);
            } else {
                return [];
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
                    "match_id": v['match_id'],
                    "hero_id": v['hero_id'],
                    "result": (v['radiant_win'] === (v['player_slot'] < 128))
                })
            }

            return matches;
        } catch (error) {
            if (retry) {
                setTimeout(() => {
                    fetchMatchInfo_v2(match_uri, startTime, endTime, true);
                }, 5000);
            } else {
                return [];
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
                if (dataSource == 'Stratz') {
                    const _uri = match_query.replaceAll('STEAM_ID', x.id)
                        .replace('REQ_PARAM', `take:20, startDateTime:${x.startTime}, endDateTime:${x.endTime}`);
                    let tmp = await fetchMatchInfo(_uri, true);
                    concatTmp = concatTmp.concat(tmp);
                } else if (dataSource == 'OpenDota') {
                    let _uri = Match_API_URI_v2.replace('steamID', x.id)
                        + '?limit=20';
                    let tmp = await fetchMatchInfo_v2(_uri, x.startTime, x.endTime, true);
                    concatTmp = concatTmp.concat(tmp);
                } else if (dataSource == 'Mix' || dataSource == null){
                    const _uri = match_query.replaceAll('STEAM_ID', x.id)
                        .replace('REQ_PARAM', `take:20, startDateTime:${x.startTime}, endDateTime:${x.endTime}`);
                    let tmp = await fetchMatchInfo(_uri, true);
                    concatTmp = concatTmp.concat(tmp);
                    let _uri2 = Match_API_URI_v2.replace('steamID', x.id)
                        + '?limit=20';
                    let tmp2 = await fetchMatchInfo_v2(_uri2, x.startTime, x.endTime, true);
                    concatTmp = concatTmp.concat(tmp2);
                }
            }
            concatTmp = formatLog(concatTmp);
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
                let ret = null;
                if (dataSource == 'Stratz') {
                    const uri = match_query.replaceAll('STEAM_ID', steamID).replace('REQ_PARAM', `take:20, startDateTime:${startTime}`);
                    ret = await fetchMatchInfo(uri, false);
                } else if (dataSource == 'OpenDota') {
                    const uri = Match_API_URI_v2.replace('steamID', steamID)
                        + '?limit=20';
                    ret = await fetchMatchInfo_v2(uri, startTime, null, false);
                } else if (dataSource == 'Null' || dataSource == 'Mix'){
                    ret = [];
                    const uri = match_query.replaceAll('STEAM_ID', steamID).replace('REQ_PARAM', `take:20, startDateTime:${startTime}`);
                    let tmp = await fetchMatchInfo(uri, false);
                    ret = ret.concat(tmp);
                    const uri2 = Match_API_URI_v2.replace('steamID', steamID)
                        + '?limit=20';
                    let tmp2 = await fetchMatchInfo_v2(uri2, startTime, null, false);
                    ret = ret.concat(tmp2);
                }
                
                if (ret != null){
                    ret = formatLog(ret);
                    setBattleLog(ret);
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