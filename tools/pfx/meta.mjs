const ids=process.argv.slice(2);const out={};
for(const id of ids){const m=await import(process.cwd()+'/src/fx/'+id+'.js');out[id]={size:m.meta.size,origin:m.meta.origin,opts:m.meta.options}}
console.log(JSON.stringify(out));
