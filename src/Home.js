import './App.css';
import {useRef, useState} from 'react';
const Home = () => {
    const [steamID, setSteamID] = useState('');
    const [title, setTitle] = useState('今日战绩');
    const [startDate, setStartDate] = useState(0);
    const [startTime, setStartTime] = useState('18:00');
    const [textColor, setTextColor] = useState('#ffffff');
    const [targetUrl, setTargetUrl] = useState("");
    const urlRef = useRef();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const d = new Date();
        const [h, m] = startTime.split(':');
        d.setHours(h);
        d.setMinutes(m);

        let t = parseInt(d.getTime() / 1000);
        t = t + parseInt(startDate) * 60 * 60 * 24;

        setTargetUrl('https://piffnp.github.io/BattleLog/#/obs?'
            + 'steamID=' + steamID + '&'
            + 'title=' + encodeURIComponent(title) + '&'
            + 'startTime=' + t + '&'
            + 'textColor=' + encodeURIComponent(textColor)
        );
    }

    const copyLink = (e) => {
        urlRef.current.select();
        //urlRef.select();
        navigator.clipboard.writeText(targetUrl);
    } 

    return (
        <div className="home">
            <div className="create">
                <form onSubmit={handleSubmit}>
                    <label>Steam ID</label>
                    <input
                        type="text"
                        required
                        autoComplete="true"
                        value={steamID}
                        onChange={(e) => setSteamID(e.target.value)} />
                    <label>标题</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} />
                    <label>记录起始时间</label>
                    <wrapper>
                        <select
                            style={{display:'inline-block', width:'30%'}}
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}>
                                <option value='0'>今天</option>
                                <option value='-1'>昨天</option>
                        </select>
                        <input
                            style={{display:'inline-block', width:'65%'}}
                            type="time"
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)} />
                    </wrapper>
                    <label>字体颜色</label>
                    <input
                        type="color"
                        required
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)} />
                    <button>生成链接</button>
                </form>
                <p>复制下方链接，在 OBS 源中以「浏览器」源添加即可</p>
                <input
                    type="text"
                    value={targetUrl}
                    readonly
                    ref={urlRef}/>
                <button onClick={copyLink}>拷贝链接</button>
            </div>
        </div>
    );
  }
   
  export default Home;