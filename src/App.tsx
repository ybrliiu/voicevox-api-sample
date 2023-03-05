import React, { ChangeEvent, createContext, useContext, useState } from 'react';
import superagent from 'superagent';
import './App.css';

const MessagesContext = createContext<Message[]>([]);

type Message = {
  role: 'bot' | 'user',
  content: string,
};

function Messages() {
  const messagesStyle = {
    height: '500px',
    width: '500px',
  };
  const messages = useContext(MessagesContext);

  return (
    <div style={ messagesStyle }>
      { messages.map((message, i) => {
          return message.role === 'user'
            ? <div key={i}>あなた: { message.content }</div>
            : <div key={i}>春日部つむぎ: { message.content }</div>
      }) }
    </div>
  );
}

const App = () => {
  const [inputText, setInputText] = useState<string>('');
  const messages = useContext(MessagesContext);

  const sendText = async () => {

    if (!inputText) {
      return;
    }

    messages.push({
      role: 'user',
      content: inputText,
    });
    setInputText('');

    const res = await superagent
      .post('http://localhost:5000/')
      .query({ text: inputText })
      .responseType('blob');
    
    console.log(res.headers);
    console.log(res.header);
    console.log(res);
    
    const blob = res.body as Blob;
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
