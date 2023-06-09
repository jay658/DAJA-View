import React, {useEffect, useState, useRef} from 'react'
import ScrollToBottom from 'react-scroll-to-bottom'
import {updateChat} from '../store'
import { connect } from 'react-redux';

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const Chatroom = ({socket, username, room, otherUser, chats, updateChat, auth})=>{
  if(!otherUser) return null
  const [currentMessage, setCurrentMessage] = useState('')
  const thisChat = chats.find(chat=>(chat.user1Id === auth.id && chat.user2Id === otherUser.id) || (chat.user2Id === auth.id && chat.user1Id === otherUser.id))
  const [messageList, setMessageList] = thisChat?.messages?useState(JSON.parse(thisChat.messages)):useState([])

  const prevMessageList = usePrevious(messageList)
  const prevOtherUser = usePrevious(otherUser)
  const prevThisChat = usePrevious(thisChat)

  const sendMessage = async()=>{
    if(currentMessage !== ''){
      const messageData ={
        room,
        author:username,
        message:currentMessage,
        time: new Date(Date.now()).getHours() + ':' + new Date(Date.now()).getMinutes()
      }

      await socket.emit('send_message', messageData)
      console.log('message sent')
      setMessageList((list)=>[...list, messageData])
      setCurrentMessage('')
    }
  }
  
  useEffect(() => {
    if(prevMessageList !== messageList && messageList?.length) updateChat(messageList, otherUser)
    if(!prevThisChat?.messages && thisChat?.messages) setMessageList(JSON.parse(thisChat.messages))
    if(prevOtherUser  && (prevOtherUser !== otherUser)){
      thisChat?.messages?setMessageList(JSON.parse(thisChat.messages)):setMessageList([])
    }
  })

  useEffect(()=>{
    socket.on('receive_message', (data)=>{
      setMessageList((list)=>[...list, data])
      console.log('message received')
    })
  }, [socket])

  return(
    <>
      <div className='chat-window'>
        <div className='chat-header'>
          <p>{otherUser.username}</p>
        </div>
        <div className='chat-body'>
          <ScrollToBottom className='message-container'>
            {messageList?.map((message, idx)=>{
              return(
                <div 
                  key={idx}
                  className='message'
                  id={username === message.author? 'you' : 'other'}
                >
                  <div>
                    <div className='message-content'>
                      <p>{message.message}</p>
                    </div>
                    <div>
                      <p id='time'>{message.time} {message.author}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </ScrollToBottom>
        </div>
        <div className='chat-footer'>
          <input type='text' placeholder='Enter a message...' value={currentMessage} onChange={(ev)=>setCurrentMessage(ev.target.value)} onKeyPress={(ev)=>{ev.key ==='Enter' && sendMessage()}}></input>
          <button onClick={sendMessage} className={currentMessage !== ''?'greenButton':null}>&#9658;</button>
        </div>
      </div>
    </>
  )
}

const mapDispatch = (dispatch)=>{
  return{
    updateChat: (chat, otherUser) =>{
      dispatch(updateChat(chat, otherUser))
    }
  }
}

export default connect(state => state, mapDispatch)(Chatroom)