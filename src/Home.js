import './App.css';
import { useRef, useState, useMemo } from 'react';
import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { TextField, ActionButton, Button, Form, Picker, Item, TimeField } from '@adobe/react-spectrum';
import { Flex } from '@adobe/react-spectrum';
import { Time } from '@internationalized/date';


import Copy from '@spectrum-icons/workflow/Copy'

const Home = () => {
    const [steamID, setSteamID] = useState('');
    const [title, setTitle] = useState('今日战绩');
    const [startDate, setStartDate] = useState('today');
    const [startTime, setStartTime] = useState(new Time('18', '00'));
    const [textColor, setTextColor] = useState('#ffffff');
    const [targetUrl, setTargetUrl] = useState("");

    let isSteamIDValid = useMemo(
        () => /^\d+$/.test(steamID),
        [steamID]
    );
    const [isSubmitting, setIsSubmitting] = useState(false)

    const urlRef = useRef();

    const handleSubmit = (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        if(!isSteamIDValid)
            return;

        const d = new Date();
        
        const [h, m] = [startTime.hour, startTime.minute];
        d.setHours(h);
        d.setMinutes(m);

        let t = parseInt(d.getTime() / 1000);
        t = t + (startDate === 'today' ? 0: -1) * 60 * 60 * 24;

        setTargetUrl('https://piffnp.github.io/BattleLog/#/obs?'
            + 'steamID=' + steamID + '&'
            + 'title=' + encodeURIComponent(title) + '&'
            + 'startTime=' + t + '&'
            + 'textColor=' + encodeURIComponent(textColor)
        );
    }

    const copyLink = (e) => {
        urlRef.current.focus();
        urlRef.current.select();
        navigator.clipboard.writeText(targetUrl);
    }

    return (
        <Provider theme={defaultTheme}>
            <div className="home">
                <div className="create">
                    <Flex direction="column" width="size-3000" gap="size-100">
                        <Form
                            labelPosition="top"
                            labelAlign="start"
                            onSubmit={handleSubmit}>
                            
                            <TextField 
                                label="Steam ID"
                                value={steamID}
                                onChange={setSteamID}
                                validationState={isSubmitting ? (isSteamIDValid ? 'valid' : 'invalid') : null}
                                errorMessage={steamID === ''
                                    ? 'Steam ID 不能为空'
                                    : 'Steam ID 为纯数字'}
                                isRequired/>

                            <TextField 
                                label="标题"
                                value={title}
                                onChange={setTitle}
                                />
                            
                            <label>记录起始时间</label>
                            
                            <Flex 
                                direction="row"
                                gap="size-100"
                                justifyContent="space-between">
                                
                                <Picker
                                    width="40%"
                                    selectedKey={startDate}
                                    onSelectionChange={(selected) => setStartDate(selected)}
                                    isRequired>
                                    <Item key="today">今天</Item>
                                    <Item key="yesterday">昨天</Item>
                                </Picker>
                                <TimeField
                                    width="20%"                                  
                                    value={startTime}
                                    onChange={setStartTime}
                                    isRequired/>
                            </Flex>

                            <label>字体颜色</label>

                            <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                style={{padding: "6px 10px",
                                    margin: "10px 0",
                                    borderRadius: "4px",
                                    border: "1px solid #909090",
                                    background: "#fff"
                                }}/>
                            
                            <Button
                                variant="accent"
                                type="submit">
                                生成链接
                            </Button>
                        </Form>
                        <span style={{textAlign: "left", color: "#666"}}>复制下方链接，在 OBS 源中以「浏览器」源添加即可</span>
                        <Flex 
                            direction="row"
                            gap="size-100"
                            justifyContent="space-between"
                            alignItems="center">
                            <TextField
                                width="100%"
                                value={targetUrl}
                                isReadOnly
                                ref={urlRef} />
                            <ActionButton onPress={copyLink} aria-label="Copy link">
                                <Copy />
                            </ActionButton>
                        </Flex>
                    </Flex>
                </div>
            </div>
        </Provider>
    );
}

export default Home;