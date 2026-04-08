import React from "react";
import "../styles/layouts.css"

export default function MessageBubble({message,currentUser}){

return(

<div className={
message.sender===currentUser
? "bubble sent"
: "bubble received"
}>

{message.text}

</div>

)

}