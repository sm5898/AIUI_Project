import React from "react";
import {useEffect,useState} from "react"
import api from "../api/api"
import MessageBubble from "../components/Messagebubble"
import Navbar from "../components/Navbar"

export default function Messages(){


// MOCK DATA for frontend testing
const [messages, setMessages] = useState([
	{ _id: 1, sender: "userId", text: "Hello! This is your message." },
	{ _id: 2, sender: "otherUser", text: "Hi! This is a reply." },
	{ _id: 3, sender: "userId", text: "How are you?" },
	{ _id: 4, sender: "otherUser", text: "I'm good, thanks!" }
]);

// Comment out backend call for now
// useEffect(() => {
//   api.get("/messages")
//     .then(res => setMessages(res.data))
// }, [])

return(

<div>

<Navbar active="messages"/>

<div className="messages">

<div className="sidebar">

<h2>Conversations</h2>

</div>

<div className="chat">

{

messages.map(msg=>(

<MessageBubble
key={msg._id}
message={msg}
currentUser="userId"
/>

))

}

</div>

</div>

</div>

)

}