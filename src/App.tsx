import React, { ChangeEvent, useState } from 'react'
import superagent from 'superagent'
import './App.css'

// Query型定義
type Mora = {
  text: string
  consonant: string
  consonant_length: number
  vowel: string
  vowel_length: number
  pitch: number
}

type Query = {
  accent_phrases: {
      moras: Mora[]
      accent: number
      pause_mora: Mora
  }
  speedScale: number
  pitchScale: number
  intonationScale: number
  volumeScale: number
  prePhonemeLength: number
  postPhonemeLength: number
  outputSamplingRate: number
  outputStereo: boolean
  kana: string
};

const App = () => {
  const [inputText, setInputText] = useState<string>('');

  const createQuery = async () => {
    const queryResponse = await superagent
      .post('http://localhost:50021/audio_query')
      .query({ speaker: 8, text: inputText });
    const query = queryResponse.body as Query;

    const res = await superagent
      .post('http://localhost:50021/synthesis')
      .query({ speaker: 8 })
      .send(query)
      .responseType('blob');
    const blob = res.body as Blob;

    const audiocontext = new AudioContext;
    const audioBuffer = await audiocontext.decodeAudioData(await blob.arrayBuffer());
    const source = audiocontext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audiocontext.destination);
    source.start();
  }

  return (
    <div>
      <div>
        <h2>読み上げたい文章を入力</h2>
        <textarea 
          value={inputText}
          onChange={
            (e: ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)
          }
        />
        { inputText ? (<button onClick={createQuery}>生成</button>) : null }
      </div>
    </div>
  )
}

export default App
