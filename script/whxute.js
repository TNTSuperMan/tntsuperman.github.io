(async()=>{
    //#region wtsetting.jsonの読み込み
    const err=e=>{alert("Whxute.js エラー：" + e);throw e};
    const wtsetting = "wtsetting.json";
    const wtsf = await fetch(wtsetting,{cache:"no-store"});
    if(!wtsf.ok){
        alert("Whxuto.js エラー: \"" + wtsetting + "\"にアクセスできません\n")
              return;
    }
    let wts = {};
    try{
        wts = JSON.parse(await wtsf.text());
    }
    catch{
        err("\"" + wtsetting + "\"の記述が不正です。");
    }
    let wep = [];
    const wns = m => wep.push(m);
    if(wts.pagestruct == undefined) wns("pagestruct");
    if(wts.tempfile == undefined) wns("tempfile"); 
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
    const temp = fetch(wts.tempfile,{cache:"no-store"})
        .then(e=>e.ok ? e.text() : 1919)
        .then(e=>{
            if(e===1919) throw 1919;
            const rto = JSON.parse(e);
            let ret = {base:[],name:[]};
            rto.forEach(e=>{ret.base.push(e.base);ret.name.push(e.name)});
            return ret;
            }).catch(e=>e===1919?1919:4545);
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

    //テンプレのエラー選別
    switch(await temp){
        case 1919:err("テンプレートファイル\"" + wts.tempfile + "\"にアクセスできません");
        case 4545:err("テンプレートファイル\"" + wts.tempfile + "\"の記述が不正です");
        default:template = await temp;
    }

    //#region ページ構築
    document.head.appendChild(document.createElement("title")); //タイトル要素
    Promise.all(pf).then(de=>pfe.forEach((ee,i)=>Whxute(de[i],ee,(pfi[i]==="main"?1:0))))
    .then(e=>{
        let z = Object.fromEntries(new URLSearchParams(location.search));
        if(z.s != undefined){
            document.documentElement.scrollTop += document.getElementById(z.s).getBoundingClientRect().y;
    }})
    //#endregion
})();
let f; //wtsetting.json設定のpagepathを保存
let template = {base:[],name:[]}; //テンプレ保存
let me; //メイン要素を保存
const errpage = "404\n:p:404 Not Found\n" + 
    ":p:ページファイルが存在しません。";
function l(id){ //ページ内移動
    history.replaceState('','',"?p=" + id);
    fetch(f.first + id + f.last)
        .then(e=>e.ok?e.text():errpage)
        .then(e=>Whxute(e,me,1))
    
}
function Whxute(c,e,ef){ //ファイルを変換 ＊今回のメイン＊
    let o = [e];
    let se = null;
    let pmode = false;
    const no = e=>o[o.length-1];
    let nf = false;
    let m;
    let st = c.split("\r").join('').split("\n");
    if(ef){
        e.innerHTML = "";
        document.querySelector("title").innerText = st[0];
    }
    st.forEach((p,i)=>{
        
        if(p[0] === '+') nf = false;
        if(nf) no().innerHTML += p + "\n";

        if(p[0]!=='/' || p[1]==='/'){
            if(pmode) o.pop();
            pmode = false;
        }
        if(p[0]!==':' && p[0]!=='='){
            se = null;
        }
        switch(p[0]){
            case '/':
                if(p[1]==='/') break;
                if(!pmode){
                    m = document.createElement("p");
                    no().appendChild(m);
                    o.push(m);
                    pmode = true;
                } else no().innerHTML += "<br>";
                m = p.split(""); m[0]=null;
                no().innerHTML += m.join("");
                break;
            case ':':
                m = p.split(":");
                if(m.length < 3) break;
                let m2 = document.createElement(m[1]);
                m2.innerHTML = m[2];
                se = m2;
                no().appendChild(m2);
                break;
            case '=':
                m = p.split('=');
                if(m.length < 3) break;
                if(!se){
                    no().setAttribute(m[1],m[2]);
                }else{
                    se.setAttribute(m[1],m[2]);
                }
                break;
            case '\\':
                m = p.split("\\");
                if(m.length < 2) break;
                let ti = template.name.indexOf(m[1]);
                if(ti<0)break;
                let tt = template.base[ti];
                m.forEach((k,i)=>{
                    if(i < 2) return;
                    tt=tt.replace("%"+(i-1),k);
                })
                Whxute(tt,no());
                break;
            case '&':
                m = p.split(""); m[0]=null;
                no().innerHTML += m.join("");
                break;
            case '-':
                m = p.split("-");
                if(m.length < 2) break;
                let g = document.createElement(m[1]);
                no().appendChild(g);
                o.push(g);
                if(m.length > 2) if(m[2] === "DIRECT") nf = true;
                break;
            case '+':
                nf = false;
                o.pop();
                break;
        }
    });
}