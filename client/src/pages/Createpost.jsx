import React from "react";
import {useState} from "react"
import api from "../api/api"
import Navbar from "../components/Navbar"

export default function CreatePost(){

const [form,setForm]=useState({
 title:"",
 description:"",
 type:"lend",
 company:"",
 image:null
})

const submit=async()=>{

const data=new FormData()

Object.keys(form).forEach(key=>{
 data.append(key,form[key])
})

await api.post("/listings",data)

}

return(

<div>

<Navbar active="post"/>

<div className="form-grid">

<div>

<input
placeholder="Title"
onChange={e=>setForm({...form,title:e.target.value})}
/>

<textarea
placeholder="Description"
onChange={e=>setForm({...form,description:e.target.value})}
/>

<input
type="file"
onChange={e=>setForm({...form,image:e.target.files[0]})}
/>

<button onClick={submit}>
Create Listing
</button>

</div>

<div className="preview"/>

</div>

</div>

)

}