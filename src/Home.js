import './App.css';
import { useRef, useState, useMemo, useEffect } from 'react';
import { defaultTheme, Provider, Flex } from '@adobe/react-spectrum';
import { TextField, ActionButton, Button, ComboBox, Form, Picker, Item, TimeField } from '@adobe/react-spectrum';
import { ActionGroup, Text, Tooltip, TooltipTrigger } from '@adobe/react-spectrum'
import { Time } from '@internationalized/date';
import { useCookies } from 'react-cookie';
import { useFilter } from 'react-aria';
import { useListData } from 'react-stately'

import Copy from '@spectrum-icons/workflow/Copy'
import Edit from '@spectrum-icons/workflow/Edit'
import Delete from '@spectrum-icons/workflow/Delete'


const Home = () => {
    const [steamID, setSteamID] = useState('');
    const [savedAccKey, setSavedAccKey] = useState(null);
    const [alias, setAlias] = useState('');
    const [title, setTitle] = useState('今日战绩');
    const [startDate, setStartDate] = useState('today');
    const [startTime, setStartTime] = useState(new Time('18', '00'));
    const [textColor, setTextColor] = useState('#ffffff');
    const [targetUrl, setTargetUrl] = useState("");

    const [lastLink, setLastLink] = useState("");
    const [dataSource, setDataSource] = useState("OpenDota");

    const [cookies, setCookie] = useCookies(['SavedAccount']);
    const [cookieFlag, setCookieFlag] = useState(false);
    let isSteamIDValid = useMemo(
        () => /^\d+$/.test(steamID),
        [steamID]
    );
    const savedAccList = useListData({
        initialItems: cookies.SavedAccount || [],
        initialSelectedKeys:  [''],
        getKey: item => item.id
      });
    const [showAll, setShowAll] = useState(false);
    let { startsWith } = useFilter({ sensitivity: 'base' });
    let filteredItems = useMemo(
        () => savedAccList.items.filter((item) => startsWith(item.id, steamID)),
        [savedAccList, steamID]
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

        let lastLinkField = '';

        if (lastLink !== '') {
            let tmp = Object.assign({}, ...lastLink.split('?')[1].split('&').map((x) => {
                let _ = x.split("=");
                return ({ [_[0]]: _[1] });
            }));
            if ("lastLink" in tmp) {
                lastLinkField = decodeURIComponent(tmp['lastLink']) + '#';
            }
            lastLinkField = lastLinkField +
                + tmp.steamID + '+'
                + tmp.startTime + '+'
                + parseInt(Date.now() / 1000);
            //console.log(lastLinkField);
            lastLinkField = encodeURIComponent(lastLinkField);
        }
 
        setTargetUrl('https://piffnp.github.io/BattleLog/#/obs?'
            + 'steamID=' + steamID
            + '&title=' + encodeURIComponent(title)
            + '&startTime=' + t
            + '&textColor=' + encodeURIComponent(textColor)
            + '&dataSource=' + dataSource
            + (lastLinkField !== '' ? '&lastLink=' + lastLinkField : '')
        );
        //console.log(targetUrl);
    }

    const copyLink = (e) => {
        urlRef.current.focus();
        urlRef.current.select();
        navigator.clipboard.writeText(targetUrl);
    }

    useEffect(() => {
        setCookie('SavedAccount', savedAccList.items, {maxAge: 31536000});
        setCookieFlag(true);
    }, [cookieFlag]);

    return (
        <Provider theme={defaultTheme}>
            <div className="home">
                <div className="create">
                    <Flex direction="column" width="size-4600" gap="size-100">
                        <Form
                            labelPosition="top"
                            labelAlign="start"
                            onSubmit={handleSubmit}>
                            
                            <ComboBox
                                onOpenChange={(isOpen, menuTrigger) => {
                                    if (menuTrigger === 'manual' && isOpen) {
                                        setShowAll(true);
                                    }
                                }}
                                label="Steam ID"
                                items={showAll ? savedAccList.items : filteredItems}
                                selectedKey={savedAccKey}
                                inputValue={steamID}
                                onInputChange={(value) => {
                                    setShowAll(false);
                                    setSteamID(value);
                                    //setSavedAccKey((prevKey) => 
                                    //    (value === '' ? null : prevKey)
                                    //)
                                    setSavedAccKey(null); 
                                }}
                                onSelectionChange = {(key) => {
                                    if(key != null){
                                        let v = savedAccList.getItem(key);
                                        setSteamID(v?.id ?? '');
                                        setAlias(v?.alias ?? '');
                                    }
                                    setSavedAccKey(key);
                                    //console.log(savedAccKey + ' ' + steamID)
                                }}
                                validationState={isSubmitting ? (isSteamIDValid ? 'valid' : 'invalid') : null}
                                errorMessage={steamID === ''
                                    ? 'Steam ID 不能为空'
                                    : 'Steam ID 为纯数字'}
                                isRequired
                                allowsCustomValue
                            >
                                {(item) => <Item key={item.id} textValue={item.id}>
                                    {item.id + (item.alias === '' ? ' ' : ' (' + item.alias + ')')}
                                </Item>}
                            </ComboBox>

                            <Flex
                                direction="row"
                                gap="size-100"
                                justifyContent="space-between"
                                alignItems="end">
                                <TextField
                                    width='80%'
                                    label="账号备注"
                                    value={alias}
                                    onChange={setAlias}
                                />

                                <ActionGroup
                                    overflowMode="collapse"
                                    buttonLabelBehavior="hide"
                                    onAction={(btn_key) => {
                                        setIsSubmitting(true);
                                        if(!isSteamIDValid)
                                            return;
                                        if (btn_key === 'edit') {
                                            //Check whether the current SteamID has been added to the list before
                                            if (savedAccList.getItem(steamID)) {
                                                savedAccList.update(steamID, { id: steamID, alias: alias })
                                                //console.log("update");
                                            } else {
                                                savedAccList.append({ id: steamID, alias: alias });
                                                //console.log("append");
                                            }
                                        } else if (btn_key === 'del'){
                                            if (savedAccList.getItem(steamID)) {
                                                savedAccList.remove(steamID);
                                                //console.log("del");
                                            }
                                        }
                                        setCookieFlag(false);
                                    }}
                                >
                                    <Item key="edit">
                                        <Edit />
                                        <Text>添加/编辑账号记录</Text>
                                    </Item>
                                    <Item key="del">
                                        <Delete />
                                        <Text>删除账号记录</Text>
                                    </Item>
                                </ActionGroup>
                            </Flex>
                            

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
                                    width="40%"                                  
                                    value={startTime}
                                    onChange={setStartTime}
                                    isRequired/>
                            </Flex>

                            <label>数据源</label>
                            
                            <Flex 
                                direction="row"
                                gap="size-100"
                                justifyContent="space-between">
                                
                                <Picker
                                    width="100%"
                                    selectedKey={dataSource}
                                    onSelectionChange={(selected) => setDataSource(selected)}
                                    isRequired>
                                    <Item key="Stratz">Stratz</Item>
                                    <Item key="OpenDota">OpenDota</Item>
                                </Picker>
                            </Flex>

                            <TextField 
                                label="多段索引链接"
                                value={lastLink}
                                onChange={setLastLink}
                                />

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
                            <TooltipTrigger>
                                <ActionButton onPress={copyLink} aria-label="Copy link">
                                    <Copy />
                                </ActionButton>
                                <Tooltip>拷贝到剪贴板</Tooltip>
                            </TooltipTrigger>
                        </Flex>
                    </Flex>
                </div>
            </div>
        </Provider>
    );
}

export default Home;