const START_CASH=1000000;
const stocks=[
 {id:"7203",name:"トヨタ自動車",price:2850,change:1.2,sector:"自動車・輸送用機器"},
 {id:"6758",name:"ソニーグループ",price:3420,change:-0.8,sector:"エンタメ・電機"},
 {id:"9984",name:"ソフトバンクグループ",price:9100,change:2.1,sector:"投資・通信"},
 {id:"8306",name:"三菱UFJ FG",price:1560,change:0.5,sector:"銀行"},
 {id:"7974",name:"任天堂",price:8200,change:-1.1,sector:"ゲーム・娯楽"}
];
const yen=n=>"¥"+Math.round(n).toLocaleString("ja-JP");
const load=()=>{try{return JSON.parse(localStorage.getItem("stocklab-state"))||{cash:START_CASH,holdings:{},history:[]}}catch{return{cash:START_CASH,holdings:{},history:[]}}};
let state=load();
function save(){localStorage.setItem("stocklab-state",JSON.stringify(state));render()}
function toast(msg){const el=document.querySelector("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
function assets(){return state.cash+Object.entries(state.holdings).reduce((s,[id,h])=>s+(stocks.find(x=>x.id===id)?.price||0)*h.qty,0)}
function trade(id,side){const stock=stocks.find(x=>x.id===id);const holding=state.holdings[id]?.qty||0;const qty=Number(prompt(stock.name+" の"+(side==="buy"?"購入":"売却")+"株数を入力してください（1株単位）","10"));if(!Number.isInteger(qty)||qty<=0){toast("株数を正しく入力してください");return}const amount=qty*stock.price;if(side==="buy"){if(amount>state.cash){toast("仮想現金が不足しています");return}state.cash-=amount;state.holdings[id]={qty:holding+qty}}else{if(qty>holding){toast("保有株数が不足しています");return}state.cash+=amount;state.holdings[id]={qty:holding-qty};if(!state.holdings[id].qty)delete state.holdings[id]}state.history.unshift({id,side,qty,amount,time:new Date().toLocaleString("ja-JP")});state.history=state.history.slice(0,20);save();toast("仮想取引を記録しました")}
function render(){const total=assets(),pl=total-START_CASH;document.querySelector("#totalAssets").textContent=yen(total);document.querySelector("#profitLoss").textContent=(pl>=0?"+":"")+yen(pl);document.querySelector("#profitLoss").className=pl>=0?"positive":"negative";document.querySelector("#profitRate").textContent="開始時から "+(pl/START_CASH*100).toFixed(2)+"%";document.querySelector("#cash").textContent=yen(state.cash);document.querySelector("#holdingCount").textContent=Object.keys(state.holdings).length;
document.querySelector("#stockRows").innerHTML=stocks.map(s=>`<tr><td>${s.name}<span class="symbol">${s.id} · ${s.sector}</span></td><td>${yen(s.price)}</td><td class="${s.change>=0?"positive":"negative"}">${s.change>=0?"+":""}${s.change.toFixed(1)}%</td><td><button class="buy" data-buy="${s.id}">購入</button></td></tr>`).join("");
document.querySelector("#holdings").innerHTML=Object.keys(state.holdings).length?Object.entries(state.holdings).map(([id,h])=>{const s=stocks.find(x=>x.id===id);return `<div class="holding-row"><div><strong>${s.name}</strong><small>${h.qty}株 · 評価額 ${yen(h.qty*s.price)}</small></div><button class="sell" data-sell="${id}">売却</button></div>`}).join(""):'<div class="empty">まだ銘柄を保有していません。マーケットから購入できます。</div>';
document.querySelector("#history").innerHTML=state.history.length?state.history.map(x=>{const s=stocks.find(v=>v.id===x.id);return `<div class="history-row"><div><strong class="${x.side==="buy"?"positive":"negative"}">${x.side==="buy"?"購入":"売却"} · ${s.name}</strong><small>${x.time} · ${x.qty}株</small></div><strong>${yen(x.amount)}</strong></div>`}).join(""):'<div class="empty">取引履歴はまだありません。</div>'}
document.querySelector("#stockRows").addEventListener("click",e=>{const id=e.target.dataset.buy;if(id)trade(id,"buy")});
document.querySelector("#holdings").addEventListener("click",e=>{const id=e.target.dataset.sell;if(id)trade(id,"sell")});
const select=document.querySelector("#analysisStock");select.innerHTML=stocks.map(s=>`<option value="${s.id}">${s.name}（${s.id}）</option>`).join("");
document.querySelector("#analyze").addEventListener("click",()=>{const s=stocks.find(x=>x.id===select.value);document.querySelector("#analysisResult").innerHTML=`<strong>${s.name}：調べるべきポイント</strong><ul><li><b>事業：</b>${s.sector}で何を販売し、どこから利益を得ているか。</li><li><b>業績：</b>売上高・営業利益・純利益の過去数年の推移。</li><li><b>財務：</b>自己資本比率、営業キャッシュフロー、有利子負債。</li><li><b>評価：</b>PER・PBRを同業他社や過去水準と比較。</li><li><b>リスク：</b>為替、競争環境、規制、景気変動など。</li></ul><span class="note">これは調査項目の学習ガイドです。最新の企業情報を取得した分析・売買推奨ではありません。</span>`});
document.querySelector("#reset").addEventListener("click",()=>{if(confirm("仮想資産・保有銘柄・取引履歴をすべてリセットしますか？")){state={cash:START_CASH,holdings:{},history:[]};save();toast("シミュレーションを初期化しました")}});
render();