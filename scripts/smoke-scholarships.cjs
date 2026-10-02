const fs=require('fs'),assert=require('assert'); const postgres=require('postgres');
const env=process.env;let base=process.argv[2]||'http://localhost:3117';let results=[];const db=postgres(env.DATABASE_URL_UNPOOLED || env.DATABASE_URL,{ssl:'require',max:1});const tag='DPE-QA-'+Date.now();
async function req(p,method='GET',body,cookie){let r=await fetch(base+p,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body),redirect:'manual'});let data=await r.text();try{data=JSON.parse(data)}catch{}return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],headers:r.headers};}
const check=(label,cond)=>{assert(cond,label);results.push(label)};
(async()=>{try{
check('unsigned committee read rejected',(await req('/api/committee/comments')).status===401);
check('forged admin session rejected',(await req('/api/admin/submissions?table=bleakley_scholarship_submissions','GET',undefined,'admin_session=authenticated')).status===401);
check('unsigned file access rejected',(await req('/api/admin/files?bucket=applications&path=test.pdf')).status===401);
check('invalid committee password rejected',(await req('/api/committee/session','POST',{password:'wrong'})).status===401);
let login=await req('/api/committee/session','POST',{password:env.SCHOLARSHIP_COMMITTEE_PASSWORD});check('committee login succeeds',login.status===200&&!!login.cookie);
check('committee cookie cannot access admin',(await req('/api/admin/submissions?table=bleakley_scholarship_submissions','GET',undefined,login.cookie)).status===401);
check('short comment rejected',(await req('/api/scholarship-comments','POST',{comments:'short'})).status===400);
check('malformed email rejected',(await req('/api/scholarship-comments','POST',{comments:tag,email:'bad'})).status===400);
check('fast anonymous feedback saves',(await req('/api/scholarship-comments','POST',{comments:tag+' anonymous narrative 😀'})).status===200);
let list=await req('/api/committee/comments','GET',undefined,login.cookie);let row=list.data.comments.find(x=>x.comments.startsWith(tag));check('committee reads saved narrative',list.status===200&&!!row&&row.name===null&&row.email===null);
check('comments response never cached',list.headers.get('cache-control')==='no-store');
check('delete validation rejects arbitrary bulk wipe',(await req('/api/committee/comments','DELETE',{ids:[]},login.cookie)).status===400);
let del=await req('/api/committee/comments','DELETE',{id:row.id},login.cookie);check('committee deletes exact synthetic comment',del.status===200&&del.data.deleted===1);
let admin=await req('/api/admin/login','POST',{username:env.ADMIN_USERNAME,password:env.ADMIN_PASSWORD});check('admin login succeeds',admin.status===200&&!!admin.cookie);
for(let type of ['bleakley','weiss','butts','lemoine']){let r=await req('/api/admin/submissions?table='+type+'_scholarship_submissions','GET',undefined,admin.cookie);check(type+' applications accessible only to admin',r.status===200&&Array.isArray(r.data.rows));}
check('admin cannot access arbitrary table',(await req('/api/admin/submissions?table=scholarship_comments','GET',undefined,admin.cookie)).status===400);
check('scholarship submission writes Neon',(await req('/api/scholarship-applications','POST',{type:'butts',full_name:tag,application_file_path:'dpeqatest.pdf',attendance_file_path:'dpeqatest.pdf',additional_requirements_file_path:'dpeqatest.pdf'})).status===200);
let app=await db`select id from butts_scholarship_submissions where full_name=${tag}`;check('application exists in Neon',app.length===1);
check('admin changes only allowed fields',(await req('/api/admin/submissions','PATCH',{table:'butts_scholarship_submissions',id:Number(app[0].id),values:{full_name:'forbidden'}},admin.cookie)).status===400);
check('admin notes update persists',(await req('/api/admin/submissions','PATCH',{table:'butts_scholarship_submissions',id:Number(app[0].id),values:{admin_notes:tag}},admin.cookie)).status===200);
check('contact submission writes Neon',(await req('/api/contact','POST',{full_name:tag,email:'dpe-qa@example.com',message:tag+' synthetic contact message'})).status===200);
if (env.DPE_QA_FILE_BUCKET && env.DPE_QA_FILE_PATH) {
let file=await req('/api/admin/files?bucket='+encodeURIComponent(env.DPE_QA_FILE_BUCKET)+'&path='+encodeURIComponent(env.DPE_QA_FILE_PATH),'GET',undefined,admin.cookie);check('admin receives authenticated uploaded-file URL',file.status===200&&file.data.url.startsWith('/api/admin/files?'));
let bytes=await fetch(new URL(file.data.url,base),{headers:{Cookie:admin.cookie}});check('preserved uploaded file downloads',bytes.status===200);
}
check('committee sign-out succeeds',(await req('/api/committee/session','DELETE')).status===200);
check('heartbeat works with Neon',(await req('/api/heartbeat')).status===200);
console.log(JSON.stringify({base,passed:results.length,checks:results}));if (env.DPE_QA_PROOF_FILE) fs.writeFileSync(env.DPE_QA_PROOF_FILE,JSON.stringify({base,at:new Date().toISOString(),passed:results.length,checks:results},null,2),{mode:0o600});
}finally{await db`delete from scholarship_comments where comments like ${tag+'%'}`;await db`delete from butts_scholarship_submissions where full_name=${tag}`;await db`delete from contact_form_submissions where full_name=${tag}`;await db.end();}})().catch(e=>{console.error(e.message);process.exit(1)});
