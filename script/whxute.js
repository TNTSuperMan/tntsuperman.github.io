(async()=>{
    let root = document.querySelector("html").getRootNode(); //クレジット表記コメントを付ける
    root.prepend(document.createComment("https://github.com/TNTSuperMan/Whxute.js"));
    root.prepend(document.createComment("Powered by Whxute.js by TNTSuperMan."));

    //#region wtsetting.jsonの読み込み
    const err=e=>{alert("Whxute.js エラー：" + e);throw e};
    const wtsetting = "wtsetting.json";
    const wtsf = await fetch(wtsetting,{cache:"no-store"});
    if(!wtsf.ok){
        alert("Whxute.js エラー: \"" + wtsetting + "\"にアクセスできません\n")
              return;
    }
    let wts = {}; //設定情報
    try{
        wts = JSON.parse(await wtsf.text());
    }
    catch{
        err("\"" + wtsetting + "\"の記述が不正です。");
    }
    let wep = [];
    const wns = m => wep.push(m); //エラーダイアログの項目の追加関数
    if(wts.pagestruct == undefined) wns("pagestruct");
    if(wts.temp == undefined) wns("temp"); 
    if(wts.icon == undefined) {
        alert("wtsetting.jsonで設定\"icon\"が欠如しています。\n重要性は低いため続行します。");
    }
    if(wts.plugin == undefined) {
        alert("wtsetting.jsonで設定\"plugin\"が欠如しています。\n重要性は低いため続行します。");
    }
    if(wts.pagepath == undefined) wns("pagepath"); else{
        if(wts.pagepath.first == undefined) wns("pagepath.first");
        if(wts.pagepath.last == undefined) wns("pagepath.last");
    }
    
    if(wep.length != 0){
        let res = "\"" + wtsetting + "\"で以下の設定が欠如しています。\n";
        wep.forEach(e=>{
            res += e + "\n";
        });
        err(res);
    }
    f = wts.pagepath;
    //#endregion

    //#region テンプレ読込
    const temp = new Promise(r=>r(wts.temp))
        .then(rto=>{
            let ret = {base:[],name:[]};
            rto.forEach(e=>{ret.base.push(e.base);ret.name.push(e.name)});
            return ret;
            }).catch(e=>4545);
    //#endregion

    //#region ページファイル読み込み
    let pf = [];
    let pfe = [];
    let pfi = [];
    wts.pagestruct.forEach(e=>{
        let pass = e.default;
        if(e.id === "main"){
            let z = Object.fromEntries(new URLSearchParams(location.search));
            if(z.p != undefined){
                pass = f.first + z.p + f.last;
            }
        }
        let pe = document.createElement(e.ename);
        if(e.attr)e.attr.forEach(v=>pe.setAttribute(v.name,v.value));
        document.body.appendChild(pe);
        pfe.push(pe);
        if(e.id === "main") me = pe;
        pf.push(fetch(pass).then(e=>{
            if(!e.ok) return errpage;
            return e.text();
        }).catch(e=>errpage));
        pfi.push(e.id);
    });
    //#endregion

    //#region プラグインの読込
    let plugdata = [];
    wts.plugin.forEach(e=>{
        plugdata.push((async x=>{
            let ps = fetch(e + "/script.js");
            let pc = fetch(e + "/config.json");
            await Promise.all([ps,pc]);
            ps = await ps;
            pc = await pc;
            if(!ps.ok) {
                err("プラグインファイル \"" + e + "/script.js\"にアクセスできません。");
                return;
            }
            if(!pc.ok) {
                err("プラグイン設定ファイル \"" + e + "/config.json\"にアクセスできません。");
                return;
            }
            let pcjo;
            try {
                pcjo = JSON.parse(await pc.text())
            } catch (e) {
                err("プラグイン設定ファイル \"" + e + "/config.json\"の記述が不正です。");
                return;                
            }
            let rpd;
            try {
                rpd = await import(e + "/script.js");
            } catch (e) {
                err("プラグインファイル \"" + e + "/script.js\"の記述が不正です。");
                return;                
            }
            rpd.set(pcjo);
            switch(rpd.mode){
                case "text":
                    txtplug = rpd;
                    break;
            }
        })())
    })
    //#endregion

    //テンプレのエラー選別
    switch(await temp){
        case 4545:err("テンプレートファイル\"" + wts.tempfile + "\"の記述が不正です");
        default:template = await temp;
    }
    await Promise.all(plugdata);
    //#region ページ構築
    document.head.appendChild(document.createElement("title")); //タイトル要素
    Promise.all(pf).then(de=>pfe.forEach((ee,i)=>Whxute(de[i],ee,(pfi[i]==="main"?1:0))))
    .then(e=>{
        let get_arg = Object.fromEntries(new URLSearchParams(location.search));
        if(get_arg.s != undefined){
            document.documentElement.scrollTop += document.getElementById(get_arg.s).getBoundingClientRect().y;
    }});
    let si = document.createElement("link");
    let i = document.createElement("link");
    si.rel = "shortcut icon";
    i.rel = "icon";
    si.href = wts.icon;
    i.href = wts.icon;
    document.head.appendChild(si);
    document.head.appendChild(i);
    //#endregion
})();
let f; //wtsetting.json設定のpagepathを保存
let template = {base:[],name:[]}; //テンプレ保存
let txtplug;
let me; //メイン要素を保存
const errpage = "404\n:p:404 Not Found\n" + 
    ":p:ページファイルが存在しません。";
