import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionStatus} from 'genlayer-js/types';
import fs from 'node:fs';
const outdir='read-only-proof';fs.mkdirSync(outdir,{recursive:true});
const reader=createClient({chain:studionet});
const canonical=x=>typeof x==='string'?JSON.parse(x):x;
const cases=[
 {project:'WarrantyLens',address:'0xebe45565311A00A148e4469dF38aC6aB73eFdb89',caseId:'GNEW-warrantylens-39238668302',txHash:'0xe6e82b1e018874d8dc3e2e2c8a34f4ba3516f8bb4155c6689bba698591f37a39'},
 {project:'MilestoneProof',address:'0xD4AdDBe785176EfC96da0B371FfBa03C5ff6c0c9',caseId:'GNEW-milestoneproof-39238668302',txHash:'0xdc9b05ff3de393a708a41b4ff0926bdf5be997b4c118fc11f5f3c69834c45589'}
];
const result={type:'READ_ONLY_NO_NEW_TRANSACTIONS',time:new Date().toISOString(),cases:[]};
for(const row of cases){const item={...row};
 try{const receipt=await reader.waitForTransactionReceipt({hash:row.txHash,status:TransactionStatus.FINALIZED,fullTransaction:false,interval:3500,retries:3});item.receipt={status:receipt.status_name??receipt.statusName,result:receipt.result_name,leaderReceipts:(receipt.consensus_data?.leader_receipt??[]).map(x=>({execution:x.execution_result,stderr:String(x.genvm_result?.stderr??'').slice(-450)}))};}catch(e){item.receiptError=String(e).slice(0,650)}
 try{const c=canonical(await reader.readContract({address:row.address,functionName:'get_case',args:[row.caseId]}));item.canonical={status:c.status,result:c.result,round:c.round,attested:c.attested,challenge_count:c.challenges?.length,finalized_at:c.finalized_at,attestation_hash:c.attestation_hash,evidence_hash:c.evidence_hash,history_hash:c.history_hash}}catch(e){item.caseError=String(e).slice(0,650)}
 result.cases.push(item);fs.writeFileSync(outdir+'/reconciliation.json',JSON.stringify(result,null,2)+'\n');
 console.log('READ_ONLY_RECONCILED',row.project,JSON.stringify({receipt:item.receipt,case:item.canonical,receiptError:item.receiptError,caseError:item.caseError}));
}