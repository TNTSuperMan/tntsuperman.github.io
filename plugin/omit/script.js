export const mode = "text";
export let config;
export function set(a){
    config = a;
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