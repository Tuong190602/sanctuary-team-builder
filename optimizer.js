// Pure JS optimizer. Every output team is validated; no invalid team is published.
const shuffle = (xs, rng=Math.random) => [...xs].sort(()=>rng()-.5);
const sum = xs => xs.reduce((a,x)=>a+Number(x.power),0);
const uniqueOwners = xs => new Set(xs.map(x=>x.member_id)).size===xs.length;
const rank = x => x.power>=950?'super':x.power>=750?'strong':'normal';
const roleCounts = xs => Object.fromEntries(['heal','tank','chanter','dps'].map(r=>[r,xs.filter(x=>x.role===r).length]));
export function validateTeam(xs){
 if(xs.length!==10||!uniqueOwners(xs))return false;
 const c=roleCounts(xs); if(c.heal!==2||c.tank<1||c.tank>2||c.chanter<1||c.chanter>2)return false;
 return !!splitParties(xs);
}
export function splitParties(xs){
 if(xs.length!==10)return null;
 const heal=xs.filter(x=>x.role==='heal'), tank=xs.filter(x=>x.role==='tank'), chanter=xs.filter(x=>x.role==='chanter'), dps=xs.filter(x=>x.role==='dps');
 if(heal.length!==2||tank.length<1||tank.length>2||chanter.length<1||chanter.length>2)return null;
 let best=null, bestScore=-Infinity;
 // Enumerate all 5-person Party 1 sets with 1 heal and >=1 tank.
 for(let mask=0;mask<1024;mask++){
  if(popcount(mask)!==5)continue;
  const p1=xs.filter((_,i)=>mask&(1<<i)),p2=xs.filter((_,i)=>!(mask&(1<<i)));
  if(p1.filter(x=>x.role==='heal').length!==1||p2.filter(x=>x.role==='heal').length!==1||!p1.some(x=>x.role==='tank'))continue;
  const d1=sum(p1.filter(x=>x.role==='dps')),d2=sum(p2.filter(x=>x.role==='dps'));
  const c1=p1.some(x=>x.role==='chanter'),c2=p2.some(x=>x.role==='chanter');
  const chanterBonus=(d1>=d2?c1:c2)?10000:0;
  const score=chanterBonus-Math.abs(d1-d2)*.5-Math.abs(sum(p1)-sum(p2))*.12;
  if(score>bestScore){bestScore=score;best=[p1,p2];}
 }
 return best;
}
function popcount(n){let c=0;while(n){n&=n-1;c++;}return c;}
function sampleTeam(pool,mode,rng){
 const roles=['heal','tank','chanter','dps'];
 // Start with mandatory roles, then fill remaining positions while respecting class caps.
 const attempts=70;let best=null,bestScore=-Infinity;
 for(let t=0;t<attempts;t++){
  const picked=[],owners=new Set();
  const add=x=>{if(!x||owners.has(x.member_id))return false;picked.push(x);owners.add(x.member_id);return true;};
  const takeRole=(r,n)=>{for(let k=0;k<n;k++){const choices=shuffle(pool.filter(x=>x.role===r&&!owners.has(x.member_id)),rng);if(!choices.length)return false;add(choices[0]);}return true;};
  if(!takeRole('heal',2)||!takeRole('tank',1)||!takeRole('chanter',1))continue;
  const candidates=shuffle(pool.filter(x=>!owners.has(x.member_id)),rng).sort((a,b)=>{
   const score=x=>Number(x.power)+(x.role==='dps'?70:0);
   return score(b)-score(a)+(rng()-.5)*450;
  });
  for(const x of candidates){if(picked.length===10)break;if(owners.has(x.member_id))continue;
   const c=roleCounts(picked);if(x.role==='heal'||x.role==='tank'&&c.tank>=2||x.role==='chanter'&&c.chanter>=2)continue;
   add(x);
  }
  if(!validateTeam(picked))continue;
  const supers=picked.filter(x=>rank(x)==='super').length,strong=picked.filter(x=>rank(x)==='strong').length;
  const a=Math.abs(supers-2),b=Math.abs(strong-3);
  const penalty=mode==='super'?a:mode==='strong'?b:Math.min(a,b);
  const score=-penalty*1000+sum(picked)*.025+rng()*20;
  if(score>bestScore){best=picked;bestScore=score;}
 }
 return best;
}
export function optimize(characters,mode='auto',iterations=260){
 const eligible=characters.filter(x=>['heal','tank','chanter','dps'].includes(x.role)&&Number.isFinite(Number(x.power))&&Number(x.power)>=0);
 let best=[],bestScore=-Infinity;
 // Multiple randomized restarts, compare first on valid team count, then on balance.
 for(let it=0;it<iterations;it++){
  let remaining=shuffle(eligible),teams=[];
  while(remaining.length>=10){const group=sampleTeam(remaining,mode,Math.random);if(!group)break;
   const ids=new Set(group.map(x=>x.member_id));remaining=remaining.filter(x=>!ids.has(x.member_id));
   const parties=splitParties(group);if(!parties)break;
   teams.push({players:group,parties,total:sum(group),dps:sum(group.filter(x=>x.role==='dps'))});
  }
  const totals=teams.map(t=>t.total),dps=teams.map(t=>t.dps);
  const spread=arr=>arr.length?Math.max(...arr)-Math.min(...arr):0;
  const score=teams.length*1e7-spread(totals)*15-spread(dps)*12+
    teams.reduce((s,t)=>{const a=Math.abs(t.players.filter(x=>rank(x)==='super').length-2),b=Math.abs(t.players.filter(x=>rank(x)==='strong').length-3);return s-(mode==='super'?a:mode==='strong'?b:Math.min(a,b))*2500;},0);
  if(score>bestScore){bestScore=score;best=teams;}
 }
 const used=new Set(best.flatMap(t=>t.players.map(x=>x.member_id)));
 const reserve=eligible.filter(x=>!used.has(x.member_id));
 return {teams:best,reserve,info:best.length?`Tạo ${best.length} đội hợp lệ; ${new Set(reserve.map(x=>x.member_id)).size} người dự bị. Thuật toán thử ${iterations} phương án.`:'Không tạo được đội hợp lệ. Kiểm tra số người, 2 Heal/đội, Tank và Chanter.'};
}
