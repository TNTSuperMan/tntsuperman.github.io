export const mode = "text";
export const name = "omit"
let config
export async function init(path){
    config = await (await fetch("plugin/omit/config.json")).json()
}
export function func(e){
    const ryexp = /om[[\w+-.]+]/;
    let ret = Array();
    e.forEach(t=>{
        if(!ryexp.test(t)) {
            ret.push(t);
            return;
        }else{
            config.forEach(c=>{
                if(("om[" + c.id + "]") === t){
                    ret.push(c.data);
                    return;
                }
            })
        }
    })
    return ret;
};