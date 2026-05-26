let prompt=document.querySelector("#prompt")
let submitbtn=document.querySelector("#submit")
let chatContainer=document.querySelector(".chat-container")
let imagebtn=document.querySelector("#image")
let image=document.querySelector("#image img")
let imageinput=document.querySelector("#image input")

const Api_Url="";
let user={     
    message:null,
    file:{
         mime_type:null,
         data:null
    }

}
async function generateResponse(aiChatBox) {

    let text=aiChatBox.querySelector(".ai-chat-area")
    const parts=[{text:user.message}]

    if(user.file.data){
        parts.push({inline_data:user.file})
    }

    let RequestOption={
        method:"POST",
        headers:{'Content-Type': 'application/json'},
        body:JSON.stringify({
            contents:[
                {parts}
            ]
        })
    }
    try{
       let response= await fetch(Api_Url,RequestOption)

       if(!response.ok){
            const errorText=await response.text()
            throw new Error(errorText || `Request failed with status ${response.status}`)
       }

       let data=await response.json()
       const apiResponse=data?.candidates?.[0]?.content?.parts
            ?.map((part)=>part.text)
            .filter(Boolean)
            .join("\n")
            ?.replace(/\*\*(.*?)\*\*/g,"$1")
            .trim()

       if(!apiResponse){
            throw new Error("No valid response received from API")
       }

       text.innerHTML=apiResponse
       console.log(apiResponse);
    }
    catch(error){
        console.error(error)
        text.innerHTML="Sorry, I couldn't generate a response right now."
    }
    finally{
        chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})
        image.src=`img.svg`
        image.classList.remove("choose")
        user.file={
            mime_type:null,
            data:null
        }
    }

    
    
}
function createChatBox(html,classes){
    let div=document.createElement("div")
    div.innerHTML=html
    div.classList.add(classes)
    return div
}


function handlechatResponse(userMessage){
    user.message=userMessage
    let html=` <img src="user.png" alt="" id="userImage" width="8%">
            <div class="user-chat-area">
                ${user.message}
                ${user.file.data?`<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg"/>`:""}

            </div>`
            prompt.value=""
            let userChatBox=createChatBox(html,"user-chat-box")
            chatContainer.appendChild(userChatBox)

            chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})

            setTimeout(()=>{
                let html=`<img src="ai.png" alt="" id="aiImage" width="10%">
            <div class="ai-chat-area"> 
            <img src="loading.gif" alt="" class="load" width="50px"> 
            </div>`
            let aiChatBox=createChatBox(html,"ai-chat-box")
            chatContainer.appendChild(aiChatBox)
            generateResponse(aiChatBox)



            },600)

            }


prompt.addEventListener("keydown",(e)=>{
    if(e.key=="Enter"){
        handlechatResponse(prompt.value)

    }


})

submitbtn.addEventListener("click",()=>{
    handlechatResponse(prompt.value)
})
imageinput.addEventListener("change",()=>{
    const file=imageinput.files[0]
    if(!file) return
    let reader=new FileReader()
    reader.onload=(e)=>{
        let base64string=e.target.result.split(",")[1]
        user.file={
            mime_type:file.type,
            data:base64string
        }
        image.src=`data:${user.file.mime_type};base64,${user.file.data}`
        image.classList.add("choose")
    }
   
    reader.readAsDataURL(file)
})

imagebtn.addEventListener("click",()=>{
    imagebtn.querySelector("input").click()
})
