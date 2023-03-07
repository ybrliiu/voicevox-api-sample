import React, { ChangeEvent, createContext, useContext, useReducer, useState } from 'react';
import superagent from 'superagent';
import './App.css';

type Message = {
  role: 'bot' | 'user',
  content: string,
};

const MessagesContext = createContext<Message[]>([]);

function Messages() {
  const messagesStyle = {
    height: '500px',
    width: '500px',
  };

  return (
    <div style={ messagesStyle }>
      { useContext(MessagesContext).map((message, i) => {
          return message.role === 'user'
            ? <div key={i}>あなた: { message.content }</div>
            : <div key={i}>春日部つむぎ: { message.content }</div>
      }) }
    </div>
  );
}

const App = () => {
  const [inputText, setInputText] = useState<string>('');
  const [messages, pushMessages] = useReducer(function (prevMessages: Message[], newMessage: Message): Message[] {
    return [ ...prevMessages, newMessage ];
  }, []);

  const sendText = async () => {

    if (!inputText) {
      return;
    }

    pushMessages({
      role: 'user',
      content: inputText,
    });
    setInputText('');

    const responseText = await (async () => {
      const res = await superagent
        .post('http://localhost:5000/talk')
        .query({ text: inputText });
      console.log(res);
      return res.text;
    })();
    
    const blob = await (async () => {
      const res = await superagent
        .post('http://localhost:5000/generate-voice')
        .query({ serif: responseText })
        .responseType('blob');
      return res.body;
    })() as Blob;
 
    pushMessages({
      role: 'bot',
      content: responseText,
    });

    const audiocontext = new AudioContext();
    const audioBuffer = await audiocontext.decodeAudioData(await blob.arrayBuffer());
    const source = audiocontext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audiocontext.destination);
    source.start();
  }

  return (
    <div>
      <div>
        <h2>春日部つむぎとおしゃべり</h2>
        <MessagesContext.Provider value={messages}>
          <Messages />
        </MessagesContext.Provider>
        <textarea 
          value={inputText}
          onChange={
            (e: ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)
          }
        />
        <button onClick={sendText}>送信</button>
      </div>
    </div>
  )
}

export default App
