type AdminUser={id:number;name:string;email:string;is_admin:boolean;permissions:string[]};
export function useAdminApi(){
 const config=useRuntimeConfig();
 const token=useState<string>('admin-token',()=> '');
 const user=useState<AdminUser|null>('admin-user',()=>null);
 const ready=useState<boolean>('admin-auth-ready',()=>false);
 const hydrate=()=>{if(import.meta.client&&!ready.value){token.value=localStorage.getItem('admin-token')||'';ready.value=true;}};
 const clear=()=>{token.value='';user.value=null;if(import.meta.client)localStorage.removeItem('admin-token');};
 const can=(permission:string)=>!!user.value&&(user.value.is_admin||user.value.permissions.includes('*')||user.value.permissions.includes(permission));
 const request=async <T=any>(path:string,options:any={}):Promise<T>=>{
  hydrate();
  const headers:any={Accept:'application/json',...(options.headers||{})};
  if(token.value)headers.Authorization=`Bearer ${token.value}`;
  try{return await $fetch<T>(`${config.public.apiBase}${path}`,{...options,headers});}
  catch(e:any){if(e?.status===401&&path!=='/admin/login'){clear();if(import.meta.client&&useRoute().path!=='/auth/login')await navigateTo('/auth/login');}throw e;}
 };
 const login=async(email:string,password:string)=>{
  const result=await request<{token:string;user:AdminUser}>('/admin/login',{method:'POST',body:{email,password}});
  token.value=result.token;user.value=result.user;
  if(import.meta.client)localStorage.setItem('admin-token',result.token);
  return result.user;
 };
 const loadMe=async()=>{hydrate();if(!token.value)return null;const result=await request<{user:AdminUser}>('/admin/me');user.value=result.user;return result.user;};
 const logout=async()=>{
  hydrate();
  try{if(token.value)await request('/admin/logout',{method:'POST'});}
  catch{/* Clear the browser session even when the API cannot be reached. */}
  finally{clear();if(import.meta.client)await navigateTo('/auth/login',{replace:true});}
 };
 return {request,token,user,ready,hydrate,clear,can,login,loadMe,logout};
}