function l(id){ //ページ内移動
    history.replaceState('','',"?p=" + id);
    fetch(f.first + id + f.last)
        .then(e=>e.ok?e.text():errpage)
        .then(e=>Whxute(e,me,1))   
}
function textplugin(textarray){
    if(txtplug == null) return textarray;
    return txtplug.func(textarray)
}
function Whxute(text,elm,isMain){ //ファイルを変換 ＊今回のメイン＊
    let layerElem = [elm];
    let now_txtelem = null;
    let is_txtmode = false;
    const now_elem = e=>layerElem[layerElem.length-1]; 
    let is_native = false;
    let m;
    let st = text.split("\r").join('').split("\n");
    if(isMain){
        elm.innerHTML = "";
        document.querySelector("title").innerText = st[0];
    }
    st.forEach((p,i)=>{
        
        if(p[0] === '+') is_native = false;
        if(is_native) {
            now_elem().innerHTML += p + "\n";
            return;
        }

        if(p[0]!=='/' || p[1]==='/'){
            if(is_txtmode) layerElem.pop();
            is_txtmode = false;
        }
        if(p[0]!==':' && p[0]!=='='){
            now_txtelem = null;
        }
        switch(p[0]){
            case '/':
                if(p[1]==='/') break;
                if(!is_txtmode){
                    m = document.createElement("p");
                    now_elem().appendChild(m);
                    layerElem.push(m);
                    is_txtmode = true;
                } else now_elem().innerHTML += "<br>";

                m = p.split(""); m[0]=null;
                now_elem().innerHTML += m.join("");
                break;
            case ':':
                m = p.split(":");
                if(m.length < 3) break;
                m = textplugin(m);
                let m2 = document.createElement(m[1]);

                m2.innerHTML = m[2];
                now_txtelem = m2;

                now_elem().appendChild(m2);
                break;
            case '=':
                m = p.split('=');
                if(m.length < 3) break;
                m = textplugin(m);
                if(!now_txtelem){
                    now_elem().setAttribute(m[1],m[2]);
                }else{
                    now_txtelem.setAttribute(m[1],m[2]);
                }
                break;
            case '\\':
                m = p.split("\\");
                if(m.length < 2) break;
                m = textplugin(m);
                let ti = template.name.indexOf(m[1]);
                if(ti<0)break;
                let tt = template.base[ti];

                m.forEach((k,i)=>{
                    if(i < 2) return;
                    tt=tt.replace("%"+(i-1),k);
                })
                Whxute(tt,now_elem());
                break;
            case '&':
                m = p.split(""); m[0]=null;
                now_elem().innerHTML += m.join("");
                break;
            case '-':
                m = p.split("-");
                if(m.length < 2) break;

                let g = document.createElement(m[1]);
                now_elem().appendChild(g);

                layerElem.push(g);
                if(m.length > 2) if(m[2] === "DIRECT") is_native = true;
                break;
            case '+':
                is_native = false;
                layerElem.pop();
                break;
        }
    });
}